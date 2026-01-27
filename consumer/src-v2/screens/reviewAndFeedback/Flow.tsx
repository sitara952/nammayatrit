import mtIcBikeRideComplete from '@/typescript/assets/ny-service/mt_ic_bike_ride_complete.webp';
import mtIcCarRideComplete from '@/typescript/assets/ny-service/mt_ic_car_ride_complete.webp';
import mtIcAutoRight1 from '@/typescript/assets/ny-service/mt_auto_right_avatar.webp';
import mtIcAmbulanceRight from '@/typescript/assets/ny-service/ny_ic_ambulance_non_ac.webp';
import mtIcAcPriorityCabComplete from '@/typescript/assets/ny-service/ny_ic_priority_cab.webp';
import mtIcBikePlusComplete from '@/typescript/assets/ny-service/ny_ic_bike_plus.webp';
import nyIcERickshawRideComplete from '@/typescript/assets/ny-service/ny_ic_e_rickshaw_ride_complete.webp';
import mtIcAutoPriority from '@/typescript/assets/vehicleImages/mt_ic_auto_priority.webp';
import {
    selectBookingDetailsWithId,
    selectBookingSpecialAssistance,
    selectPostRideChecksWithBookingId,
    selectRideIdWithBookingId,
} from '@/typescript/state/client/booking';
import {
    RatingScreenType,
    selectRatingScreenWithId,
    selectRatingWithId,
    selectRideDetailsWithId,
    selectShowLogoWithId,
    setCurrentChatSessionId,
    setIsFavorite,
    setRating,
    setRatingScreen,
} from '@/typescript/state/client/ride';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { resetIdsAndPurge } from '@/typescript/state/sharedReducer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Keyboard, LayoutChangeEvent, NativeModules } from 'react-native';

import {
    useFrontendNotifyEventPostMutation,
    frontendNotifyEventPostWithParams,
} from '@/api/integrations/rtk/FrontendNotifyEventPost';
import { clearAllUserData, clearSession, selectAppConfig } from '@/typescript/state/client/session';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { selectAppReadableName, selectFeatureFlags } from '@/typescript/state/client/session';
import { selectToken } from '@/typescript/state/client/auth';
import { getStringItem, MMKVKey, setStringItem } from '@/typescript/utils/MMKV';
import { createDispatcher, getDiffBetweenTimes, minimizeApp, Resolver } from '@/typescript/utils/common';
import { createBookingId, selectCachedDestinations, setReferralAmountToCollect } from '@/typescript/state/client/user';
import { getPropsFromBookingDetails } from '@/src-v2/screens/MyRides/UI';
import { useRateRideMutation } from '@/typescript/state/server/feedbackApi';
import { useApiWithOfflineFallback } from '@/typescript/hooks/useApiWithOfflineFallback.ts';
import { useGetBookingDetailsMutation } from '@/typescript/state/server/bookingApi';
import {
    selectFeedbackWithId,
    selectIsFavoriteWithId,
    selectSubmitApiDataWithId,
    setShowLogo,
} from '@/typescript/state/client/ride';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { HomeTabParamList, MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { ReviewAndFeedbackProps, ReviewAndFeedbackScreenAction } from './Types';
import { ReviewAndFeedback } from '../reviewAndFeedback/UI';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useLazyGetProfileQuery } from '@/typescript/state/server/userApi';
import { selectUserProfile } from '@/typescript/state/client/user';
import { tripVehicle } from '@/src-v2/helpers/location/types/LocationCachingObject';
import { isOneWayBooking, updateSuggestedTrips } from '@/src-v2/helpers/location/utils/LocationCaching';
import { transformLocationApiEntityToLocation } from '@/typescript/utils/placeUtils';
import { RideDetailCardProps } from '../MyBookingDetails/Types';
import { resetSosState } from '@/typescript/state/client/sos';
import { clearAllMapSnapshots } from '@/src-v2/multimodal/utils/mapSnapshotUtils';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { buildFeedbackArray } from './components/RideCompletedBottomSheetContent';

const ReviewAndFeedBack = () => {
    const [updateFrontendNotifyEvent] = useFrontendNotifyEventPostMutation();
    const rateRide = (newRating: number) => {
        dispatch(setRating({ id: rideId, payload: newRating }));
        dispatch(setRatingScreen({ id: rideId, payload: RatingScreenType.Feedback }));
    };
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [rateRides] = useRateRideMutation();
    const { handleApiCallWithOfflineFallback } = useApiWithOfflineFallback();
    const [fetchFreshBookingDetails] = useGetBookingDetailsMutation();

    const route: RouteProp<HomeTabParamList, 'reviewAndFeedback'> = useRoute();
    const bookingId = route.params?.bookingId ? createBookingId(route.params?.bookingId) : null;
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const submitApiData = useAppSelector(state => selectSubmitApiDataWithId(state, rideId));

    const [estimatedPriceWidth, setEstimatedPriceWidth] = useState(0);
    const [initiallyFavorite, setinitiallyFavorite] = useState(false);
    const [isFetchingFreshData, setIsFetchingFreshData] = useState(false);
    const multimodalProps = route.params?.multimodalProps;
    const handleOnLayout = useCallback((event: LayoutChangeEvent | undefined) => {
        if (event) {
            const { width } = event.nativeEvent.layout;
            setEstimatedPriceWidth(width);
        }
    }, []);

    const navigateToNextTransit = useCallback(() => {
        navigation.popTo('mainTabNavigation', {
            screen: 'liveTab_homeScreen',
            params: {
                journeyId: null,
                multimodalProps: multimodalProps,
            },
        });
    }, [multimodalProps?.journeyId]);

    const reviewAndFeedbackApiCall = async () => {
        // this calls api for rating and submits feedback
        try {
            const feedbackAnswers = buildFeedbackArray(submitApiData);

            const rateRide_mutationConfig = {
                feedbackDetails: feedback,
                rating: rating,
                rideId: rideDetails?.id,
                wasOfferedAssistance: undefined,
                shouldFavDriver: initiallyFavorite,
                feedbackAnswers,
            };

            await handleApiCallWithOfflineFallback({
                endpoint: 'rateRide',
                mutationFn: rateRides,
                mutationConfig: rateRide_mutationConfig,
                onlyNoInternet: undefined,
            });

            logEvent(EventName.NY_USER_RIDE_GIVE_FEEDBACK, { Rating: rating });

            Keyboard.dismiss();
            reviewModalRef.current?.close();
            if (appConfig.screenConfig.reviewAndFeedbackScreenConfig.showRideEndThankYouScreen) {
                dispatch(setShowLogo({ id: rideId, payload: true }));
            } else {
                if (multimodalProps && !multimodalProps.isLastMile) {
                    navigateToNextTransit();
                } else {
                    navigateToHome(false);
                }
            }
        } catch (err) {
            console.error('Ratings api error', err);
        }
    };
    const skipToHome = useCallback(async (skipFeedback: boolean) => {
        const ratingSkipEventReq: frontendNotifyEventPostWithParams = {
            body: { event: 'RATE_DRIVER_SKIPPED' },
        };
        if (skipFeedback) {
            try {
                await updateFrontendNotifyEvent(ratingSkipEventReq).unwrap();
            } catch (err) {
                console.error('Profile Update Error:', err);
            }
        }
    }, []);

    const ratingScreen = useAppSelector(state => selectRatingScreenWithId(state, rideId));
    const showLogo = useAppSelector(state => selectShowLogoWithId(state, rideId));
    const originalRideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const postRideChecks = useAppSelector(state => selectPostRideChecksWithBookingId(state, bookingId));
    const userToken = useAppSelector(selectToken);
    const rating = useAppSelector(state => selectRatingWithId(state, rideId));
    const featureFlags = useAppSelector(selectFeatureFlags);
    const appName = useAppSelector(selectAppReadableName);
    const userProfile = useAppSelector(selectUserProfile);
    const isFavorite = useAppSelector(state => selectIsFavoriteWithId(state, rideId));
    const feedback = useAppSelector(state => selectFeedbackWithId(state, rideId));
    const bookingSpecialAssistance = useAppSelector(state => selectBookingSpecialAssistance(state, bookingId));
    const appConfig = useAppSelector(selectAppConfig);
    const dispatch = useAppDispatch();

    // Fetch fresh booking details if rideDetails is null
    useEffect(() => {
        const fetchFreshData = async () => {
            if (bookingId && !isFetchingFreshData) {
                setIsFetchingFreshData(true);
                try {
                    await fetchFreshBookingDetails(bookingId).unwrap();
                } catch (error) {
                    console.error('Failed to fetch fresh booking details:', error);
                } finally {
                    setIsFetchingFreshData(false);
                }
            }
        };

        fetchFreshData();
    }, [bookingId]);

    // Use the original rideDetails (which should be updated after the API call)
    const rideDetails: rideAPIEntity | null = originalRideDetails;

    const resetDefaultValues = () => {
        dispatch(clearSession());
        resetIdsAndPurge(userToken, bookingId, dispatch);
    };
    const allCachedDestinations = useAppSelector(selectCachedDestinations);
    const destinationLocation = isOneWayBooking(bookingDetails?.bookingDetails.TAG)
        ? bookingDetails?.bookingDetails._0.toLocation
        : undefined;
    const sourceLocation = isOneWayBooking(bookingDetails?.bookingDetails.TAG)
        ? bookingDetails?.fromLocation
        : undefined;

    const isFirstRideTaken = getStringItem(MMKVKey.CUSTOMER_FIRST_RIDE);
    const [getProfileTrigger, { data: profileRes }] = useLazyGetProfileQuery();

    const updateCachedTrips = () => {
        if (bookingDetails && rideDetails && destinationLocation && sourceLocation) {
            const vehicle: tripVehicle = {
                vehicleImage: bookingDetails.vehicleIconUrl,
                vehicleVariant: rideDetails.vehicleVariant,
                vehicleVariantName: bookingDetails.serviceTierName,
            };
            updateSuggestedTrips(
                transformLocationApiEntityToLocation(destinationLocation),
                transformLocationApiEntityToLocation(sourceLocation),
                dispatch,
                userToken,
                allCachedDestinations,
                vehicle,
            );
        }
    };

    useEffect(() => {
        const updateFirstRideStatus = async () => {
            const profileResponse = await getProfileTrigger().unwrap();
            const amountToCollect =
                (profileResponse?.referralEarnings ?? 0) +
                (profileResponse?.referredByEarnings ?? 0) -
                (profileResponse?.referralAmountPaid ?? 0);
            dispatch(setReferralAmountToCollect({ id: userToken, payload: amountToCollect }));
        };
        if (!isFirstRideTaken && userProfile?.isPayoutEnabled) {
            updateFirstRideStatus();
        }
        if (
            bookingDetails &&
            bookingDetails.bookingDetails.TAG !== 'INTER_CITY' &&
            bookingDetails.bookingDetails.TAG !== 'RENTAL'
        ) {
            updateCachedTrips();
        }
    }, []);

    const navigateToHome = useCallback(
        (skipToHomeVal: boolean) => {
            if (multimodalProps?.journeyId) {
                clearAllMapSnapshots();
                dispatch(clearAllUserData());
            }
            resetDefaultValues();
            if (rating >= 4) {
                const { AppRatings } = NativeModules;
                AppRatings.callAppRatings();
            }
            dispatch(resetSosState());
            skipToHome(skipToHomeVal);
            if (!isFirstRideTaken && profileRes?.hasTakenRide) {
                setStringItem(MMKVKey.CUSTOMER_FIRST_RIDE, 'true');
                if (
                    userProfile?.isPayoutEnabled &&
                    !profileRes?.payoutVpa &&
                    ((profileRes?.referredByEarnings ?? 0) > 0 || (profileRes?.referralEarnings ?? 0) > 0)
                ) {
                    collectReferralEarningModalRef.current?.present();
                } else {
                    navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                }
            } else {
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
            }
        },
        [
            rating,
            userProfile?.isPayoutEnabled,
            isFirstRideTaken,
            profileRes?.hasTakenRide,
            profileRes?.payoutVpa,
            profileRes?.referredByEarnings,
        ],
    );

    const transportAvatarUriFn = () => {
        switch (rideDetails?.vehicleServiceTierType) {
            case 'AUTO_RICKSHAW':
                return mtIcAutoRight1;
            case 'AUTO_PLUS':
                return mtIcAutoPriority;
            case 'AMBULANCE_TAXI':
            case 'AMBULANCE_TAXI_OXY':
            case 'AMBULANCE_AC':
            case 'AMBULANCE_AC_OXY':
            case 'AMBULANCE_VENTILATOR':
                return mtIcAmbulanceRight;
            case 'SEDAN':
                return mtIcCarRideComplete;
            case 'BIKE':
            case 'DELIVERY_BIKE':
                return mtIcBikeRideComplete;
            case 'BIKE_PLUS':
                return mtIcBikePlusComplete;
            case 'AC_PRIORITY':
                return mtIcAcPriorityCabComplete;
            case 'E_RICKSHAW':
                return nyIcERickshawRideComplete;
            default:
                return mtIcCarRideComplete;
        }
    };

    const handleSosOrCallPolicePress = useCallback(() => {
        navigation.navigate('safetyTools', {
            bookingId: bookingId,
            isRideEnded: true,
        });
    }, [bookingId]);

    useEffect(() => {
        if (ratingScreen === RatingScreenType.Feedback) {
            setTimeout(() => {
                reviewModalRef.current?.expand();
            }, 15);
        }
    }, [ratingScreen]);

    const fareDifference = (rideDetails?.computedPrice ?? 0) - (bookingDetails?.estimatedTotalFare ?? 0);

    function getWaitingCharges(): number | undefined {
        const fareBreakup = bookingDetails?.fareBreakup ?? [];
        for (const item of fareBreakup) {
            if (item.description === 'WAITING_OR_PICKUP_CHARGES') {
                return item.amount;
            }
        }

        return undefined;
    }
    const waitingCharges: number | undefined = getWaitingCharges();

    function getDistanceFareDiff(): number | undefined {
        if (rideDetails && rideDetails.computedPrice && bookingDetails) {
            const fare = Math.abs(rideDetails.computedPrice - (waitingCharges ?? 0));
            return Math.abs(bookingDetails.estimatedFare - fare);
        }

        return undefined;
    }

    const distanceFareDiff = getDistanceFareDiff();

    function getExtraTimeFare(): number | undefined {
        const fareBreakup = bookingDetails?.fareBreakup ?? [];
        for (const item of fareBreakup) {
            if (item.description === 'TIME_BASED_FARE') {
                return item.amount;
            }
        }

        return undefined;
    }

    const extraTimeFare: number | undefined = getExtraTimeFare();

    function getExtraDistanceFare(): number | undefined {
        const fareBreakup = bookingDetails?.fareBreakup ?? [];
        for (const item of fareBreakup) {
            if (item.description === 'DIST_BASED_FARE') {
                return item.amount;
            }
        }

        return undefined;
    }

    const absFareDifference = Math.abs(fareDifference);
    const extraDistanceFare: number | undefined = getExtraDistanceFare();

    const extraTime =
        getDiffBetweenTimes(bookingDetails?.rideStartTime ?? '', bookingDetails?.rideEndTime ?? '') -
        (bookingDetails?.estimatedDuration ?? 0);

    //react-native-reanimated (Reanimated v2+) does not allow certain JavaScript functions, like FadeOut or FadeIn, to be directly used within useAnimatedStyle or animations
    //else It will throw ReanimatedError: JS Functions are not convertible to dynamic

    const { reviewModalRef, collectReferralEarningModalRef } = useRefsContext();

    useEffect(() => {
        dispatch(setCurrentChatSessionId({ id: rideId, payload: null }));
        AccessibilityInfo.announceForAccessibilityWithOptions('Ride Completed', {
            queue: true,
        });
    }, []);

    const handleRideChecksPopup = useCallback(
        (type: RideChecksType) => {
            if (!bookingDetails) return;
            const payload = {
                toll:
                    type === RideChecksType.TollIncluded || type === RideChecksType.TollExcluded
                        ? RideChecksType.Acknowledged
                        : postRideChecks.toll,
            };
            const storage = { [bookingDetails.id]: payload };
            setStringItem(MMKVKey.POST_RIDE_CHECKS, JSON.stringify(storage));
            // ------------------------------------------------------------ Not required for now ------------------------------------------------------------
            // dispatch(
            //   setPostRideChecks({
            //     id: bookingId,
            //     payload: payload,
            //   }),
            // );
        },
        [bookingDetails],
    );

    const backPress = useCallback(() => {
        minimizeApp();
    }, []);

    const handleOnPressRideDetails = useCallback(() => {
        if (bookingDetails) {
            const bookingProps = getPropsFromBookingDetails(bookingDetails, featureFlags);
            const rideDetailCard: RideDetailCardProps = {
                bookingDetailCard: {
                    date: bookingProps.date,
                    time: bookingProps.time,
                    price: bookingProps.price,
                    vehicleServiceTier: bookingProps.vehicleServiceTier,
                    type: bookingProps.type,
                    from: bookingProps.from,
                    to: bookingProps.to,
                    status: bookingProps.status,
                    vehicleIconUrl: bookingDetails.vehicleIconUrl || transportAvatarUri,
                    rideStatus: bookingProps.rideStatus,
                    currency: bookingProps.currency,
                    bookingDetail: bookingProps.bookingDetail,
                    refreshData: undefined,
                    setBookingData: undefined,
                    journeyId: null,
                    isExpired: false,
                    rideId: rideDetails?.id,
                },
                journeyDetailCard: null,
                showEstimate: bookingProps.showEstimate,
                showHelpAndSupport: false,
                isCancelled: bookingProps.isCancelled,
                subAutoDetails: null,
                issueCategory: undefined,
            };
            navigation.navigate('ProfileTab', {
                screen: 'myRidesNavigator',
                params: { screen: 'myRideDetails', params: rideDetailCard },
            });
        } else {
            navigation.navigate('tripDetail', {
                viewParam: 'tripDetail',
            });
        }
    }, [bookingDetails]);

    useEffect(() => {
        setinitiallyFavorite(isFavorite);
    }, [isFavorite]);

    const logReviewEvent = useCallback(() => {
        switch (rating) {
            case 5:
                logEvent(EventName.NY_USER_FIVESTAR_RATING);
                break;
            case 4:
                logEvent(EventName.NY_USER_FOURSTAR_RATING);
                break;
            case 3:
                logEvent(EventName.NY_USER_THREESTAR_RATING);
                break;
            case 2:
                logEvent(EventName.NY_USER_TWOSTAR_RATING);
                break;
            case 1:
                logEvent(EventName.NY_USER_ONESTAR_RATING);
                break;
            default:
                logEvent(EventName.NY_USER_STAR_RATING);
        }
    }, [rating]);

    const resolver: Resolver<ReviewAndFeedbackScreenAction> = useCallback(
        async (action: ReviewAndFeedbackScreenAction) => {
            switch (action.type) {
                case 'REVIEW_AND_FEED_BACK_API_CALL':
                    logReviewEvent();
                    reviewAndFeedbackApiCall();
                    dispatch(setIsFavorite({ id: rideId, payload: initiallyFavorite }));
                    break;
                case 'ON_PRESS_RIDE_DETAILS':
                    handleOnPressRideDetails();
                    break;
                case 'GO_TO_JOURNEY_OVERVIEW':
                    navigateToNextTransit();
                    break;
                case 'HANDLE_RIDE_CHECK_POP_UP':
                    handleRideChecksPopup(action.payload?.type ?? RideChecksType.None);
                    break;
                case 'RATE_RIDE':
                    rateRide(action.payload?.rating ?? 0);
                    break;
                case 'HANDLE_ON_LAYOUT':
                    handleOnLayout(action.payload?.event);
                    break;
                case 'HANDLE_SOS_PRESS':
                    handleSosOrCallPolicePress();
                    break;
                case 'HANDLE_HARDWARE_BACK_PRESS':
                    backPress();
                    break;
            }
        },
        [
            navigation,
            reviewAndFeedbackApiCall,
            handleOnPressRideDetails,
            handleRideChecksPopup,
            rateRide,
            handleOnLayout,
            handleSosOrCallPolicePress,
            backPress,
        ],
    );
    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const transportAvatarUri = transportAvatarUriFn();

    const viewState: ReviewAndFeedbackProps = {
        rideId,
        bookingId,
        rating,
        showLogo,
        navigateToHome,
        featureFlags,
        absFareDifference,
        rideDetails,
        distanceFareDiff,
        waitingCharges,
        specialAssistance: bookingSpecialAssistance,
        bookingDetails,
        extraTimeFare,
        fareDifference,
        extraTime,
        appName,
        extraDistanceFare,
        rcsDispatch,
        reviewAndFeedbackApiCall,
        ratingScreen,
        transportAvatarUri,
        estimatedPriceWidth,
        rideCompleteBgUri: appConfig.screenConfig.reviewAndFeedbackScreenConfig.rideCompleteBgUri,
        initiallyFavorite,
        setinitiallyFavorite,
        multimodalProps,
    };

    return <ReviewAndFeedback {...viewState} />;
};

export { ReviewAndFeedBack };
