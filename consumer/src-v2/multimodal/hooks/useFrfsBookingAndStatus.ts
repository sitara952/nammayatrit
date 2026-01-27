import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useFrfsQuoteV2QuoteIdConfirmPostMutation } from '@/api/integrations/rtk/FrfsQuoteV2QuoteIdConfirmPost';
import { useFrfsBookingBookingIdStatusGetQuery } from '@/api/integrations/rtk/FrfsBookingBookingIdStatusGet';
import { fRFSTicketBookingStatusAPIRes } from '@/readOnly/api/types/FRFSTicketBookingStatusAPIRes.gen';
import { FRFSTicketBookingStatus_fRFSTicketBookingStatus } from '@/readOnly/api/types/Enums.gen';
import { createOrderResp } from '@/readOnly/api/types/CreateOrderResp.gen';
import { logger } from '@/src-v2/systems/logger';
import { createBookingId, selectUserId } from '@/typescript/state/client/user';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppReadableName, selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setHideLoader } from '@/typescript/state/client/session';
import { checkAndInitiatePayment } from '@/src-v2/utils/Payment';
import HyperSdkReact from 'hyper-sdk-react';
import { setStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { fRFSCategorySelectionReq } from '@/readOnly/api/types/FRFSCategorySelectionReq.gen';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

export interface UseFrfsBookingAndStatusParams {
    /** Quote ID to confirm */
    quoteId: string | null;
    /** Whether the hook should be enabled */
    enabled: boolean;
    /** Number of tickets for payment summary */
    ticketQuantity?: number;
    /** Category selections for building the request */
    categorySelections?: Map<string, number>;
    /** Quote categories to map selections to category IDs */
    quoteCategories?: categoryInfoResponse[];
    /** Callback to trigger new search when quote expires */
    onQuoteExpired?: () => void;
}

export interface UseFrfsBookingAndStatusReturn {
    /** Function to confirm the booking */
    confirmBooking: () => Promise<void>;
    /** Current booking status response */
    bookingStatus: fRFSTicketBookingStatusAPIRes | null;
    /** Payment order for SDK integration */
    paymentOrder: createOrderResp | null;
    /** Whether booking confirmation is in progress */
    isConfirming: boolean;
    /** Whether status polling is active */
    isPollingStatus: boolean;
    /** Combined loading state */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Booking ID after confirmation */
    bookingId: string | null;
    /** Current booking status enum */
    status: FRFSTicketBookingStatus_fRFSTicketBookingStatus | null;
    /** Whether payment is required */
    requiresPayment: boolean;
    /** Whether booking is completed */
    isCompleted: boolean;
    /** Whether payment processing has started */
    isPaymentProcessing: boolean;
    /** Payment processing error if any */
    paymentError: string | null;
}

const STATUS_POLLING_INTERVAL = 2000; // 2 seconds
const MAX_STATUS_POLLING_ATTEMPTS = 60; // 2 minutes total

export const useFrfsBookingAndStatus = (params: UseFrfsBookingAndStatusParams): UseFrfsBookingAndStatusReturn => {
    const { quoteId, enabled, ticketQuantity = 1, categorySelections, quoteCategories, onQuoteExpired } = params;

    const dispatch = useAppDispatch();

    // Payment-related selectors
    const appReadableName = useAppSelector(selectAppReadableName);
    const personId = useAppSelector(selectUserId);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const enableHyperUPI = useMemo(() => newFeatureFlags?.enableHyperUPI, [newFeatureFlags?.enableHyperUPI]);

    // State management
    const [bookingStatus, setBookingStatus] = useState<fRFSTicketBookingStatusAPIRes | null>(null);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shouldPollStatus, setShouldPollStatus] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const statusPollingAttempts = useRef(0);
    // Refs to control payment flow - ensures payment only happens once after user confirmation
    const userConfirmedBooking = useRef(false); // Set to true when user clicks confirm
    const paymentProcessed = useRef(false); // Set to true when payment processing starts

    // RTK mutations and queries
    const [confirmBookingMutation, { isLoading: isConfirming }] = useFrfsQuoteV2QuoteIdConfirmPostMutation();

    // Status polling query - only enabled when shouldPollStatus is true and we have a bookingId
    const {
        data: statusData,
        isLoading: isPollingStatus,
        error: statusPollingError,
    } = useFrfsBookingBookingIdStatusGetQuery(
        { bookingId: createBookingId(bookingId || '') },
        {
            skip: !shouldPollStatus || !bookingId,
            pollingInterval: shouldPollStatus ? STATUS_POLLING_INTERVAL : 0,
        },
    );

    // Derived state
    const paymentOrder = bookingStatus?.payment?.paymentOrder || null;
    const status = bookingStatus?.status || null;
    const isLoading = isConfirming || isPollingStatus;

    // Check if payment is required based on status
    const requiresPayment = status === 'PAYMENT_PENDING';

    // Check if booking is completed (successful or failed final states)
    const isCompleted = status === 'CONFIRMED' || status === 'CANCELLED' || status === 'TECHNICAL_CANCEL_REJECTED';

    // Payment initialization helper
    const checkAndInitiate = useCallback(async () => {
        await checkAndInitiatePayment(appReadableName, personId || '');
    }, [appReadableName, personId]);

    // Start payment processing
    const startPayment = useCallback(async () => {
        if (!paymentOrder?.sdk_payload) {
            logger.logError('No payment order or SDK payload available', 'FrfsBookingAndStatus');
            return;
        }

        setIsPaymentProcessing(true);
        setPaymentError(null);

        try {
            const sdkPayload = paymentOrder.sdk_payload_json
                ? safeJsonParse(paymentOrder.sdk_payload_json, { payload: {} }, 'FrfsBookingAndStatus')
                : paymentOrder.sdk_payload;

            const processPayload = {
                ...sdkPayload,
                allowedAccountTypes: ['SAVINGS', 'CURRENT', 'SAVINGS||LITE', 'CURRENT||LITE'],
                payload: {
                    ...sdkPayload.payload,
                    productSummary: `FRFS Bus Ticket - ${ticketQuantity} ticket(s)`,
                    action: 'paymentPage',
                    udf1: enableHyperUPI ? 'hyperupi' : '',
                    udf2: 'enable_quick_pay',
                },
            };

            logger.logDebug(`FRFS Payment process payload: ${JSON.stringify(processPayload)}`, 'FrfsBookingAndStatus');
            dispatch(setHideLoader(true));
            await checkAndInitiate();
            HyperSdkReact.process(JSON.stringify(processPayload), 'paymentPage');
            setStringItem(MMKVKey.PAYMENT_PAGE_PAYLOAD, JSON.stringify(processPayload));

            logger.logInfo('FRFS Payment processing initiated successfully', 'FrfsBookingAndStatus');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process FRFS payment';
            logger.logError(`FRFS payment processing failed: ${errorMessage}`, 'FrfsBookingAndStatus');
            setPaymentError(errorMessage);
            dispatch(setHideLoader(false));
            paymentProcessed.current = false; // Allow retry on error
        } finally {
            setIsPaymentProcessing(false);
        }
    }, [paymentOrder?.sdk_payload, paymentOrder?.sdk_payload_json, ticketQuantity, enableHyperUPI, checkAndInitiate]);

    // Helper function to convert category selections to API format
    const buildCategorySelectionReq = useCallback((): fRFSCategorySelectionReq[] => {
        if (!categorySelections || !quoteCategories || categorySelections.size === 0) {
            return [];
        }

        return Array.from(categorySelections.entries())
            .map(([categoryName, quantity]) => {
                const category = quoteCategories.find(cat => cat.categoryName === categoryName);
                if (category && quantity > 0) {
                    return {
                        quoteCategoryId: category.categoryId,
                        quantity: quantity,
                    };
                }
                return null;
            })
            .filter((req): req is fRFSCategorySelectionReq => req !== null);
    }, [categorySelections, quoteCategories]);

    // Calculate child ticket quantity
    const calculateChildTicketQuantity = useCallback((): number => {
        if (!categorySelections) return 0;

        // Assuming 'CHILD' category represents child tickets
        return categorySelections.get('CHILD') || 0;
    }, [categorySelections]);

    // Confirm booking function
    const confirmBooking = useCallback(async () => {
        if (!enabled || !quoteId) {
            logger.logWarn('Cannot confirm booking: hook disabled or no quoteId', 'FrfsBookingAndStatus');
            return;
        }

        try {
            setError(null);

            // Mark that user has confirmed booking - this enables payment processing
            userConfirmedBooking.current = true;
            paymentProcessed.current = false;

            logger.logInfo(`Confirming FRFS booking for quoteId: ${quoteId}`, 'FrfsBookingAndStatus');

            // Build category selection requests
            const categorySelectionReqs = buildCategorySelectionReq();
            const childTicketQty = calculateChildTicketQuantity();

            // Log category selections for debugging
            if (categorySelections && categorySelections.size > 0) {
                logger.logInfo(
                    `FRFS booking with category selections: ${JSON.stringify(Array.from(categorySelections.entries()))}`,
                    'FrfsBookingAndStatus',
                );
                logger.logInfo(
                    `Built category selection requests: ${JSON.stringify(categorySelectionReqs)}`,
                    'FrfsBookingAndStatus',
                );
            }

            const result = await confirmBookingMutation({
                quoteId,
                body: {
                    ticketQuantity: ticketQuantity,
                    childTicketQuantity: childTicketQty > 0 ? childTicketQty : undefined,
                    offered: categorySelectionReqs.length > 0 ? categorySelectionReqs : undefined,
                    enableOffer: true,
                    crisSdkResponse: undefined,
                },
            }).unwrap();

            logger.logInfo(
                `FRFS booking confirmed. BookingId: ${result.bookingId}, Status: ${result.status}`,
                'FrfsBookingAndStatus',
            );

            setBookingStatus(result);
            setBookingId(result.bookingId);

            // Start status polling if booking is not in a final state
            if (!isBookingInFinalState(result.status)) {
                logger.logInfo(`Starting status polling for bookingId: ${result.bookingId}`, 'FrfsBookingAndStatus');
                setShouldPollStatus(true);
                statusPollingAttempts.current = 0;
            }
            // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
        } catch (err: any) {
            // Check if this is a quote expired error
            const isQuoteExpiredError =
                err?.data?.errorCode === 'FRFS_QUOTE_EXPIRED' ||
                err?.data?.errorMessage === 'Quote expired' ||
                (err?.message && err.message.includes('Quote expired'));

            if (isQuoteExpiredError) {
                logger.logInfo('FRFS quote expired, triggering new search', 'FrfsBookingAndStatus');
                setError('Quote expired, searching for new fares...');

                // Trigger new search if callback is provided
                if (onQuoteExpired) {
                    onQuoteExpired();
                }
            } else {
                const errorMessage = err instanceof Error ? err.message : 'Failed to confirm FRFS booking';
                logger.logError(`FRFS booking confirmation failed: ${errorMessage}`, 'FrfsBookingAndStatus');
                setError(errorMessage);
            }
        }
    }, [
        enabled,
        quoteId,
        confirmBookingMutation,
        ticketQuantity,
        buildCategorySelectionReq,
        calculateChildTicketQuantity,
        categorySelections,
    ]);

    // Handle status polling data updates
    useEffect(() => {
        if (statusData && shouldPollStatus) {
            statusPollingAttempts.current += 1;

            logger.logInfo(
                `Status polling attempt ${statusPollingAttempts.current}: Status = ${statusData.status}`,
                'FrfsBookingAndStatus',
            );

            setBookingStatus(statusData);

            // Check if we reached a final state, received payment payload, or max attempts
            if (isBookingInFinalState(statusData.status)) {
                logger.logInfo(
                    `Final booking status reached: ${statusData.status}, stopping poll`,
                    'FrfsBookingAndStatus',
                );
                setShouldPollStatus(false);
            } else if (statusData.payment?.paymentOrder?.sdk_payload) {
                logger.logInfo(
                    `Payment payload received, stopping poll to proceed with payment`,
                    'FrfsBookingAndStatus',
                );
                setShouldPollStatus(false);
            } else if (statusPollingAttempts.current >= MAX_STATUS_POLLING_ATTEMPTS) {
                logger.logWarn(
                    `Max status polling attempts reached (${MAX_STATUS_POLLING_ATTEMPTS}), stopping poll`,
                    'FrfsBookingAndStatus',
                );
                setShouldPollStatus(false);
                setError('Timeout waiting for booking status update');
            }
        }
    }, [statusData, shouldPollStatus]);

    // Handle status polling errors
    useEffect(() => {
        if (statusPollingError && shouldPollStatus) {
            logger.logError(`Status polling error: ${statusPollingError}`, 'FrfsBookingAndStatus');
            setShouldPollStatus(false);
            setError('Failed to fetch booking status');
        }
    }, [statusPollingError, shouldPollStatus]);

    // Auto-trigger payment when paymentOrder is received AND user has confirmed booking
    useEffect(() => {
        if (
            paymentOrder?.sdk_payload &&
            userConfirmedBooking.current &&
            !paymentProcessed.current &&
            !isPaymentProcessing &&
            !paymentError
        ) {
            logger.logInfo(
                'Payment order received and user confirmed, starting payment processing',
                'FrfsBookingAndStatus',
            );
            paymentProcessed.current = true; // Prevent multiple payment attempts
            startPayment();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentOrder?.sdk_payload, isPaymentProcessing, paymentError]);

    // Reset state when quoteId changes
    useEffect(() => {
        if (quoteId) {
            setBookingStatus(null);
            setBookingId(null);
            setError(null);
            setShouldPollStatus(false);
            setIsPaymentProcessing(false);
            setPaymentError(null);
            statusPollingAttempts.current = 0;
            userConfirmedBooking.current = false;
            paymentProcessed.current = false;
        }
    }, [quoteId]);

    return {
        confirmBooking,
        bookingStatus,
        paymentOrder,
        isConfirming,
        isPollingStatus,
        isLoading,
        error,
        bookingId,
        status,
        requiresPayment,
        isCompleted,
        isPaymentProcessing,
        paymentError,
    };
};

/**
 * Helper function to check if booking status is in a final state
 */
function isBookingInFinalState(status: FRFSTicketBookingStatus_fRFSTicketBookingStatus): boolean {
    const finalStates: FRFSTicketBookingStatus_fRFSTicketBookingStatus[] = [
        'CONFIRMED',
        'CANCELLED',
        'TECHNICAL_CANCEL_REJECTED',
    ];
    return finalStates.includes(status);
}
