import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationParamList, TicketsTabParamList } from '@/typescript/navigation/globalParamList';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useTimetables } from '../../hooks/useTimetables';
import { createLegOrder } from '../../utils/journeyTrackingUtils';
import { getTicketUIPropsFromJourneyInfoResp } from '../Ticket/Hooks/useTicketUIProps';
import TicketUI from '@/src-v2/multimodal/screens/Ticket/UI';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { Header } from '@/src-v2/primitives/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectJourneyLegs } from '@/typescript/state/client/journey';
import { createJourneyId } from '@/typescript/state/client/user';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type ShowTicketScreenRouteProp = RouteProp<TicketsTabParamList, 'showTicketScreen'>;

export const ShowTicketScreen: React.FC = () => {
    const route = useRoute<ShowTicketScreenRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const { journey, fromCancelledJourney } = route.params;
    const isPassEnabled = useAppSelector(selectNewFeatureFlags).passEnabled;

    const journeyLegs = useAppSelector(state => selectJourneyLegs(state, createJourneyId(journey.journeyId)));

    // Assuming journeyInfoResp can be directly mapped to NewTicketUIProps
    // You might need to transform the data here if the structures don't match exactly

    const timeTableData = useTimetables(journey?.legs, false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const publicTransportLeg = useMemo(
        () =>
            journey?.legs.find(
                journey => journey?.travelMode && ['Metro', 'Subway', 'Bus'].includes(journey.travelMode),
            ),
        [journey],
    );
    const currentLegTimeTable = useMemo(
        () => (publicTransportLeg ? timeTableData.legTimetables[createLegOrder(publicTransportLeg)] : undefined),
        [publicTransportLeg, timeTableData],
    );
    const selectedTicketProps = useMemo(
        () =>
            journey
                ? getTicketUIPropsFromJourneyInfoResp(
                      journey,
                      'normal',
                      currentLegTimeTable,
                      journeyLegs,
                      userLanguageStrings,
                      isPassEnabled,
                  )
                : undefined,
        [journey, currentLegTimeTable, journeyLegs],
    );
    const { top } = useSafeAreaInsets();

    const handleBackPress = useCallback(() => {
        if (fromCancelledJourney) {
            navigation.popTo('mainTabNavigation', { screen: 'ticketsTab_homeScreen' });
        } else {
            navigation.goBack();
        }
    }, [fromCancelledJourney, navigation]);

    return (
        <HardwareBackpressHandler onHardwareBackPress={handleBackPress}>
            <>
                <Header
                    title={''}
                    onBackPress={handleBackPress}
                    style={tailwind.style(` text-white pt-[${top + 12}px]`)}
                />
                <View style={{ flex: 1 }}>
                    <Animated.ScrollView showsVerticalScrollIndicator={false} style={tailwind.style('flex-1')}>
                        {selectedTicketProps && <TicketUI {...selectedTicketProps} />}
                    </Animated.ScrollView>
                </View>
            </>
        </HardwareBackpressHandler>
    );
};
