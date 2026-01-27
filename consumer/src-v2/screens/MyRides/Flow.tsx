import { createDispatcher, Resolver } from '@/typescript/utils/common.ts';
import MyRides, { convertTimestamp, getPropsFromBookingDetails, RideStatus, RideType } from './UI.tsx';
import { isSingleTaxiJourneyFromResp } from './components/BookingDetailTopCard.tsx';
import { useMultimodalJourneyIdBookingInfoGetMutation } from '@/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet.ts';
import { MyRidesAction, MyRideScreenProps } from './Types.ts';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen.tsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import { formatDistanceWithUnit, mkDataForjourneySummary, mkDataTranscitLegRatingProp } from '@/src-v2/utils/common.ts';
import { JourneyDetailCardProps } from '../MyBookingDetails/Types.ts';
import {
    getDistanceOrUnitForJourney,
    getlocationAPIEntitySourceOrDestination,
    getPriceOrCurrencyForJourney,
} from '@/typescript/utils/MultiModal.ts';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import {
    BottomSheetStage,
    SearchInput,
    selectFeatureFlags,
    selectNewFeatureFlags,
    setActiveInput,
    setBottomSheetStage,
} from '@/typescript/state/client/session.ts';
import { useGetBookingDetailsMutation } from '@/typescript/state/server/bookingApi.ts';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen.tsx';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { dummyLocationApiEntity } from '@/typescript/utils/location.ts';
import { getPlaceArea } from '@/typescript/utils/placeUtils.ts';
import { formatTimeDifference } from '../MyBookingDetails/utils.ts';
import { createJourneyId, createJourneyIdString, JourneyId } from '@/typescript/state/client/user.ts';
import { useMultimodalJourneyIdFeedbackGetMutation } from '@/api/integrations/rtk/MultimodalJourneyIdFeedbackGet.ts';
import { selectJourneyFeedBack, setJourneyFeedBack } from '@/typescript/state/client/journey.ts';
import { getCurrency } from '@/typescript/utils/getCurrency.ts';
import { MainNavigationParamList, MyRidesParamList } from '@/typescript/navigation/globalParamList.tsx';
import { getTicketStatus } from '@/src-v2/multimodal/screens/LiveTicket/Tickets/TicketUtils.tsx';
import { FeatureFlags } from '@/src-v2/systems/configs/types.ts';
import { logger } from '@/src-v2/systems/logger/index.ts';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useIssueCategoryGetQuery } from '@/api/integrations/rtk/IssueCategoryGet.ts';
import { useHelpAndSupportHandler } from '@/typescript/hooks/kaptureLoginHandler.tsx';

export const isActiveRide = (
    isActive: boolean,
    isExpired: boolean | undefined,
    journeyInfoResp: journeyInfoResp | null,
): boolean => {
    if (!journeyInfoResp) return false;
    const ticketStatus = getTicketStatus(
        journeyInfoResp.journeyStatus,
        journeyInfoResp.legs.length > 0,
        journeyInfoResp.legs.map(l => l.legExtraInfo),
    );
    return (
        isActive &&
        !isExpired &&
        (!journeyInfoResp || (journeyInfoResp.journeyStatus === 'INPROGRESS' && ticketStatus === 'live'))
    );
};

const MyRidesFlow: React.FC = () => {
    const [getJourneyInfoApiCall] = useMultimodalJourneyIdBookingInfoGetMutation();
    const [getJourneyRatingsApiCall] = useMultimodalJourneyIdFeedbackGetMutation();
    const [journeyResp, setJourneyResp] = useState<journeyInfoResp | undefined>(undefined);
    const [journeyId, setJourneyId] = useState<JourneyId | null>(null);
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const route = useRoute<RouteProp<MyRidesParamList, 'myRidesScreen'>>();
    const isHelpAndSupportScreen = route.params?.isHelpAndSupportScreen;
    const issueCategory = route.params?.issueCategory;
    const enableKaptureHelpSupport = useAppSelector(selectNewFeatureFlags).enableKaptureHelpSupport;
    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const onHelpAndSupportPress = useHelpAndSupportHandler();

    const { data: issueCategories } = useIssueCategoryGetQuery({
        language: 'en',
    });

    const journeySummaryData = useMemo(() => {
        const result = mkDataForjourneySummary(journeyResp?.legs);

        // Log any errors with journeyId for debugging
        if (result.errorMessage && journeyId) {
            logger.logDebug(
                `Journey ${createJourneyIdString(journeyId)} - totalFare issues: ${result.errorMessage}`,
                'MultimodalJourneySummary',
            );
        }

        return result.journeySummary;
    }, [journeyResp, journeyId]);

    const transcitLegRatingData = useMemo(() => mkDataTranscitLegRatingProp(journeySummaryData), [journeySummaryData]);

    const featureFlags = useAppSelector(selectFeatureFlags);
    const journeyRatings = useAppSelector(state => selectJourneyFeedBack(state, createJourneyId(journeyId || '')));

    const handleJourneyRatings = async (journeyId: JourneyId) => {
        try {
            const ratingsResponse = await getJourneyRatingsApiCall({ journeyId }).unwrap();
            if (ratingsResponse) {
                dispatch(setJourneyFeedBack({ id: journeyId, payload: ratingsResponse }));
            }
        } catch (error) {
            console.error('[handleJourneyRatings] Error:', error);
        }
    };

    const { setAutoClearTimeout } = useAutoClearTimeout();
    const isHandleFullJourneySummaryRunningRef = useRef(false);
    const isAutoClickRunningRef = useRef(false);

    const handleAutoClickAction = useCallback(
        async (
            bookingId: string | undefined,
            legOrder: number | undefined,
            newJourneyId: JourneyId,
            fetchBookingDetails: ReturnType<typeof useGetBookingDetailsMutation>[0],
            featureFlags: FeatureFlags,
            navigation: NativeStackNavigationProp<MainNavigationParamList>,
        ) => {
            if (!bookingId) return;
            try {
                if (isAutoClickRunningRef.current) return;
                isAutoClickRunningRef.current = true;
                const data = await fetchBookingDetails(bookingId).unwrap();
                const bookingDetails: bookingAPIEntity = data._0;
                const mappedData: RideType = getPropsFromBookingDetails(bookingDetails, featureFlags);

                setAutoClearTimeout(() => {
                    isAutoClickRunningRef.current = false;
                    isHandleFullJourneySummaryRunningRef.current = false;
                }, 1000);
                navigation.push('ProfileTab', {
                    screen: 'myRidesNavigator',
                    params: {
                        screen: 'myRideDetails',
                        params: {
                            bookingDetailCard: {
                                ...mappedData,
                                journeyId: newJourneyId,
                                isExpired: false,
                            },
                            journeyDetailCard: null,
                            showEstimate: mappedData.showEstimate,
                            isCancelled: mappedData.rideStatus === RideStatus.Cancelled,
                            showHelpAndSupport: true,
                            subAutoDetails: { legOrder: legOrder || 0 },
                            issueCategory: issueCategories,
                        },
                    },
                });
            } catch (err) {
                console.error('Failed to fetch booking details: ', err);
            }
        },
        [issueCategories],
    );

    const createJourneyDetailProps = (
        journeyData: journeyInfoResp,
        newJourneyId: JourneyId,
    ): JourneyDetailCardProps => {
        const legs = journeyData.legs;
        const { date, time } = convertTimestamp(journeyData.createdAt);
        const getStop = getlocationAPIEntitySourceOrDestination(legs[legs.length - 1], false);
        const fromLocation = getlocationAPIEntitySourceOrDestination(legs[0], true);
        const { price, currency } = getPriceOrCurrencyForJourney(legs);
        const { distance: actualDistance, unit: actualDistanceUnit } = getDistanceOrUnitForJourney(legs);
        const rideId = legs[0]?.legExtraInfo.TAG === 'Taxi' ? legs[0]?.legExtraInfo._0?.rideId : undefined;

        return {
            fromLocation: fromLocation ?? dummyLocationApiEntity,
            stops: getStop ? [getStop] : [],
            rideStartTime: journeyData.startTime,
            rideEndTime: journeyData.endTime,
            createdAt: journeyData.createdAt,
            showRideDetails: true,
            tripCategory: undefined,
            rideDetails: {
                date,
                time,
                price,
                vehicleServiceTier: '',
                type: '',
                from: getPlaceArea(fromLocation),
                to: getPlaceArea(getStop),
                status: 'COMPLETED',
                vehicleIconUrl: '',
                rideStatus: RideStatus.Completed,
                currency: getCurrency(currency),
                bookingDetail: null,
                refreshData: () => {},
                setBookingData: undefined,
                journeyId: newJourneyId,
                isExpired: false,
                rideId: rideId,
            },
            bookingDetailMiddle: {
                vehicleModel: '',
                driver: '',
                actualDistance: formatDistanceWithUnit(actualDistance, actualDistanceUnit, userLanguageStrings),
                estimatedDistance: formatDistanceWithUnit(
                    journeyData.estimatedDistance.value,
                    journeyData.estimatedDistance.unit,
                    userLanguageStrings,
                ),
                rideShortId: newJourneyId || '',
                rideTime: formatTimeDifference(journeyData.startTime, journeyData.endTime),
                rating: journeyRatings?.rating,
                estimatedDuration: journeyData.estimatedDuration,
                rideEndTime: journeyData.endTime,
                status: 'COMPLETED',
                fare: { title: '', key: '', amountText: '', extraDetail: '', extraOrder: undefined },
                isPetRide: false,
                rideStartTime: journeyData.startTime,
            },
            journeyDetails: {
                isJourney: true,
                journeyModes: journeyData.legs,
                journeyId: newJourneyId,
                journeyFeedBack: journeyRatings,
            },
            transcitLegRating: transcitLegRatingData,
            autoClickAction: async (bookingId: string | undefined, legOrder: number | undefined) => {
                await handleAutoClickAction(
                    bookingId,
                    legOrder,
                    newJourneyId,
                    fetchBookingDetails,
                    featureFlags,
                    navigation,
                );
            },
        };
    };

    const handleFullJourneySummary = async (journeyId: string, journeyInfoRespData: journeyInfoResp | undefined) => {
        try {
            if (isHandleFullJourneySummaryRunningRef.current) return;
            isHandleFullJourneySummaryRunningRef.current = true;
            const newJourneyId = createJourneyId(journeyId);
            setJourneyId(newJourneyId);
            setJourneyResp(undefined);

            const journeyData = journeyInfoRespData || (await getJourneyInfoApiCall({ journeyId }).unwrap());
            setJourneyResp(journeyData);

            await handleJourneyRatings(newJourneyId);

            if (!journeyData?.legs?.length) return;

            const journeyDetailCardProps = createJourneyDetailProps(journeyData, newJourneyId);

            if (isSingleTaxiJourneyFromResp(journeyData)) {
                const firstLeg = journeyData.legs[0];
                const bookingId =
                    firstLeg?.legExtraInfo?.TAG === 'Taxi' ? firstLeg.legExtraInfo._0?.bookingId : undefined;
                const legOrder = firstLeg?.order;
                await handleAutoClickAction(
                    bookingId,
                    legOrder,
                    newJourneyId,
                    fetchBookingDetails,
                    featureFlags,
                    navigation,
                );
            } else {
                isHandleFullJourneySummaryRunningRef.current = false;
                navigation.navigate(
                    'ProfileTab',
                    {
                        screen: 'myRidesNavigator',
                        params: {
                            screen: 'myRideDetails',
                            params: {
                                bookingDetailCard: null,
                                journeyDetailCard: journeyDetailCardProps,
                                showEstimate: false,
                                isCancelled: journeyDetailCardProps.rideDetails.rideStatus === RideStatus.Cancelled,
                                subAutoDetails: null,
                                showHelpAndSupport: false,
                                issueCategory: issueCategories,
                            },
                        },
                    },
                    { pop: true },
                );
            }
        } catch (error) {
            console.error('[handleFullJourneySummary] Error:', error);
            setJourneyResp(undefined);
            setJourneyId(null);
        }
    };

    const onBookYourFirstRideButton = useCallback(() => {
        dispatch(setActiveInput(SearchInput.Destination));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'myRides_onBookYourFirstRideButton' }));
        navigation.reset({ index: 0, routes: [{ name: 'mainTabNavigation' }] });
    }, []);

    const resolver: Resolver<MyRidesAction> = async action => {
        switch (action.type) {
            case 'GET_FULL_JOURNEY_SUMMARY':
                if (action.payload?.journeyId) {
                    await handleFullJourneySummary(action.payload.journeyId, action.payload.journeyInfoResp);
                }
                break;
            case 'TRACK_ACTIVE_JOURNEY':
                if (action.payload?.unifiedQR && action.payload?.journeyId) {
                    navigation.popTo('mainTabNavigation', {
                        screen: 'liveTab_homeScreen',
                        params: {
                            journeyId: null,
                            multimodalProps: {
                                journeyId: action.payload.journeyId,
                                isLastMile: false,
                                currentLegOrder: '0',
                                previousLegOrderTravelMode: undefined,
                                previousLegOrderTravelModeStatusConfirmed: undefined,
                            },
                        },
                    });
                }
                break;
            case 'NAVIGATE_TO_HELP_AND_SUPPORT':
                if (action.payload) {
                    if (enableKaptureHelpSupport)
                        onHelpAndSupportPress(action.payload.rideId, action.payload.currentActiveTicket);
                    else
                        navigation.navigate('ProfileTab', {
                            screen: 'helpAndSupportNavigator',
                            params: {
                                screen: 'reportIssueChatScreen',
                                params: {
                                    category: issueCategory,
                                    rideId: action.payload.rideId,
                                    issueReportId: undefined,
                                    ticketId: undefined,
                                    driverNumber: action.payload.driverNumber,
                                },
                            },
                        });
                }
                break;
            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    };

    const mpDispatch = createDispatcher(resolver);
    const viewState: MyRideScreenProps = {
        mpDispatch,
        onBookYourFirstRideButton,
        isActiveRide,
        isHelpAndSupportScreen,
        issueCategory,
        fetchedIssueCategories: issueCategories,
    };

    return <MyRides {...viewState} />;
};

export default MyRidesFlow;
