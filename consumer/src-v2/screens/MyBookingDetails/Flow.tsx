import { BookingDetails } from './UI.tsx';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { formatTimeDifference, getFormattedRideDistance, getStopsWithDestination } from './utils';
import { BookingDetailsUIProps, JourneyDetail, MyBookingDetailsScreenAction } from './Types.ts';
import { createDispatcher, Resolver } from '@/typescript/utils/common.ts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import {
    clearSession,
    selectFeatureFlags,
    selectNewFeatureFlags,
    setToastProps,
    selectAppConfig,
} from '@/typescript/state/client/session.ts';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { createBookingId, createJourneyId, JourneyId } from '@/typescript/state/client/user.ts';
import { resetIdsAndPurge } from '@/typescript/state/sharedReducer.ts';
import { selectToken } from '@/typescript/state/client/auth.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookingRideDetailsProps } from './components/BookingRideDetails.tsx';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import {
    RatingScreenType,
    selectRatingScreenWithId,
    setRatingScreen,
    setRating,
    selectRatingWithId,
    setShowLogo,
    selectFeedbackWithId,
    selectSubmitApiDataWithId,
    selectIsFavoriteWithId,
    InsuranceDataType,
} from '@/typescript/state/client/ride.ts';
import { FareTypes, getFare } from '@/typescript/utils/fareEntityHelper';
import { createRideId } from '@/typescript/state/client/booking.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';
import { isNull } from 'lodash';
import React from 'react';
import { journeyFeedBackForm } from '@/readOnly/api/types/JourneyFeedBackForm.gen.tsx';
import { rateMultiModelTravelModes } from '@/readOnly/api/types/RateMultiModelTravelModes.gen.tsx';
import {
    selectJourneyFeedBack,
    setSubAutoJourneyFeedBack,
    setJourneyFeedBack,
} from '@/typescript/state/client/journey.ts';
import { useMultimodalJourneyIdJourneyFeedbackPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdJourneyFeedbackPost.ts';
import { MainNavigationParamList, MyRidesParamList } from '@/typescript/navigation/globalParamList.tsx';
import Clipboard from '@react-native-clipboard/clipboard';
import { Alert, NativeModules, Platform, ToastAndroid } from 'react-native';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { useRateRideMutation, useSubmitFeedbackMutation } from '@/typescript/state/server/feedbackApi.ts';
import { useApiWithOfflineFallback } from '@/typescript/hooks/useApiWithOfflineFallback.ts';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { clearAllMapSnapshots } from '@/src-v2/multimodal/utils/mapSnapshotUtils.ts';
import { useGetBookingDetailsMutation } from '@/typescript/state/server/bookingApi.ts';
import { getPropsFromBookingDetails } from '@/src-v2/screens/MyRides/UI.tsx';
import { isSingleTaxiJourney } from '@/src-v2/screens/MyRides/components/BookingDetailTopCard.tsx';
import { useHelpAndSupportHandler } from '@/typescript/hooks/kaptureLoginHandler.tsx';
import { useLazyGetAllActiveTicketsGetQuery } from '@/api/integrations/rtk/GetAllActiveTicketsGet.ts';
import { useLazyInsuranceReferenceIdGetQuery } from '@/api/integrations/rtk/InsuranceReferenceIdGet.ts';
import { getFilePath } from '@/src-v2/utils/common.ts';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import RNFS from 'react-native-fs';
import { issueCategoryRes } from '@/readOnly/api/types/IssueCategoryRes.gen.tsx';

const BookingDetailsFlow: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<MyRidesParamList, 'myRideDetails'>>();
    const routeParams = route.params;
    const dispatch = useAppDispatch();
    const [submitFeedbackApiCall] = useMultimodalJourneyIdJourneyFeedbackPostMutation();
    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const [selectedSubAutoRating, setSubAutoRating] = useState<boolean | undefined>(undefined);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const [getInsuranceApiTrigger] = useLazyInsuranceReferenceIdGetQuery();
    const themeColors = configManager.get('themeColors');

    const [getAllActiveTickets, { data: activeTickets }] = useLazyGetAllActiveTicketsGetQuery({});

    useFocusEffect(
        useCallback(() => {
            getAllActiveTickets({});
        }, []),
    );

    const journeySubAutoRatings = useAppSelector(state =>
        selectJourneyFeedBack(state, createJourneyId(routeParams.bookingDetailCard?.journeyId || '')),
    );
    const journeyRatings = useAppSelector(state =>
        selectJourneyFeedBack(state, routeParams.journeyDetailCard?.journeyDetails?.journeyId || null),
    );

    useEffect(() => {
        const selectedRating = journeySubAutoRatings?.rateTravelMode.filter(
            item => item.legOrder === routeParams.subAutoDetails?.legOrder,
        )?.[0]?.isExperienceGood;
        if (selectedRating !== undefined) {
            setSubAutoRating(selectedRating);
        }
    }, [journeySubAutoRatings]);

    const bookingDetails = routeParams.bookingDetailCard?.bookingDetail || null;
    const [estimatedDistance, actualDistance] = isNull(bookingDetails)
        ? []
        : getFormattedRideDistance(bookingDetails, userLanguageStrings);

    const currentActiveTicket = activeTickets?.activeTickets.find(
        ticket => ticket.rideId === bookingDetails?.rideList.at(0)?.shortRideId,
    )?.ticketId;

    const gettingInsurance = async (insuranceRes: InsuranceDataType) => {
        if (!insuranceRes.certificateUrl) {
            return;
        }
        if (Platform.OS === 'ios') {
            await NativeModules['RNHTMLtoPDF'].downloadPdfFromUrl(insuranceRes.certificateUrl);
            dispatch(
                setToastProps({
                    message: userLanguageStrings.InsuranceDownloadSuccessfully,
                    backgroundColor: `${colors.green900}`,
                    autoDismissAfter: 2000,
                    buttons: [],
                    visible: true,
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
        } else {
            const date = new Date();
            const fileName = `Insurance_Policy_${date.getTime()}.pdf`;

            const filePath = getFilePath() + '/' + fileName;
            try {
                await RNFS.downloadFile({
                    fromUrl: insuranceRes.certificateUrl,
                    toFile: filePath || '',
                    background: true,
                }).promise;
                await NativeModules['RNHTMLtoPDF'].sendNotification({
                    file: filePath,
                    title: userLanguageStrings.InsuranceDownload,
                    description: userLanguageStrings.InsuranceHasBeenDownloadSuccessfully,
                });
            } catch (error) {
                console.error('Download Policy Details failed: ', error);
                dispatch(
                    setToastProps({
                        message: userLanguageStrings.DownloadFailedPleaseTryAgain,
                        backgroundColor: `${themeColors.Fill_negativeHigh}`,
                        autoDismissAfter: 2000,
                        buttons: [],
                        visible: true,
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
            }
        }
    };
    const handleDownloadInsurance = async () => {
        if (!bookingDetails?.rideList[0]) {
            return;
        }
        await getInsuranceApiTrigger({ referenceId: bookingDetails.rideList[0].id })
            .unwrap()
            .then(insuranceRes => {
                gettingInsurance(insuranceRes);
            });
    };

    const handleGoToHelpAndSupport = (issueCategory: issueCategoryRes) => {
        if (newFeatureFlags.enableKaptureHelpSupport) {
            onHelpAndSupportPress(rideId?.toString(), currentActiveTicket);
        } else {
            navigation.navigate('ProfileTab', {
                screen: 'helpAndSupportNavigator',
                params: {
                    screen: 'reportIssueChatScreen',
                    params: {
                        category: {
                            category: issueCategory.category,
                            label: issueCategory.label,
                            issueCategoryId: issueCategory.issueCategoryId,
                        },
                        rideId: rideId ?? undefined,
                        issueReportId: undefined,
                        ticketId: undefined,
                        driverNumber: bookingDetails?.rideList[0]?.driverNumber,
                    },
                },
            });
        }
    };
    const handleGoToDriverInvoice = async () => {
        const journeyDetails = routeParams.journeyDetailCard?.journeyDetails ?? null;

        if (isSingleTaxiJourney(journeyDetails)) {
            const firstLeg = journeyDetails?.journeyModes[0];
            const bookingId = firstLeg?.legExtraInfo?.TAG === 'Taxi' ? firstLeg.legExtraInfo._0?.bookingId : undefined;

            if (bookingId) {
                try {
                    const data = await fetchBookingDetails(bookingId).unwrap();
                    const bookingDetails = data._0;
                    const mappedData = getPropsFromBookingDetails(bookingDetails, featureFlags);
                    navigation.navigate('ProfileTab', {
                        screen: 'myRidesNavigator',
                        params: {
                            screen: 'invoiceScreen',
                            params: {
                                ...mappedData,
                                isExpired: false,
                            },
                        },
                    });
                } catch (err) {
                    console.error('Failed to fetch booking details for invoice:', err);
                    navigation.navigate('ProfileTab', {
                        screen: 'myRidesNavigator',
                        params: {
                            screen: 'invoiceScreen',
                            params: routeParams.bookingDetailCard ?? undefined,
                        },
                    });
                }
            } else {
                navigation.navigate('ProfileTab', {
                    screen: 'myRidesNavigator',
                    params: {
                        screen: 'invoiceScreen',
                        params: routeParams.bookingDetailCard ?? undefined,
                    },
                });
            }
        } else {
            navigation.navigate('ProfileTab', {
                screen: 'myRidesNavigator',
                params: {
                    screen: 'invoiceScreen',
                    params: routeParams.bookingDetailCard ?? undefined,
                },
            });
        }
    };
    const { bookingDetailsFeedbackRef, journeyDetailsFeedbackRef, subAutoDetailsFeedbackRef, reviewModalRef } =
        useRefsContext();
    const [rateRides] = useRateRideMutation();
    const [submitFeedBack] = useSubmitFeedbackMutation();
    const { handleApiCallWithOfflineFallback } = useApiWithOfflineFallback();
    const [initiallyFavorite, setinitiallyFavorite] = useState(false);
    const feedback = useAppSelector(state => selectFeedbackWithId(state, rideId));
    const isFavorite = useAppSelector(state => selectIsFavoriteWithId(state, rideId));
    const submitApiData = useAppSelector(state => selectSubmitApiDataWithId(state, rideId));

    const handleAddFeedBack = (openJourneyFeedBack: boolean) => {
        openJourneyFeedBack
            ? journeyDetailsFeedbackRef.current?.present()
            : routeParams.subAutoDetails
              ? subAutoDetailsFeedbackRef.current?.present()
              : bookingDetailsFeedbackRef.current?.present();
    };

    const rateRide = (newRating: number) => {
        dispatch(
            setRating({
                id: rideId || null,
                payload: newRating,
            }),
        );
        dispatch(
            setRatingScreen({
                id: rideId || null,
                payload: RatingScreenType.Feedback,
            }),
        );
    };

    const onSubmit = (rating: number) => {
        setBookingDetailMiddle(prev => {
            return { ...prev, rating: rating };
        });
        routeParams?.bookingDetailCard?.setBookingData &&
            routeParams?.bookingDetailCard.setBookingData(prev => {
                if (!prev) return null;
                return prev.map(item => {
                    if (item.bookingDetail && item.bookingDetail.id === bookingDetails?.id) {
                        return {
                            ...item,
                            bookingDetail: {
                                ...item.bookingDetail,
                                rideList: item.bookingDetail.rideList.map(ride => {
                                    if (ride.id === bookingDetails.rideList.at(0)?.id) {
                                        return {
                                            ...ride,
                                            rideRating: rating,
                                        };
                                    }
                                    return ride;
                                }),
                            },
                        };
                    }
                    return item;
                });
            });
        bookingDetailsFeedbackRef.current?.close();
    };
    const { top } = useSafeAreaInsets();

    const handleCopyToClipBoard = () => {
        const shortId = routeParams.journeyDetailCard
            ? routeParams.journeyDetailCard.journeyDetails?.journeyId
            : bookingDetails?.rideList.at(0)?.shortRideId;
        Clipboard.setString(shortId ?? '');
        if (Platform.OS == 'android') {
            ToastAndroid.show('Copied', ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied');
        }
    };

    const handleSubAutoFeedback = async (
        subAutoFeedBack: rateMultiModelTravelModes | undefined,
        journeyId: JourneyId | null,
    ) => {
        if (!journeyId || !subAutoFeedBack) return;
        const feedbackReq: journeyFeedBackForm = {
            additionalFeedBack: undefined,
            rateTravelMode: [subAutoFeedBack],
            rating: undefined,
        };
        if (subAutoFeedBack.isExperienceGood == false) {
            subAutoDetailsFeedbackRef?.current?.close();
        }
        const resp = await submitFeedbackApiCall({
            journeyId: createJourneyId(journeyId),
            body: feedbackReq,
        });
        if (resp.error) {
            return;
        } else {
            if (subAutoFeedBack.isExperienceGood == false) {
                subAutoDetailsFeedbackRef?.current?.close();
            }
            dispatch(setSubAutoJourneyFeedBack({ id: createJourneyId(journeyId), payload: subAutoFeedBack }));
        }
        clearAllMapSnapshots();
    };
    const resetRating = () => {
        dispatch(
            setRating({
                id: rideId || null,
                payload: -1,
            }),
        );
        dispatch(
            setRatingScreen({
                id: rideId || null,
                payload: RatingScreenType.Review,
            }),
        );
    };
    const alternateNavigateToHome = () => {
        bookingDetailsFeedbackRef.current?.dismiss();
        resetRating();
        dispatch(clearSession());
        resetIdsAndPurge(
            userToken,
            routeParams.bookingDetailCard?.bookingDetail?.id
                ? createBookingId(routeParams.bookingDetailCard?.bookingDetail?.id)
                : null,
            dispatch,
        );
    };

    const resolver: Resolver<MyBookingDetailsScreenAction> = async action => {
        switch (action.type) {
            case 'GO_BACK':
                navigation.goBack();
                break;
            case 'COPY_TO_CLIPBOARD':
                handleCopyToClipBoard();
                break;
            case 'GO_TO_HELP_AND_SUPPORT':
                if (action.payload) handleGoToHelpAndSupport(action.payload.issueCategory);
                break;
            case 'GO_TO_DRIVER_INVOICE':
                handleGoToDriverInvoice();
                break;
            case 'DOWNLOAD_INSURANCE_POLICY':
                handleDownloadInsurance();
                break;
            case 'ADD_FEEDBACK':
                handleAddFeedBack(action.payload?.openJourneyFeedBack || false);
                break;
            case 'ALTERNATE_NAVIGATE_TO_HOME':
                alternateNavigateToHome();
                break;
            case 'ADD_SUBAUTO_FEEDBACK':
                handleSubAutoFeedback(action.payload?.subAutoFeedBack, action.payload?.journeyId ?? null);
                break;
            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    };
    const mbdDispatch = createDispatcher(resolver);

    const featureFlags = useAppSelector(selectFeatureFlags);
    const userToken = useAppSelector(selectToken);
    const rideId = bookingDetails?.rideList[0] ? createRideId(bookingDetails.rideList[0].id) : null;
    const rating = useAppSelector(state => selectRatingWithId(state, rideId));

    const ratingScreen = useAppSelector(state => selectRatingScreenWithId(state, rideId));

    const baseFare = getFare(
        bookingDetails?.estimatedFareBreakup ?? [], //check
        FareTypes.BASE_FARE,
        false,
        true,
        userLanguageStrings,
        bookingDetails?.isPetRide || false,
        bookingDetails?.vehicleServiceTierType ?? 'UNKNOWN_SERVICE_TYPE',
        undefined,
    );

    const [bookingDetailMiddle, setBookingDetailMiddle] = useState<BookingRideDetailsProps>({
        vehicleModel: bookingDetails?.rideList.at(0)?.vehicleModel || '',
        driver: bookingDetails?.rideList.at(0)?.driverName || '',
        actualDistance,
        estimatedDistance,
        rideShortId: bookingDetails?.rideList.at(0)?.shortRideId || '',
        rating: !isNull(routeParams.subAutoDetails) ? undefined : bookingDetails?.rideList.at(0)?.rideRating,
        rideTime: formatTimeDifference(
            bookingDetails?.rideList.at(0)?.rideStartTime,
            bookingDetails?.rideList.at(0)?.rideEndTime,
        ),
        estimatedDuration: bookingDetails?.estimatedDuration,
        rideEndTime: bookingDetails?.rideList.at(0)?.rideEndTime || '',
        status: bookingDetails?.rideList.at(0)?.status,
        fare: baseFare,
        isPetRide: bookingDetails?.isPetRide || false,
        rideStartTime: bookingDetails?.rideList.at(0)?.rideStartTime || '',
    });

    useEffect(() => {
        if (!isNull(routeParams.subAutoDetails)) {
            setBookingDetailMiddle(prev => ({
                ...prev,
                rating: selectedSubAutoRating,
            }));
        } else if (rating > 0) {
            setBookingDetailMiddle(prev => {
                if (prev.rating === undefined) {
                    return { ...prev, rating: rating };
                }
                return prev;
            });
        }
    }, [selectedSubAutoRating, rating, routeParams.subAutoDetails]);

    const onHelpAndSupportPress = useHelpAndSupportHandler();

    useEffect(() => {
        // resetRating();
        return () => {
            bookingDetailsFeedbackRef.current?.close();
        };
    }, []);
    const snapPoints = useMemo(() => {
        switch (ratingScreen) {
            case RatingScreenType.Review:
                if (rating <= 0) {
                    return undefined;
                } else {
                    return [0.42 * SCREEN_HEIGHT];
                }
            case RatingScreenType.Feedback:
                return [0.54 * SCREEN_HEIGHT, SCREEN_HEIGHT * 0.9];
            default:
                return [];
        }
    }, [ratingScreen]);

    const reviewAndFeedbackApiCall = async () => {
        // this calls api for rating and submits feedback
        try {
            const rateRide_mutationConfig = {
                feedbackDetails: feedback,
                rating: rating,
                rideId: rideId,
                wasOfferedAssistance: undefined,
                shouldFavDriver: initiallyFavorite,
            };
            const submitFeedBack_mutationConfig = {
                feedback: submitApiData?.map(item => {
                    return {
                        answer: [item?.question],
                        questionId: item?.id,
                    };
                }),
                rideId: rideId,
            };
            await handleApiCallWithOfflineFallback({
                endpoint: 'rateRide',
                mutationFn: rateRides,
                mutationConfig: rateRide_mutationConfig,
                onlyNoInternet: undefined,
            });

            logEvent(EventName.NY_USER_RIDE_GIVE_FEEDBACK, { Rating: rating });

            await handleApiCallWithOfflineFallback({
                endpoint: 'submitFeedback',
                mutationFn: submitFeedBack,
                mutationConfig: submitFeedBack_mutationConfig,
                onlyNoInternet: undefined,
            });

            reviewModalRef.current?.close();
            onSubmit(rating);
            dispatch(setShowLogo({ id: rideId, payload: true }));
            bookingDetailsFeedbackRef.current?.close();
        } catch (err) {
            console.error('Ratings api error', err);
        }
    };
    useEffect(() => {
        setinitiallyFavorite(isFavorite);
    }, [isFavorite]);

    const appConfig = useAppSelector(selectAppConfig);
    const isMultimodal = appConfig.appType === 'multimodal';
    const rideDistance = bookingDetailMiddle.actualDistance ?? bookingDetailMiddle.estimatedDistance ?? '';
    const rideTime = bookingDetailMiddle.rideTime;
    const journeyId = routeParams?.journeyDetailCard?.journeyDetails?.journeyId ?? null;
    const feedbackPresent = useAppSelector(state => selectJourneyFeedBack(state, createJourneyId(journeyId ?? '')));

    const currentRating = feedbackPresent?.rating ?? 0;

    const handleRatingChange = (rating: number) => {
        try {
            if (journeyId) {
                dispatch(
                    setJourneyFeedBack({
                        id: createJourneyId(journeyId),
                        payload: {
                            additionalFeedBack: undefined,
                            rateTravelMode: [],
                            rating,
                        },
                    }),
                );
            }
        } catch (error) {
            console.error('Error submitting feedback', error);
        }
    };
    if (routeParams.journeyDetailCard) {
        const journey: JourneyDetail = {
            subAutoLegDetails: null,
            journeyDetails: routeParams.journeyDetailCard.journeyDetails,
            journeyId: routeParams.journeyDetailCard.journeyDetails?.journeyId ?? null,
        };
        const bookingDetails = routeParams.journeyDetailCard.bookingDetailMiddle;

        return (
            <BookingDetails
                rating={rating}
                reviewAndFeedbackApiCall={reviewAndFeedbackApiCall}
                initiallyFavorite={initiallyFavorite}
                setinitiallyFavorite={setinitiallyFavorite}
                {...routeParams.journeyDetailCard}
                mbdDispatch={mbdDispatch}
                top={top}
                ratingScreen={ratingScreen}
                // resetRating={() => {}}
                rateRide={() => {}}
                onSubmit={() => {}}
                // alternateNavigateToHome={() => {}}
                snapPoints={[]}
                bookingDetailsFeedbackRef={journeyDetailsFeedbackRef}
                refreshData={() => {}}
                rideDetail={routeParams.journeyDetailCard.rideDetails}
                showEstimate={routeParams.showEstimate}
                showHelpAndSupport={(routeParams.issueCategory && routeParams.showHelpAndSupport) ?? false}
                isCancelled={routeParams.isCancelled}
                journey={journey}
                bookingDetailMiddle={{
                    ...bookingDetails,
                    rating: journeyRatings?.rating,
                }}
                isMultimodal={isMultimodal}
                rideDistance={bookingDetails?.actualDistance ?? bookingDetails?.estimatedDistance ?? rideDistance}
                rideTime={bookingDetails?.rideTime ?? rideTime}
                currentRating={currentRating}
                onRatingChange={handleRatingChange}
                showTrainDetailsInMyRides={newFeatureFlags.showTrainDetailInMyRides}
                isInsured={false}
                stopsInfo={undefined}
                issueCategory={routeParams.issueCategory}
            />
        );
    } else {
        const routeParam = routeParams.bookingDetailCard;
        if (isNull(routeParam) || isNull(bookingDetails)) {
            return <></>;
        }
        const fromLocation = bookingDetails.fromLocation;
        const stops = getStopsWithDestination(bookingDetails.bookingDetails);

        const showEstimate = featureFlags.myRidesDetails.showEstimate;
        const showRideDetails = featureFlags.myRidesDetails.showRideDetails;
        const showHelpAndSupport =
            featureFlags.myRidesDetails.showHelpAndSupport &&
            (routeParams.issueCategory ?? false) &&
            (routeParams.showHelpAndSupport ?? true);

        const refreshData = routeParam.refreshData;

        const localState: BookingDetailsUIProps = {
            fromLocation,
            stops,
            rideStartTime: bookingDetails.rideList.at(0)?.rideStartTime ?? bookingDetails.rideScheduledTime,
            stopsInfo: bookingDetails.rideList.at(0)?.stopsInfo,
            rideEndTime: bookingDetails.rideList.at(0)?.rideEndTime,
            rideDetail: routeParam,
            bookingDetailMiddle,
            mbdDispatch,
            showEstimate,
            showRideDetails,
            tripCategory: bookingDetails.tripCategory,
            showHelpAndSupport,
            isCancelled: routeParams.isCancelled,
            top,
            ratingScreen,
            // resetRating,
            rateRide,
            onSubmit,
            // alternateNavigateToHome,
            snapPoints,
            bookingDetailsFeedbackRef: routeParams.subAutoDetails
                ? subAutoDetailsFeedbackRef
                : bookingDetailsFeedbackRef,
            refreshData,
            autoClickAction: () => {},
            transcitLegRating: undefined,
            journey: routeParams.subAutoDetails
                ? {
                      journeyDetails: null,
                      subAutoLegDetails: { subAutoLegOrder: routeParams.subAutoDetails.legOrder },
                      journeyId: createJourneyId(routeParams.bookingDetailCard?.journeyId || '') ?? null,
                  }
                : null,
            rating: rating,
            reviewAndFeedbackApiCall,
            initiallyFavorite,
            setinitiallyFavorite,
            isMultimodal,
            rideDistance,
            rideTime,
            currentRating,
            onRatingChange: handleRatingChange,
            showTrainDetailsInMyRides: newFeatureFlags.showTrainDetailInMyRides,
            isInsured: bookingDetails.isInsured || false,
            issueCategory: routeParams.issueCategory,
        };
        return <BookingDetails {...localState} />;
    }
};

export default BookingDetailsFlow;
