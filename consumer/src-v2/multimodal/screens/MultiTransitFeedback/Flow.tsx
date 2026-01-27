import React, { useEffect, useMemo, useState } from 'react';
import { createJourneyId, createJourneyIdString, JourneyId } from '@/typescript/state/client/user';
import { createAction, createDispatcher, Resolver } from '@/typescript/utils/common';
import { MultiTransitFeedbackScreenProps, MultiModalRideEndAction } from './types.ts';
import { MultiTransitFeedbackScreen } from './UI';
import { JourneyCompleteFlow } from '../JourneyComplete/Flow';
import { useMultimodalJourneyIdBookingInfoGetMutation } from '@/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceWithUnit, mkDataForjourneySummary, mkDataTranscitLegRatingProp } from '@/src-v2/utils/common.ts';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen.tsx';
import { JourneyDetailCardProps, RideDetailCardProps } from '@/src-v2/screens/MyBookingDetails/Types.ts';
import { convertTimestamp, getPropsFromBookingDetails, RideStatus, RideType } from '@/src-v2/screens/MyRides/UI.tsx';
import { useGetBookingDetailsMutation } from '@/typescript/state/server/bookingApi.ts';
import { selectFeatureFlags } from '@/typescript/state/client/session.ts';
import {
    calculateTotalPriceFromJourney,
    getlocationAPIEntitySourceOrDestination,
} from '@/typescript/utils/MultiModal.ts';
import { getPlaceArea } from '@/typescript/utils/placeUtils.ts';
import { formatTimeDifference } from '@/src-v2/screens/MyBookingDetails/utils.ts';
import { getDistanceOrUnitForJourney, getPriceOrCurrencyForJourney } from '@/typescript/utils/MultiModal.ts';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { bookingAPIEntity } from '../../../../src/readOnly/api/types/BookingAPIEntity.gen.tsx';
import { dummyLocationApiEntity } from '../../../../src/typescript/utils/location.ts';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import { TransitType } from '../../components/PublicTransportCard/types.ts';
import { logger } from '@/src-v2/systems/logger';
import { selectAppConfig } from '@/typescript/state/client/session.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ActivityIndicator, View } from 'react-native';

type MultiTransitFeedbackProps = {
    journeyId: JourneyId | null;
};

export const MultiTransitFeedback: React.FC<MultiTransitFeedbackProps> = props => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const [journeyResp, setJourneyResp] = useState<journeyInfoResp | undefined>(undefined);
    const [journeyDetailCardProps, setJourneyDetailCardProps] = useState<JourneyDetailCardProps | null>(null);
    const featureFlags = useAppSelector(selectFeatureFlags);
    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const configManger = useConfigContext();
    const userLanguageStrings = configManger.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);

    const journeyAutoDetailClick = (bookingId: string | undefined) => {
        if (bookingId != undefined) {
            fetchBookingDetails(bookingId)
                .unwrap()
                .then(data => {
                    const bookingDetails: bookingAPIEntity = data._0;
                    const mappedData: RideType = getPropsFromBookingDetails(bookingDetails, featureFlags);
                    const props: RideDetailCardProps = {
                        bookingDetailCard: {
                            date: mappedData.date,
                            time: mappedData.time,
                            price: mappedData.price,
                            vehicleServiceTier: mappedData.vehicleServiceTier,
                            type: mappedData.type,
                            from: mappedData.from,
                            to: mappedData.to,
                            status: mappedData.status,
                            vehicleIconUrl: mappedData.vehicleIconUrl,
                            rideStatus: mappedData.rideStatus,
                            currency: mappedData.currency,
                            bookingDetail: mappedData.bookingDetail,
                            refreshData: undefined,
                            setBookingData: undefined,
                            journeyId: null,
                            isExpired: undefined,
                            rideId: mappedData.rideId,
                        },
                        journeyDetailCard: null,
                        showEstimate: mappedData.showEstimate,
                        showHelpAndSupport: false,
                        isCancelled: mappedData.isCancelled,
                        subAutoDetails: null,
                        issueCategory: undefined,
                    };

                    navigation.navigate('ProfileTab', {
                        screen: 'myRidesNavigator',
                        params: { screen: 'myRideDetails', params: props },
                    });
                })
                .catch(err => {
                    console.error('Failed to fetch booking details: ', err);
                });
        }
    };

    const [getJourneyInfoApiCall] = useMultimodalJourneyIdBookingInfoGetMutation();

    const journeySummaryData = useMemo(() => {
        const result = mkDataForjourneySummary(journeyResp?.legs);

        // Log any errors with journeyId for debugging
        if (result.errorMessage && props.journeyId) {
            logger.logDebug(
                `Journey ${createJourneyIdString(props.journeyId)} - totalFare issues: ${result.errorMessage}`,
                'MultimodalJourneySummary',
            );
        }

        return result.journeySummary;
    }, [journeyResp, props.journeyId]);

    const transitLegRatingData = useMemo(() => {
        return mkDataTranscitLegRatingProp(journeySummaryData);
    }, [journeySummaryData]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getJourneyInfoApiCall({
                journeyId: createJourneyId(props.journeyId ?? ''),
            }).then(journeyInfo => {
                if (journeyInfo.data) {
                    setJourneyResp(journeyInfo.data);
                }
            });
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    const transitData = useMemo(() => {
        const isSingleTransit =
            journeySummaryData.length === 1 &&
            !['walk', 'auto', 'taxi'].includes(journeySummaryData[0]?.transitMode ?? '');
        const validTransitModes: TransitType[] = ['metro', 'bus', 'train', 'auto'];
        const modesUsed = (journeySummaryData ?? [])
            .map(leg => leg.transitMode)
            .filter((mode): mode is TransitType => validTransitModes.includes(mode));
        const uniqueModes = Array.from(new Set(modesUsed));
        return { isSingleTransit, uniqueMode: uniqueModes.length === 1 ? uniqueModes[0] : undefined };
    }, [journeySummaryData]);

    useEffect(() => {
        if (journeyResp === undefined) {
            return;
        }
        const { date, time } = convertTimestamp(journeyResp.startTime);
        const getStop = getlocationAPIEntitySourceOrDestination(journeyResp.legs.at(-1), false);
        const fromLocation = getlocationAPIEntitySourceOrDestination(journeyResp.legs[0], true);
        const { price, currency } = getPriceOrCurrencyForJourney(journeyResp.legs);
        const { distance: actualDistance, unit: actualDistanceUnit } = getDistanceOrUnitForJourney(journeyResp.legs);
        const rideId =
            journeyResp.legs[0]?.legExtraInfo.TAG === 'Taxi' ? journeyResp.legs[0]?.legExtraInfo._0?.rideId : undefined;

        const journeyDetailCardProps: JourneyDetailCardProps = {
            fromLocation: fromLocation ?? dummyLocationApiEntity,
            stops: getStop ? [getStop] : [],
            createdAt: journeyResp.createdAt,
            rideStartTime: journeyResp.startTime,
            rideEndTime: journeyResp.endTime,
            showRideDetails: true,
            tripCategory: undefined,
            rideDetails: {
                date: date,
                time: time,
                price: price,
                vehicleServiceTier: '',
                type: '',
                from: getPlaceArea(fromLocation),
                to: getPlaceArea(getStop),
                status: 'COMPLETED',
                vehicleIconUrl: '',
                rideStatus: RideStatus.Completed,
                currency: currency,
                bookingDetail: null,
                refreshData: () => {},
                setBookingData: undefined,
                journeyId: props.journeyId,
                isExpired: false,
                rideId: rideId,
            },
            bookingDetailMiddle: {
                vehicleModel: '',
                driver: '',
                actualDistance: formatDistanceWithUnit(actualDistance, actualDistanceUnit, userLanguageStrings),
                estimatedDistance: formatDistanceWithUnit(
                    journeyResp.estimatedDistance.value,
                    journeyResp.estimatedDistance.unit,
                    userLanguageStrings,
                ),
                rideShortId: createJourneyIdString(props.journeyId),
                rideTime: formatTimeDifference(journeyResp.startTime, journeyResp.endTime),
                rating: 0,
                estimatedDuration: journeyResp.estimatedDuration,
                rideEndTime: journeyResp.endTime,
                status: 'COMPLETED',
                fare: { title: '', key: '', amountText: '', extraDetail: '', extraOrder: undefined },
                isPetRide: false,
                rideStartTime: journeyResp.startTime,
            },
            journeyDetails: {
                isJourney: true,
                journeyModes: journeyResp.legs,
                journeyId: props.journeyId,
                journeyFeedBack: null,
            },
            transcitLegRating: transitLegRatingData,
            autoClickAction: (bookingId: string | undefined) => {
                if (bookingId) {
                    mpDispatch(createAction('JOURNEY_AUTO_DETAIL_CLICKED', { bookingId: bookingId }));
                }
            },
        };
        setJourneyDetailCardProps(journeyDetailCardProps);
    }, [journeyResp]);

    const resolver: Resolver<MultiModalRideEndAction> = async action => {
        switch (action.type) {
            case 'NEED_HELP':
                navigation.navigate('ProfileTab', {
                    screen: 'helpAndSupportNavigator',
                    params: { screen: 'helpAndSupportScreen' },
                });
                break;
            case 'GET_FULL_JOURNEY_SUMMARY':
                handleFullJourneySummary();
                break;
            case 'JOURNEY_AUTO_DETAIL_CLICKED':
                journeyAutoDetailClick(action.payload?.bookingId);
        }
    };

    const mpDispatch = createDispatcher(resolver);

    const handleFullJourneySummary = () => {
        const rideDetailCard: RideDetailCardProps = {
            bookingDetailCard: null,
            journeyDetailCard: journeyDetailCardProps,
            showEstimate: false,
            showHelpAndSupport: false,
            isCancelled: false,
            subAutoDetails: null,
            issueCategory: undefined,
        };
        navigation.navigate('ProfileTab', {
            screen: 'myRidesNavigator',
            params: { screen: 'myRideDetails', params: rideDetailCard },
        });
    };

    const viewState: MultiTransitFeedbackScreenProps = {
        fullJourneyActionDispatch: () => mpDispatch(createAction('GET_FULL_JOURNEY_SUMMARY', undefined)),
        estimatedAmount: journeyResp?.estimatedMaxFare.amount ?? 0,
        finalAmount: Number(calculateTotalPriceFromJourney(journeyDetailCardProps?.journeyDetails ?? null)),
        savedAmount:
            journeyResp?.estimatedMaxFare.amount && journeyResp?.estimatedMinFare.amount
                ? journeyResp?.estimatedMaxFare.amount - journeyResp?.estimatedMinFare.amount
                : undefined, // need to be changed
        journeySummary: journeySummaryData ?? [],
        transcitLegRating: transitLegRatingData,
        legs: journeyResp?.legs ?? [],
        journeyId: props.journeyId,
        mpDispatch: mpDispatch,
        isSingleTransit: transitData.isSingleTransit,
        uniqueMode: transitData.uniqueMode,
    };

    const singleLegModes = ['Walk', 'Taxi'];
    const isSingleLegWalkTaxi = useMemo(() => {
        if (!journeyResp?.legs || journeyResp.legs.length !== 1) {
            return false;
        }
        const singleLeg = journeyResp.legs[0];
        if (!singleLeg) {
            return false;
        }
        const transitMode = singleLeg.travelMode;
        return singleLegModes.includes(transitMode);
    }, [journeyResp]);

    if (!journeyResp?.legs || journeyResp.legs.length === 0) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#047AEA" />
            </View>
        );
    } else if (
        appConfig.screenConfig.reviewAndFeedbackScreenConfig.feedbackScreenType === 'share-type' &&
        !isSingleLegWalkTaxi
    ) {
        return <JourneyCompleteFlow journeyId={props.journeyId} journeyResp={journeyResp} />;
    } else {
        return <MultiTransitFeedbackScreen {...viewState} />;
    }
};
