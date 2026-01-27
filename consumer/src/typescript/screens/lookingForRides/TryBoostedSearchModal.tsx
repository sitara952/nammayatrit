import React, { useCallback } from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import token from '../../designSystem/tokens';
import Typography from '../../designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { resetIds, setBookingAndRideDetails } from '@/typescript/state/sharedReducer';
import { createBookingId, selectBookingId, selectSearchId, setBookingId } from '../../state/client/user';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { useRefsContext } from '../../context/RefsContext';
import { useRideBookingRideBookingIdCancelPost } from '../../../api/integrations/RideBookingRideBookingIdCancelPostRQ.bs';
import { Icon } from '../../components/Icon';
import CloseIcon from '../../components/svg/CloseIcon';
import {
    selectIsSearchBoosted,
    selectPricingItems,
    selectSelectedPricingItems,
    setCustomerTip,
    setIsSearchBoosted,
    setSelectedPricingItems,
    setPricingItems,
    TripMode,
} from '../../state/client/search';
import {
    BottomSheetStage,
    clearSession,
    selectBottomSheetStage,
    selectChooseRideGoBackStage,
    selectGoBackToRental,
    setBottomSheetStage,
    setToastProps,
    setToastVisible,
    selectFindAnotherDriverContext,
    setFindAnotherDriverContext,
} from '@/typescript/state/client/session';

import { selectToken } from '@/typescript/state/client/auth';
import { useEstimateEstimateIdCancelPostMutation } from '@/api/integrations/rtk/EstimateEstimateIdCancelPost';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRideBookingListGetLazyQueryWithAppName } from '@/api/integrations/rtk/RideBookingListGet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import { bookingListRes } from '@/readOnly/api/types/BookingListRes.gen.tsx';
import useMapRoute from '@/typescript/Maps/UseMapRouteTS';
import { useJourneyActions } from '@/src-v2/multimodal/hooks/useJourneyActions';
import { setLegIsLoading } from '@/typescript/state/client/journey';
import { createJourneyId } from '@/typescript/state/client/user';
import { isUpcomingBooking } from '@/src-v2/utils/Booking';
import Danger from '@/typescript/components/svg/Danger';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { EventName, logEvent } from '@/typescript/utils/logger';

const TryBoostedSearchModal = (props: {
    resetSearch: () => void;
    retryCancelClicked: () => void;
    setIsTryBoostedSearchModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { newBookingFlowSheetRef } = useRefsContext();
    const isSearchBoosted = useAppSelector(state => selectIsSearchBoosted(state, null));

    const bottomSheetStage = useAppSelector(selectBottomSheetStage);

    const bookingId = useAppSelector(selectBookingId);
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const pricingItems = useAppSelector(state => selectPricingItems(state, null));
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const findAnotherDriverContext = useAppSelector(selectFindAnotherDriverContext);

    const [cancelEstimate, isFetching] = useEstimateEstimateIdCancelPostMutation();
    const [rideBookingTrigger] = useRideBookingListGetLazyQueryWithAppName();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const { mutate: cancelBooking, isPending } = useRideBookingRideBookingIdCancelPost(bookingId, {
        additionalInfo: 'others',
        reallocate: false,
        reasonCode: '',
        reasonStage: 'OnSearch',
    });
    const { bottom } = useSafeAreaInsets();
    const goBackToRental = useAppSelector(selectGoBackToRental);
    const { removeRoute } = useMapRoute(null, undefined);
    const { bottomSheetTopBannerRef } = useRefsContext();
    const chooseRideGoBackStage = useAppSelector(selectChooseRideGoBackStage);

    const isDynamicOfferFlow = () => {
        switch (selectedPricingItems[0]?.tripMode) {
            case TripMode.DynamicOffer:
                return true;
            default:
                return false;
        }
    };

    const onGoToOverview = useCallback(() => {
        if (props.multimodalProps?.journeyId) {
            dispatch(
                setLegIsLoading({
                    id: createJourneyId(props.multimodalProps.journeyId),
                    payload: { legOrder: props.multimodalProps.currentLegOrder, journeyRefresh: true },
                }),
            );
        }
        navigation.popTo('mainTabNavigation', {
            screen: 'liveTab_homeScreen',
            params: {
                journeyId: null,
                multimodalProps: props.multimodalProps,
            },
        });
    }, [props.multimodalProps]);

    const { skipJourneyLeg } = useJourneyActions(props.multimodalProps?.journeyId ?? null);
    const onSkipCalled = async () => {
        if (props.multimodalProps && props.multimodalProps.journeyId && props.multimodalProps.currentLegOrder) {
            const isSkipped = await skipJourneyLeg(
                props.multimodalProps.currentLegOrder,
                props.multimodalProps.journeyId,
            );
            if (isSkipped) {
                onSearchCancel();
                onGoToOverview();
            } else {
                dispatch(
                    setToastProps({
                        message: userLanguageStrings.UnabletoperformtheactionPleasetryagain,
                        backgroundColor: `${themeColors.Fill_negativeHigh}`,
                        visible: true,
                        dismissButton: () => {
                            dispatch(setToastVisible(false));
                        },
                        logo: <Danger />,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        onSpannedToastLoad: undefined,
                        autoDismissAfter: 3000,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
            }
        }
    };
    const onSearchCancel = () => {
        props.setIsTryBoostedSearchModalOpen(false);
        /* [INFO]: Cancel estimate/quotes redirects to choose ride page where we are making
               a new search call, ideally we should not make a new search call.
               Once that search call is removed, we don't need to reset confirm pickup store
    */
        resetIds(userToken, bookingId, dispatch, false);
        props.resetSearch();
        dispatch(setIsSearchBoosted({ id: searchId, payload: false }));
        dispatch(setCustomerTip({ id: searchId, payload: undefined }));
        const originalSelection = selectedPricingItems.length > 0 ? selectedPricingItems : pricingItems.slice(0, 1);
        dispatch(setSelectedPricingItems({ id: searchId, payload: originalSelection }));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'bsm_cancelEstimate' }));
    };

    const onSearchCancelError = () => {
        props.setIsTryBoostedSearchModalOpen(false);
        /* [INFO]: Cancel estimate/quotes redirects to choose ride page where we are making
               a new search call, ideally we should not make a new search call.
               Once that search call is removed, we don't need to reset confirm pickup store
    */
        resetIds(userToken, bookingId, dispatch, false);
        props.resetSearch();
        dispatch(setIsSearchBoosted({ id: searchId, payload: false }));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'bsm_cancelEstimateError' }));
    };
    const onSearchBookingAlreadyCreated = async () => {
        try {
            const response: bookingListRes | undefined = await rideBookingTrigger({
                limit: 1,
                offset: 0,
                status: 'TRIP_ASSIGNED',
                onlyActive: true,
                clientId: undefined,
            });
            if (response && response.list && response.list.length > 0) {
                const booking = response.list[0]; // TODO : check if this is okay or not with multiple Bookings
                if (!booking) {
                    console.error('No booking found');
                    return;
                }
                const isUpcoming = isUpcomingBooking(booking, 2);
                const bookingId = createBookingId(booking.id);
                if (!isUpcoming) {
                    dispatch(setBookingId({ id: userToken, payload: bookingId }));
                    setBookingAndRideDetails(booking, dispatch);
                    navigation.replace('LiveTab', {
                        screen: 'taxiRideTracking',
                        params: {
                            bookingId: bookingId,
                            multimodalProps: props.multimodalProps,
                        },
                    });
                }
            }
        } catch (error) {
            console.error('error in ride booking api ->', error);
            resetIds(userToken, bookingId, dispatch);
            props.resetSearch();
            dispatch(setIsSearchBoosted({ id: searchId, payload: false }));
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'bsm_cnclEstmteCatchErr' }));
        }
    };
    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.Fill_neutralUltraLow}] pt-[20px] pb-[${bottom}px] px-[${token?.spacing?.[16]}] rounded-[15px]`,
            )}>
            <Animated.View style={tailwind.style(`pb-${token?.spacing?.[16]}`)}>
                <Animated.View style={tailwind.style(`flex-row justify-between`)}>
                    <Animated.View
                        style={tailwind.style(`flex-col justify-between pb-${token?.spacing?.[8]} max-w-85%`)}>
                        <Typography
                            style={tailwind.style('pb-[4px]')}
                            type="title-3"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {bottomSheetStage == BottomSheetStage.RetryBoostedSearch || isSearchBoosted
                                ? userLanguageStrings.AreYouSureWantToCancel
                                : isDynamicOfferFlow()
                                  ? userLanguageStrings.TryBoostedSearch_QuestionMark
                                  : userLanguageStrings.Cancelride + '?'}
                        </Typography>
                        {/* {isDynamicOfferFlow() && bottomSheetStage !== BottomSheetStage.RetryBoostedSearch ? (
                            <Badge text={userLanguageStrings.HigherChances} accessible={false} />
                        ) : null} */}
                    </Animated.View>
                    <Button
                        testID="cancel_search_popup_close"
                        type="secondary-inverse"
                        size="md"
                        onPress={() => {
                            props.setIsTryBoostedSearchModalOpen(false);
                        }}>
                        <Icon
                            icon={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                            style={tailwind.style(`p-2px`)}
                            size={20}
                            color={themeColors.Button_Primary_Disabled_Fill_Base}
                        />
                    </Button>
                </Animated.View>
                <Typography
                    type="body-1"
                    style={tailwind.style(
                        `pt-[${token?.spacing?.[10]}] text-[${themeColors.Text_neutralHigh}] text-[14px]`,
                    )}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {bottomSheetStage == BottomSheetStage.RetryBoostedSearch
                        ? userLanguageStrings.CloseToFindingDriverConfirmCancel
                        : userLanguageStrings.WeareclosetofindingadriverMostpeoplegetaridewitha}
                    {isDynamicOfferFlow() ? userLanguageStrings.boostedsearch : userLanguageStrings.waitForRide}
                </Typography>
            </Animated.View>
            <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[16]}]`)}>
                <Button
                    testID="cancel_search_popup_primary"
                    type="primary"
                    style={{ justifyContent: 'center' }}
                    text={
                        props.multimodalProps
                            ? 'Go to Overview'
                            : bottomSheetStage == BottomSheetStage.RetryBoostedSearch
                              ? userLanguageStrings.WaitForDriver
                              : isSearchBoosted
                                ? userLanguageStrings.GoBack
                                : isDynamicOfferFlow()
                                  ? userLanguageStrings.BoostSearch
                                  : userLanguageStrings.DontCancel
                    }
                    onPress={() => {
                        if (isSearchBoosted || bottomSheetStage == BottomSheetStage.RetryBoostedSearch) {
                            if (props.multimodalProps) {
                                onGoToOverview();
                            }
                            props.setIsTryBoostedSearchModalOpen(false);
                            return;
                        }
                        switch (selectedPricingItems[0]?.tripMode) {
                            case TripMode.DynamicOffer:
                                if (props.multimodalProps) {
                                    onGoToOverview();
                                } else {
                                    newBookingFlowSheetRef.current?.snapToIndex(1);
                                }
                                props.setIsTryBoostedSearchModalOpen(false);
                                break;
                            default:
                                if (props.multimodalProps) {
                                    onGoToOverview();
                                }
                                props.setIsTryBoostedSearchModalOpen(false);
                                break;
                        }
                    }}
                />
            </Animated.View>
            <Animated.View style={tailwind.style(`mt-[${token?.spacing?.[12]}]`)}>
                <Button
                    testID="cancel_search_popup_secondary"
                    type="secondary"
                    text={userLanguageStrings.CancelAnyway}
                    colorChange={false}
                    isLoading={isPending || isFetching.isLoading}
                    onPress={async () => {
                        // Log event if user came from find another driver and clicks cancel anyway
                        if (findAnotherDriverContext) {
                            logEvent(EventName.NY_USER_FIND_ANOTHER_DRIVER_SEARCH_CANCEL, {
                                RideId: findAnotherDriverContext.rideId,
                            });
                            dispatch(setFindAnotherDriverContext(null));
                        }

                        if (bottomSheetStage == BottomSheetStage.RetryBoostedSearch) {
                            props.retryCancelClicked();
                            return;
                        }
                        switch (selectedPricingItems[0]?.tripMode) {
                            case TripMode.DynamicOffer:
                                if (props.multimodalProps && props.multimodalProps.journeyId) {
                                    await onSkipCalled();
                                    return;
                                }
                                cancelEstimate({ estimateId: selectedPricingItems[0]?.id })
                                    .unwrap()
                                    .then(data => {
                                        switch (data.result) {
                                            case 'Success':
                                                onSearchCancel();
                                                break;
                                            case 'FailedToCancel':
                                            case 'BookingAlreadyCreated':
                                                props.setIsTryBoostedSearchModalOpen(false);
                                                onSearchBookingAlreadyCreated();
                                                dispatch(
                                                    setToastProps({
                                                        visible: true,
                                                        message:
                                                            userLanguageStrings.FailedToCancelDriverAssignmentInProgress,
                                                        backgroundColor: `${themeColors.Icon_yellowHigh}`,
                                                        autoDismissAfter: 2100,
                                                        buttons: [],
                                                        useSpannedToast: undefined,
                                                        bottomSpanDescription: undefined,
                                                        spannerType: undefined,
                                                        logo: undefined,
                                                        dismissButton: undefined,
                                                        onSpannedToastLoad: undefined,
                                                        margin: undefined,
                                                        customToast: undefined,
                                                    }),
                                                );
                                                break;
                                            default:
                                                onSearchCancelError();
                                                break;
                                        }
                                    })
                                    .catch(error => {
                                        onSearchCancelError();
                                        console.error('cancel search error : ', error);
                                    });
                                break;
                            default:
                                if (props.multimodalProps && props.multimodalProps.journeyId) {
                                    await onSkipCalled();
                                    return;
                                }
                                cancelBooking(undefined, {
                                    onSuccess: () => {
                                        onSearchCancel();

                                        const resetSearchStageData = () => {
                                            dispatch(clearSession(['currentLocation']));
                                            resetIds(userToken, null, dispatch);
                                        };

                                        dispatch(setIsSearchBoosted({ id: searchId, payload: false }));
                                        dispatch(setPricingItems({ id: searchId, payload: [] }));

                                        removeRoute('defaultRoute');
                                        if (goBackToRental) {
                                            resetSearchStageData();
                                            navigation.navigate('ServicesTab', {
                                                screen: 'extendedBookingNavigator',
                                                params: {
                                                    screen: 'rentalsScreen',
                                                },
                                            });
                                        } else {
                                            const newStage = chooseRideGoBackStage;
                                            resetSearchStageData();
                                            bottomSheetTopBannerRef.current = false;
                                            if (newStage !== null) {
                                                dispatch(
                                                    setBottomSheetStage({
                                                        stage: newStage,
                                                        src: 'bckPress_chooseRide' + newStage,
                                                    }),
                                                );
                                            } else {
                                                dispatch(
                                                    setBottomSheetStage({
                                                        stage: BottomSheetStage.Search,
                                                        src: 'bckPress_chooseRide',
                                                    }),
                                                );
                                            }
                                        }
                                    },
                                    onError: (error: unknown) => {
                                        onSearchCancelError();
                                        console.error('cancel search error : ', error);
                                    },
                                });
                                break;
                        }
                    }}
                />
            </Animated.View>
        </Animated.View>
    );
};

export default TryBoostedSearchModal;
