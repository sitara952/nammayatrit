import { find } from 'lodash';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { store } from '../state/store';
import {
    PricingItemType,
    selectIsPetRide,
    selectPricingItems,
    setIsSearchCancelled,
    TripMode,
    selectTripTypeSelection,
} from '../state/client/search';
import { useCancelEstimateMutation, usePostSelect2Mutation } from '../state/server/estimateApi';
import { useCancelBookingMutation } from '../state/server/bookingApi';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { decodeError } from '../utils/error';
import { BookingId, createBookingId, selectSpecialAssistance } from '../state/client/user';
import { useRideSearchQuotesQuoteIdConfirmPostMutation } from '@/api/integrations/rtk/RideSearchQuotesQuoteIdConfirmPost';
import { confirmRes } from '@/readOnly/api/types/ConfirmRes.gen';
import { BillingCategory_billingCategory } from '@/readOnly/api/types/Enums.gen';
import { PENDING_BOOKING_ID, setBookingSpecialAssistance } from '../state/client/booking';

type CallSelectPricingItemAPIProps = {
    selectedPricingItems: PricingItemType[];
    customerTip: number | undefined;
    bookingId: BookingId | null;
    searchId: string | null;
    onSuccess: (a: confirmRes) => void;
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    onError: (a: any) => void;
};

type CancelEstimateObj = {
    cancel: boolean;
    prevEstimateId: string | undefined;
};

export const useCallSelectPricingItemAPI = (
    cancelEstimateObj: CancelEstimateObj = {
        cancel: false,
        prevEstimateId: undefined,
    },
) => {
    const pricingItems = useAppSelector(state => selectPricingItems(state, null));
    const specialAssistance = useAppSelector(selectSpecialAssistance);

    // Re-create the API call functions here to get latest data

    const [callConfirmQuote] = useRideSearchQuotesQuoteIdConfirmPostMutation(undefined);
    const dispatch = useAppDispatch();

    const [postSelect2] = usePostSelect2Mutation();
    const [cancelEstimate] = useCancelEstimateMutation();
    const [cancelBooking] = useCancelBookingMutation();

    const initializeBookingSpecialAssistance = (data: confirmRes) => {
        const bookingId = data.bookingId ? createBookingId(data.bookingId) : PENDING_BOOKING_ID;
        dispatch(setBookingSpecialAssistance({ id: bookingId, payload: specialAssistance }));
    };

    return (props: CallSelectPricingItemAPIProps) => {
        const wrappedOnSuccess = (data: confirmRes) => {
            initializeBookingSpecialAssistance(data);
            props.onSuccess(data);
        };

        const currency = find(pricingItems, item => item?.id === props.selectedPricingItems[0]?.id)
            ?.estimatedFareWithCurrency?.currency;
        const pricingId = props.selectedPricingItems[0]?.id;
        const estimateIds =
            props.selectedPricingItems.length > 1 ? props.selectedPricingItems?.map(item => item.id) : [];
        const uniqueEstimates = estimateIds.filter(items => items !== pricingId);
        const tipsApiData =
            props.customerTip && currency
                ? {
                      amount: props.customerTip,
                      currency: currency,
                  }
                : undefined;

        const currentState = store.getState();
        const selectedTripType = selectTripTypeSelection(currentState, props.searchId);
        const isPetRide = selectIsPetRide(currentState, props.searchId);
        const billingCategory: BillingCategory_billingCategory | undefined = selectedTripType;

        switch (props.selectedPricingItems[0]?.tripMode) {
            case TripMode.DynamicOffer: {
                const estimateId = pricingId;
                const body = {
                    autoAssignEnabled: true,
                    autoAssignEnabledV2: true,
                    paymentMethodId: '',
                    deliveryDetails: undefined,
                    isAdvancedBookingEnabled: undefined,
                    customerExtraFeeWithCurrency: tipsApiData,
                    customerExtraFee: tipsApiData?.amount,
                    otherSelectedEstimates: uniqueEstimates,
                    disabilityDisable: !specialAssistance,
                    isPetRide: isPetRide,
                    billingCategory: billingCategory,
                };
                if (cancelEstimateObj.cancel) {
                    dispatch(
                        setIsSearchCancelled({
                            id: props.searchId,
                            payload: true,
                        }),
                    );
                    cancelEstimate(cancelEstimateObj.prevEstimateId)
                        .then(() => {
                            estimateId &&
                                postSelect2({ estimateId, body })
                                    .unwrap()
                                    .then(data => {
                                        logEvent(EventName.NY_USER_CANCEL_WAITING_FOR_QUOTES);
                                        wrappedOnSuccess(data);
                                    })
                                    .catch(e => {
                                        logEvent(EventName.NY_FS_CANCEL_ESTIMATE_BOOKING_EXISTS_RIGHT);
                                        props.onError(e);
                                    });
                        })
                        .catch(err => {
                            const codeMessage = decodeError(err);
                            if (err.code == 400 && codeMessage.errorMessage == 'ACTIVE_BOOKING_EXISTS') {
                                logEvent(EventName.NY_FS_CANCEL_ESTIMATE_BOOKING_EXISTS_LEFT);
                            } else {
                                logEvent(EventName.NY_FS_CANCEL_ESTIMATE_FAILED_LEFT);
                                props.onError(err);
                            }
                        })
                        .finally(() => {
                            dispatch(
                                setIsSearchCancelled({
                                    id: props.searchId,
                                    payload: false,
                                }),
                            );
                        });
                } else {
                    estimateId &&
                        postSelect2({ estimateId, body }).unwrap().then(wrappedOnSuccess).catch(props.onError);
                }
                break;
            }
            case TripMode.RideOtp:
            case TripMode.StaticOffer: {
                const cancelBookingReq = {
                    bookingId: props.bookingId,
                    data: {
                        additionalInfo: 'others',
                        reallocate: false,
                        reasonCode: '',
                        reasonStage: 'OnSearch',
                    },
                };
                if (cancelEstimateObj.cancel) {
                    dispatch(
                        setIsSearchCancelled({
                            id: props.searchId,
                            payload: true,
                        }),
                    );
                    cancelBooking(cancelBookingReq)
                        .then(() =>
                            callConfirmQuote({
                                paymentMethodId: undefined,
                                quoteId: pricingId || '',
                            })
                                .then(res => {
                                    if (res.data) return wrappedOnSuccess(res.data);
                                })
                                .catch(props.onError),
                        )
                        .finally(() => {
                            dispatch(
                                setIsSearchCancelled({
                                    id: props.searchId,
                                    payload: false,
                                }),
                            );
                        });
                } else {
                    callConfirmQuote({
                        paymentMethodId: undefined,
                        quoteId: pricingId || '',
                    })
                        .then(res => {
                            if (res.data) return wrappedOnSuccess(res.data);
                        })
                        .catch(props.onError);
                }
                break;
            }
            default:
                break;
        }
    };
};
