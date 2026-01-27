import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    multimodalJourneyIdConfirmPostWithParams,
    useMultimodalJourneyIdConfirmPostMutation,
} from '@/api/integrations/rtk/MultimodalJourneyIdConfirmPost';
import { useMultimodalJourneyIdBookingPaymentStatusGetQuery } from '@/api/integrations/rtk/MultimodalJourneyIdBookingPaymentStatusGet';
import { journeyConfirmReqElement } from '@/readOnly/api/types/JourneyConfirmReqElement.gen';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { createJourneyId, selectSearchId, selectUserId, selectUserGender } from '@/typescript/state/client/user';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import {
    setToastProps,
    setHideLoader,
    selectPaymentRetryCounter,
    selectSearchedSource,
    selectDestination,
    selectAppName,
    selectNewFeatureFlags,
    setLiveJourneyId,
    selectAppReadableName,
} from '@/typescript/state/client/session';
import { useDevSettings } from '@/typescript/hooks/useDevSettings';
import { clearRecentMultimodalTripsCache } from '../../../hooks/useRecentMultimodalTrips';
import { journeyConfirmReqElementWithTravelMode } from '../../../screens/JourneyInfoScreen/Types';
import colors from '@/typescript/designSystem/colorPalette';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { logger } from '@/src-v2/systems/logger';
import { selectCrisSDKToken } from '@/typescript/state/client/session';
import { getDevSettingsError, processSubwayLeg } from '@/src-v2/multimodal/utils/SubwayUtils';
import { isNull, isUndefined } from 'lodash';
import {
    calculateTotalTickets,
    getDefaultCategory,
    JourneyPaymentProps,
    LegCategorySelection,
    LegCategorySelections,
} from '../Types';
import {
    calculateTotalFareForLeg,
    getCategoryDiscount,
    createLegCategorySelection,
    handleCategoryQuantityChange as handleCategoryQuantityChangeCommon,
} from '../journeyPaymentUtils';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';
import { usePublicTransportUtils } from '../../../utils/PublicTransportUtils';
import HyperSdkReact from 'hyper-sdk-react';
import { MMKVKey, setStringItem } from '@/typescript/utils/MMKV';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { generateProductSummary } from '../../../screens/JourneyInfoScreen/components/ProductSummary';
import { buildJourneySegments, getMaxTicketsForLeg } from '../../../screens/JourneyInfoScreen/utils';
import { selectSelectedModesFilter, setSelectedModesFilter } from '@/typescript/state/client/search';
import { SubwayErrorPopUpType, useSubwayErrors } from './useSubwayErrors';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { fRFSCategorySelectionReq } from '@/readOnly/api/types/FRFSCategorySelectionReq.gen';
import { checkAndInitiatePayment } from '@/src-v2/utils/Payment';
import { Platform } from 'react-native';
import { journeyConfirmationQueue } from '@/src-v2/systems/queue/queue';
import { FRFSQuoteCategoryType_fRFSQuoteCategoryType } from '@/readOnly/api/types/Enums.gen';
import { priceAPIEntity } from '@/readOnly/api/types/PriceAPIEntity.gen';

export const useJourneyPayment = ({
    journeyId,
    legs,
    offer,
    handledQuoteExpiry,
    setIsJourneyConfirmed,
    onMoreOptions,
    navigation,
    fetchingLegsFare,
    isJourneyConfirmed,
    loadingDataForLeg,
}: JourneyPaymentProps) => {
    const destination = useAppSelector(selectDestination);
    const source = useAppSelector(selectSearchedSource);
    const dispatch = useAppDispatch();
    const { viaPointsModalRef } = useRefsContext();
    const { showSubwayError } = useSubwayErrors({ onMoreOptions });
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const userGender = useAppSelector(selectUserGender);

    const [isConfirmingJourney, setIsConfirmingJourney] = useState(false);
    const [isPollingForPayment, setIsPollingForPayment] = useState<boolean>(false);
    const [viaOfferButton, setViaOfferButton] = useState<boolean>(false);
    const paymentRetryCounter = useAppSelector(selectPaymentRetryCounter);
    const utsError = useRef<SubwayErrorPopUpType | undefined>(undefined);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const isPaymentOrderRef = useRef(false);
    const [hasBookableLeg, setHasBookableLeg] = useState(false);
    const [confirmApiCall] = useMultimodalJourneyIdConfirmPostMutation();

    // Category-based selection state
    const [legCategorySelections, setLegCategorySelections] = useState<LegCategorySelections>([]);

    useEffect(() => {
        if (legs && legs.length > 0) {
            const getLegCategorySelections = (leg: legInfo): LegCategorySelection => {
                if (leg.legExtraInfo.TAG === 'Walk' || leg.legExtraInfo.TAG === 'Taxi') {
                    const defaultPrice: priceAPIEntity = {
                        amount: 0,
                        currency: 'INR',
                    };
                    const walkTaxiCategories: categoryInfoResponse[] = [
                        {
                            categoryName: 'ADULT',
                            categoryId: 'ADULT',
                            categoryOfferedPrice: leg.estimatedMaxFare ?? leg.estimatedMinFare ?? defaultPrice,
                            categoryPrice: leg.estimatedMaxFare ?? leg.estimatedMinFare ?? defaultPrice,
                            categorySelectedQuantity: 1,
                            categoryMeta: undefined,
                        },
                    ];
                    return createLegCategorySelection(
                        walkTaxiCategories,
                        new Map([['ADULT', 1]]),
                        leg.order,
                        leg.travelMode,
                        {
                            fixedPrice: true,
                            cashPayment: true,
                            passApplicable: false,
                        },
                    );
                }
                const categories = leg.legExtraInfo._0?.categories ?? [];
                const defaultCategory = getDefaultCategory(categories, userGender ?? 'MALE');
                const oldSelections = legCategorySelections.find(l => l.legOrder === leg.order)?.selections;
                const selections =
                    oldSelections?.size && oldSelections?.size > 0
                        ? oldSelections
                        : new Map(defaultCategory ? [[defaultCategory.categoryName, 1]] : []);

                return createLegCategorySelection(categories, selections, leg.order, leg.travelMode, {
                    fixedPrice: false,
                    cashPayment: false,
                    passApplicable: leg.hasApplicablePasses ?? false,
                });
            };
            setLegCategorySelections(legs.map(getLegCategorySelections));
        }
    }, [legs]);

    // Handler for category quantity changes
    const handleCategoryQuantityChange = useCallback(
        (legOrder: number, categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType, isIncr: boolean) => {
            setLegCategorySelections((prev: LegCategorySelection[]) => {
                if (!prev || prev.length === 0) {
                    return prev;
                }

                const hasSubwayLegInJourney = legs?.some(leg => leg.travelMode === 'Subway');
                const maxTotalTickets = getMaxTicketsForLeg(hasSubwayLegInJourney);

                return prev.map(legCategorySelection => {
                    if (legCategorySelection.fixedPrice || legCategorySelection.legOrder !== legOrder) {
                        return legCategorySelection;
                    }

                    const newSelections = handleCategoryQuantityChangeCommon(
                        legCategorySelection.selections,
                        categoryName,
                        isIncr,
                        legCategorySelection.categories,
                        userGender ?? 'MALE',
                        maxTotalTickets,
                    );

                    return {
                        ...legCategorySelection,
                        selections: newSelections,
                    };
                });
            });
        },
        [userGender, legs],
    );

    const payment_status_api_interval = 1000;
    const { data: paymentStatusResp, isFetching } = useMultimodalJourneyIdBookingPaymentStatusGetQuery(
        { journeyId: journeyId || '' },
        {
            pollingInterval: isPollingForPayment ? payment_status_api_interval : 0,
            skipPollingIfUnfocused: true,
            skip: isUndefined(journeyId) || !isPollingForPayment,
        },
    );
    const paymentStatusRespData = isFetching ? undefined : paymentStatusResp;
    const appName = useAppSelector(selectAppName);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const hideLoader = useAppSelector(state => state.session.hideLoader);

    const { getDevSettings } = useDevSettings();
    const { getRouteByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    const journeySegments = useMemo(() => {
        return buildJourneySegments(legs, legCategorySelections, getRouteByCode, true);
    }, [legs, getRouteByCode, legCategorySelections]);

    const getCategorySelectionReqObj = useCallback(
        (legOrder: number): fRFSCategorySelectionReq[] | undefined => {
            if (!legCategorySelections || legCategorySelections.length === 0) {
                return undefined;
            }

            return Array.from(legCategorySelections.find(l => l.legOrder === legOrder)?.selections?.entries() ?? [])
                .filter(([_, quantity]) => quantity > 0)
                .map(([categoryName, quantity]) => {
                    const category = legCategorySelections
                        .find(l => l.legOrder === legOrder)
                        ?.categories.find(c => c.categoryName === categoryName);
                    if (
                        !category ||
                        legCategorySelections.find(l => l.legOrder === legOrder)?.cashPayment ||
                        legCategorySelections.find(l => l.legOrder === legOrder)?.passApplicable
                    ) {
                        return undefined;
                    }
                    return {
                        quoteCategoryId: category.categoryId,
                        quantity: quantity,
                    };
                })
                .filter(
                    (categorySelectionReq: fRFSCategorySelectionReq | undefined) => categorySelectionReq !== undefined,
                );
        },
        [legCategorySelections],
    );

    // Calculate total fare from selected categories
    const totalFare = useMemo(() => {
        return legCategorySelections.reduce((total, legCategorySelection) => {
            return total + calculateTotalFareForLeg(legCategorySelection.categories, legCategorySelection.selections);
        }, 0);
    }, [legCategorySelections]);

    const totalPayableFare = useMemo(() => {
        return legCategorySelections.reduce((total, legCategorySelection) => {
            const totalQuantity = calculateTotalTickets([legCategorySelection]);
            if (legCategorySelection.cashPayment || (legCategorySelection.passApplicable && totalQuantity === 1)) {
                return total;
            }
            return total + calculateTotalFareForLeg(legCategorySelection.categories, legCategorySelection.selections);
        }, 0);
    }, [legCategorySelections]);

    const accessToken = useAppSelector(selectCrisSDKToken);

    const showSubwayErrorPopUp = useCallback(
        (errorMessage: string | undefined) => {
            if (!utsError.current) return;
            showSubwayError(utsError.current, errorMessage);
        },
        [showSubwayError],
    );

    const checkDevSettings = async (journeyConfirmReqElements: journeyConfirmReqElementWithTravelMode[]) => {
        const hasSubwayLeg = journeyConfirmReqElements.some(leg => leg.travelMode === 'Subway' && !leg.skipBooking);
        if (!hasSubwayLeg) return false;
        const devSettingsStatus = await getDevSettings();
        if (devSettingsStatus.hasDevSettings) {
            const settingsMessage = getDevSettingsError(devSettingsStatus);
            utsError.current = SubwayErrorPopUpType.DeveloperSettingsError;
            showSubwayErrorPopUp(settingsMessage);
            setIsConfirmingJourney(false);
            return true;
        }
        return false;
    };

    const confirm = useCallback(
        async (journeyConfirmReqElements: journeyConfirmReqElementWithTravelMode[]) => {
            if (!journeyId) return;
            utsError.current = undefined;
            setIsJourneyConfirmed(true);

            logger.logInfo(`Initiating journey confirmation for journey ${journeyId}`, 'BookingFlow');

            const hasDevSettingsOn = await checkDevSettings(journeyConfirmReqElements);
            if (hasDevSettingsOn) return;

            const processedJourneyConfirmReqElements: journeyConfirmReqElement[] = [];
            for (const leg of journeyConfirmReqElements) {
                const journeyConfirmReqElement: journeyConfirmReqElement = {
                    crisSdkResponse: leg.crisSdkResponse,
                    journeyLegOrder: leg.journeyLegOrder,
                    skipBooking: leg.skipBooking,
                    categorySelectionReq: leg.categorySelectionReq,
                };

                if (leg.travelMode === 'Subway') {
                    const { processedLeg, shouldBreak, errorMessage } = await processSubwayLeg(
                        journeyConfirmReqElement,
                        journeyId,
                        legs,
                        utsError,
                        accessToken,
                    );

                    if (shouldBreak) {
                        showSubwayErrorPopUp(errorMessage);
                        break;
                    } else if (processedLeg) {
                        // eslint-disable-next-line functional/immutable-data
                        processedJourneyConfirmReqElements.push(processedLeg);
                    }
                } else {
                    // eslint-disable-next-line functional/immutable-data
                    processedJourneyConfirmReqElements.push(journeyConfirmReqElement);
                }
            }

            if (utsError.current) {
                setIsConfirmingJourney(false);
                return;
            }

            const confirmReq: multimodalJourneyIdConfirmPostWithParams = {
                journeyId: journeyId,
                forceBookLegOrder: undefined,
                body: {
                    journeyConfirmReqElements: processedJourneyConfirmReqElements,
                    enableOffer: true,
                },
            };
            const resp = await confirmApiCall(confirmReq);
            if (resp.error) {
                setIsConfirmingJourney(false);
                if (
                    'data' in resp.error &&
                    typeof resp.error.data === 'object' &&
                    resp.error.data !== null &&
                    'errorMessage' in resp.error.data &&
                    resp.error.data.errorMessage === 'Quote expired'
                ) {
                    dispatch(
                        setToastProps({
                            visible: true,
                            message: userLanguageStrings.JourneyExpiredRefreshing,
                            backgroundColor: `${colors?.primitive?.red?.danger}`,
                            autoDismissAfter: 4000,
                            logo: undefined,
                            buttons: [],
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            customToast: undefined,
                            margin: undefined,
                        }),
                    );
                    handledQuoteExpiry().then(() => {
                        setIsConfirmingJourney(false);
                    });
                    dispatch(setHideLoader(false));
                }
                return;
            }
            const hasBookableLeg =
                legs?.some(leg => leg.bookingAllowed && ['Metro', 'Bus', 'Subway'].includes(leg.travelMode)) || false;

            const anyNonSkippedBookableLeg =
                hasBookableLeg &&
                journeyConfirmReqElements.some(
                    leg => ['Metro', 'Bus', 'Subway'].includes(leg.travelMode) && !leg.skipBooking,
                );

            if (hasBookableLeg) {
                setHasBookableLeg(hasBookableLeg);
            }

            if (anyNonSkippedBookableLeg) {
                setIsPollingForPayment(true);
            }

            if (!hasBookableLeg || !anyNonSkippedBookableLeg) {
                dispatch(setLiveJourneyId(journeyId));
                navigation.popTo('mainTabNavigation', {
                    screen: 'liveTab_homeScreen',
                    params: {
                        journeyId: null,
                        multimodalProps: {
                            journeyId: createJourneyId(journeyId),
                            isLastMile: false,
                            currentLegOrder: '0',
                            previousLegOrderTravelMode: undefined,
                            previousLegOrderTravelModeStatusConfirmed: undefined,
                        },
                    },
                });
                setIsConfirmingJourney(false);
            }
        },
        [legs, confirmApiCall, navigation, dispatch, accessToken],
    );

    const handleConfirmJourney = useCallback(
        async (journeyConfirmReqElements: journeyConfirmReqElementWithTravelMode[]) => {
            if (journeyId && !isConfirmingJourney) {
                logger.logInfo(`User initiated journey confirmation for journey ${journeyId}`, 'BookingFlow');
                viaPointsModalRef.current?.dismiss();
                setIsConfirmingJourney(true);
                await journeyConfirmationQueue.enqueue(() => confirm(journeyConfirmReqElements));
                clearRecentMultimodalTripsCache();
            } else {
                logger.logWarn(
                    `Can't able to Initiate Journey Confirmation. current Journey : ${journeyId} , isConfirming Journey : ${isConfirmingJourney}`,
                    'BookingFlow',
                );
            }
        },
        [journeyId, isConfirmingJourney, confirm],
    );

    useEffect(() => {
        if (legs && isNull(loadingDataForLeg) && !isConfirmingJourney && !isJourneyConfirmed && !fetchingLegsFare) {
            const hasBookableLegCheck =
                legs?.some(
                    leg => leg.bookingAllowed && leg?.travelMode && ['Metro', 'Bus', 'Subway'].includes(leg.travelMode),
                ) || false;

            if (hasBookableLegCheck) {
                setHasBookableLeg(true);
            } else {
                setHasBookableLeg(false);
            }
        }
    }, [legs, loadingDataForLeg, isConfirmingJourney, isJourneyConfirmed, hasBookableLeg]);

    const currentModes = useAppSelector(state => selectSelectedModesFilter(state, searchId));
    useEffect(() => {
        if (utsError.current) {
            if (searchId) {
                const updatedModes = currentModes.filter((mode: string) => mode !== 'Subway');
                dispatch(
                    setSelectedModesFilter({
                        id: searchId,
                        payload: updatedModes,
                    }),
                );
            }
        }
    }, [utsError.current]);

    useEffect(() => {
        if (
            !paymentStatusRespData?.paymentOrder ||
            !paymentStatusRespData?.paymentOrder?.sdkPayload ||
            !isPollingForPayment
        ) {
            return;
        }

        if (paymentStatusRespData?.paymentOrder?.sdkPayload) {
            dispatch(setHideLoader(true));
        }
        if (paymentStatusRespData?.paymentOrder || paymentStatusRespData?.paymentOrder?.sdkPayload) {
            isPaymentOrderRef.current = false;
            setIsPollingForPayment(false);
            console.info('Calling startPayment from after getting payment order', paymentStatusRespData);
            if (Platform.OS === 'ios') setEnabled(false);
            startPayment();
            setIsConfirmingJourney(false);
        }
    }, [paymentStatusResp, isPollingForPayment]);

    const countBookableLeg = useMemo(
        () =>
            legs?.filter(leg => leg.bookingAllowed && ['Metro', 'Bus', 'Subway'].includes(leg.travelMode)).length ?? 0,
        [legs],
    );

    const getSourceAndDestination = () => {
        const transitLeg =
            countBookableLeg === 1
                ? legs?.find(leg => leg.bookingAllowed && ['Metro', 'Bus', 'Subway'].includes(leg.travelMode))
                : undefined;

        const defaultSource = source?.title || source?.formattedAddress || '';
        const defaultDestination = destination?.title || destination?.formattedAddress || '';

        if (!isUndefined(transitLeg)) {
            if (transitLeg.legExtraInfo.TAG === 'Metro' || transitLeg.legExtraInfo.TAG === 'Subway') {
                const routeInfo = transitLeg.legExtraInfo._0.routeInfo;
                if (routeInfo && routeInfo.length > 0) {
                    return {
                        source: routeInfo[0]?.originStop?.name || defaultSource,
                        destination: routeInfo.at(-1)?.destinationStop?.name || defaultDestination,
                    };
                }
            } else if (transitLeg.legExtraInfo.TAG === 'Bus') {
                return {
                    source: transitLeg.legExtraInfo._0.originStop?.name || defaultSource,
                    destination: transitLeg.legExtraInfo._0.destinationStop?.name || defaultDestination,
                };
            }
        }
        return { source: defaultSource, destination: defaultDestination };
    };

    const hasSubwayLeg = useMemo(() => {
        return legs?.some(leg => leg.travelMode === 'Subway') || false;
    }, [legs]);

    const onConfirm = useCallback(
        ({ skipPayment, viaOfferButton }: { skipPayment: boolean; viaOfferButton: boolean }) => {
            if (!legs) return;

            const journeyConfirmReqElements: journeyConfirmReqElementWithTravelMode[] = legs.map(leg => ({
                journeyLegOrder: leg.order,
                skipBooking: skipPayment,
                crisSdkResponse: undefined,
                travelMode: leg?.travelMode,
                categorySelectionReq: getCategorySelectionReqObj(leg.order),
            }));
            setViaOfferButton(viaOfferButton);
            logger.logInfo(`Pay Button Clicked for journey ${journeyId}`, 'BookingFlow');
            handleConfirmJourney(journeyConfirmReqElements);
        },
        [legs, handleConfirmJourney, journeyId, getCategorySelectionReqObj],
    );

    const productSummary = useMemo(() => {
        const { source: summarySource, destination: summaryDestination } = getSourceAndDestination();
        return generateProductSummary({
            source: summarySource,
            destination: summaryDestination,
            appName: appName,
            totalPayableFare: totalPayableFare,
        });
    }, [legs, source, destination, appName, totalPayableFare]);

    const { setEnabled } = useKeyboardController();
    const personId = useAppSelector(selectUserId);
    const appReadableName = useAppSelector(selectAppReadableName);
    const checkAndInitiate = async () => {
        await checkAndInitiatePayment(appReadableName, personId || '');
    };

    const sdkPayload = useMemo(() => {
        return paymentStatusRespData?.paymentOrder?.sdkPayload?.sdk_payload_json
            ? safeJsonParse(
                  paymentStatusRespData.paymentOrder.sdkPayload.sdk_payload_json,
                  { payload: {} },
                  'useJourneyPayment',
              )
            : undefined;
    }, [paymentStatusRespData?.paymentOrder?.sdkPayload?.sdk_payload_json]);

    const currentOrderId = useMemo(() => {
        return paymentStatusRespData?.paymentOrder?.sdkPayload?.order_id;
    }, [paymentStatusRespData?.paymentOrder?.sdkPayload?.order_id]);

    const startPayment = useCallback(() => {
        if (sdkPayload) {
            const processPayload = {
                ...sdkPayload,
                allowedAccountTypes: ['SAVINGS', 'CURRENT', 'SAVINGS||LITE', 'CURRENT||LITE'],
                payload: {
                    ...sdkPayload.payload,
                    productSummary: productSummary,
                    udf1: newFeatureFlags.enableHyperUPI ? 'hyperupi' : '',
                    udf2: isUndefined(offer) && !viaOfferButton ? 'enable_quick_pay' : '',
                },
            };
            logger.logDebug(`Payment process payload: ${JSON.stringify(processPayload)}`, 'PaymentSDKFlow');
            logEvent(EventName.NY_USER_PAYMENT_PROCESS_PAYLOAD, { processPayload: processPayload });
            checkAndInitiate().then(result => {
                console.info('Payment result: ', result);
                HyperSdkReact.process(JSON.stringify(processPayload), 'paymentPage');
                logEvent(EventName.HYPERSDK_PROCESS, {
                    processPayload: processPayload,
                    orderId: paymentStatusRespData?.paymentOrder?.sdkPayload?.order_id,
                });
                logEvent(EventName.HYPERSDK_LOG, {
                    ppEvent: 'process_called',
                    payload: processPayload,
                    orderId: paymentStatusRespData?.paymentOrder?.sdkPayload?.order_id,
                });
                setStringItem(MMKVKey.PAYMENT_PAGE_PAYLOAD, JSON.stringify(processPayload));
            });

            return () => {
                setEnabled(true);
            };
        }
        return undefined;
    }, [currentOrderId, offer]);

    return {
        isConfirmingJourney,
        paymentOrder: paymentStatusResp,
        isPaymentOrder: isPaymentOrderRef.current,
        hasBookableLeg: hasBookableLeg,
        utsError: utsError.current,
        paymentRetryCounter: paymentRetryCounter,
        getSourceAndDestination,
        totalFare,
        totalPayableFare,
        legCategorySelections,
        handleCategoryQuantityChange,
        getCategoryDiscount,
        onConfirm,
        hideLoader,
        journeySegments,
        appName,
        currentOrderId,
        fetchingLegsFare: isFetching,
        hasSubwayLeg,
        handleConfirmJourney,
    };
};
