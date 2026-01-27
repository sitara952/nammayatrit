import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { useAppSelector } from '@/typescript/state/hooks';
import {
    BottomSheetStage,
    selectNewFeatureFlags,
    setBottomSheetStage,
    selectCurrentLocationCoords,
} from '@/typescript/state/client/session';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { LiveTicketFlowReturnType, MyRidesAction } from './Types';
import { LiveTicketUI } from './UI';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { logger } from '@/src-v2/systems/logger/index.ts';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { getTicketUIPropsFromJourneyInfoResp } from '../Ticket/Hooks/useTicketUIProps';
import { useTimetables } from '../../hooks/useTimetables';
import { createLegOrder } from '../../utils/journeyTrackingUtils';
import { isUndefined } from 'lodash';
import { useTicketData } from '../../hooks/useTicketData';
import { selectJourneyLegs } from '@/typescript/state/client/journey';
import { createJourneyId } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStatusBarColor } from '@/src-v2/hooks/useStatusbarcolor';
import { useAppDispatch } from '@/typescript/state/hooks';
import { useMultimodalUpdateBusLocationPostMutation } from '@/api/integrations/rtk/MultimodalUpdateBusLocationPost';

export const LiveTicketFlow = () => {
    const dispatch = useAppDispatch();
    const scrollViewRef = useRef<Animated.ScrollView>(null);

    const isScreenFocused = useIsFocused();
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<journeyInfoResp | undefined>(undefined);
    const journeyLegs = useAppSelector(state =>
        selectJourneyLegs(state, createJourneyId(selectedTicket?.journeyId ?? '')),
    );
    const isPassEnabled = useAppSelector(selectNewFeatureFlags).passEnabled;
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const [updateBusLocationMutation] = useMultimodalUpdateBusLocationPostMutation();

    const {
        isLoading: isBookingListLoading,
        liveTickets,
        pastTickets,
        latestInProgressJourney: hookLatestInProgressJourney,
    } = useTicketData();

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    useEffect(() => {
        setSelectedTicket(hookLatestInProgressJourney);
    }, [hookLatestInProgressJourney]);

    const locationCoords = useMemo(() => {
        return currentLocationCoords?.coords || { latitude: 0, longitude: 0 };
    }, [currentLocationCoords?.coords]);

    useEffect(() => {
        const activeBusLeg = selectedTicket?.legs.find(leg => {
            if (leg.travelMode !== 'Bus') return false;

            return (
                (leg.bookingStatus.TAG === 'FRFSTicket' && leg.bookingStatus._0 !== 'USED') ||
                (leg.bookingStatus.TAG === 'FRFSBooking' &&
                    !['CANCELLED', 'COUNTER_CANCELLED', 'FAILED'].includes(leg.bookingStatus._0))
            );
        });

        const busOTP = activeBusLeg?.legExtraInfo?.TAG === 'Bus' ? activeBusLeg.legExtraInfo._0.fleetNo : undefined;

        const { latitude, longitude } = locationCoords;
        const shouldUpdateLocation =
            isScreenFocused &&
            !!activeBusLeg &&
            !!busOTP &&
            latitude !== 0 &&
            longitude !== 0 &&
            selectedTicket?.journeyStatus !== 'EXPIRED' &&
            selectedTicket?.journeyStatus !== 'CANCELLED';

        if (!shouldUpdateLocation) {
            return;
        }
        const sendLocationUpdate = async () => {
            try {
                await updateBusLocationMutation({
                    busOTP,
                    body: {
                        lat: latitude,
                        long: longitude,
                        timestamp: Math.floor(Date.now() / 1000),
                    },
                }).unwrap();
            } catch (error) {
                logger.logError(`Failed to update bus location for OTP: ${busOTP} - ${error}`, 'LiveTicketFlow');
            }
        };
        sendLocationUpdate();
    }, [locationCoords, isScreenFocused, selectedTicket]);

    const handleFullJourneySummary = useCallback((journey: journeyInfoResp) => {
        if (!journey) {
            logger.logWarn(
                `Journey Id: ${selectedTicket?.journeyId || 'No Journey Id'} - No journeyId to fetch full journey summary`,
                'BookingFlow',
            );
            return;
        }
        setSelectedTicket(journey);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, []);

    const onBookTicketPress = () => {
        setIsButtonLoading(true);
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        setTimeout(() => {
            if (isPassEnabled) {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'empty_ticket_tab' }));
                navigation.navigate(
                    'mainTabNavigation',
                    {
                        screen: 'homeTab_homeScreen',
                    },
                    { pop: true },
                );
            } else {
                navigation.navigate('mainTabNavigation', { screen: 'serviceTab_homeScreen' }, { pop: true });
            }
            setIsButtonLoading(false);
        }, 100);
    };

    const onPress = useCallback(() => {
        navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
    }, [navigation]);

    const onBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const timeTableData = useTimetables(selectedTicket?.legs, false);

    const publicTransportLeg = useMemo(
        () =>
            selectedTicket?.legs.find(
                journey => journey?.travelMode && ['Metro', 'Subway', 'Bus'].includes(journey.travelMode),
            ),
        [selectedTicket],
    );
    const currentLegTimeTable = useMemo(
        () => (publicTransportLeg ? timeTableData.legTimetables[createLegOrder(publicTransportLeg)] : undefined),
        [publicTransportLeg, timeTableData],
    );

    const onHistoryPress = useCallback(() => {
        navigation.navigate('TicketsTab', {
            screen: 'ticketHistory',
        });
    }, [navigation, liveTickets, pastTickets]);

    const resolver: Resolver<MyRidesAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'GET_FULL_JOURNEY_SUMMARY':
                    if (action.payload) handleFullJourneySummary(action.payload.journey);
                    break;
                case 'NAVIGATE_TO_HISTORY':
                    onHistoryPress();
                    break;
            }
        },
        [handleFullJourneySummary, onHistoryPress],
    );

    const mpDispatch = createDispatcher(resolver);

    const ticketExists = liveTickets.length > 0 || pastTickets.length > 0 || !!selectedTicket;
    useStatusBarColor(!ticketExists);

    const selectedTicketProps = useMemo(
        () =>
            selectedTicket
                ? getTicketUIPropsFromJourneyInfoResp(
                      selectedTicket,
                      'normal',
                      currentLegTimeTable,
                      journeyLegs,
                      userLanguageStrings,
                      isPassEnabled,
                  )
                : undefined,
        [selectedTicket, currentLegTimeTable, journeyLegs, isPassEnabled],
    );

    const ticketUiViewState: LiveTicketFlowReturnType = {
        isLoading: isBookingListLoading && isUndefined(selectedTicket),
        mpDispatch,
        onPress,
        onBack,
        selectedTicket: selectedTicket,
        setSelectedTicket: setSelectedTicket,
        onBookTicketPress,
        isButtonLoading,
        selectedTicketProps,
        liveTickets,
        pastTickets,
        journeyStatus: selectedTicket?.journeyStatus,
    };

    return <LiveTicketUI {...ticketUiViewState} />;
};
