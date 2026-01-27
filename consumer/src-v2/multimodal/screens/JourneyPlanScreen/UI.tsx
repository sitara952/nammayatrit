import React from 'react';
import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { TrackedLegInfoStaticInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { WalkTransitCell } from '../JourneyInfoScreen/components/WalkTransitCell';
import { BusTransitCellFlow } from '../JourneyInfoScreen/components/BusTransitCell/Flow';
import { MetroTransitCell } from '../JourneyInfoScreen/components/MetroTransitCell';
import { TrainTransitCell } from '../JourneyInfoScreen/components/TrainTransitCell';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppName } from '@/typescript/state/client/session';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import { formatTimeFromSeconds } from '@/src-v2/utils/common';
import { JourneyPlanScreenAction } from './Types';
import { Resolver } from '@/typescript/utils/common';
import { getOrder } from '../../utils/journeyTrackingUtils';
import { mergeTrackedLegs } from '@/typescript/utils/MultiModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Header } from '@/src-v2/primitives/Header';
import Animated from 'react-native-reanimated';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';
import { calculateTotalTickets, LegCategorySelections } from '../../components/JourneyPayment/Types';
import { calculateTotalFareForLeg } from '../../components/JourneyPayment/journeyPaymentUtils';

interface JourneyPlanScreenUIProps {
    legs: TrackedLegInfoStaticInfo[];
    mpDispatch: Resolver<JourneyPlanScreenAction>;
    isLoading: boolean;
    loadingLegOrder: number;
    legCategorySelections: LegCategorySelections;
    onBookButtonClick: () => void;
    onViewTimetable: () => void;
}

interface JourneyLegsProps {
    legs: TrackedLegInfoStaticInfo[];
    mpDispatch: Resolver<JourneyPlanScreenAction>;
    isLoading: boolean;
    loadingLegOrder: number;
    lastStop: string;
    firstStation: string;
    onViewTimetable: () => void;
    legCategorySelections: LegCategorySelections;
    onBookButtonClick: () => void;
}

const JourneyLegs: React.FC<JourneyLegsProps> = ({
    legs,
    mpDispatch,
    isLoading,
    loadingLegOrder,
    lastStop,
    firstStation,
    legCategorySelections,
    onViewTimetable,
    onBookButtonClick,
}: JourneyLegsProps) => {
    const appName = useAppSelector(selectAppName);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const totalTicketCount = calculateTotalTickets(legCategorySelections);
    return (
        <View>
            {legs.map((leg: TrackedLegInfoStaticInfo, index: number) => {
                const isLastCell = index === legs.length - 1;
                const travelMode = leg?.travelMode;
                const legOrder = getOrder(leg.legOrder);
                const legCategorySelection = legCategorySelections.find(selection => selection.legOrder === legOrder);
                const legFinalFare = legCategorySelection
                    ? calculateTotalFareForLeg(legCategorySelection.categories, legCategorySelection.selections)
                    : 0;
                switch (travelMode) {
                    case 'Walk':
                    case 'Taxi':
                        return (
                            <WalkTransitCell
                                key={leg.legOrder}
                                legInfo={leg}
                                isLastCell={isLastCell}
                                mpDispatch={mpDispatch}
                                isDataLoading={legOrder === loadingLegOrder && loadingLegOrder !== -1 && isLoading}
                                isSkipped={false}
                                walkOrAutoTime={formatTimeFromSeconds(leg.duration, true, userLanguageStrings)}
                            />
                        );
                    case 'Metro':
                        return (
                            <MetroTransitCell
                                key={leg.legOrder}
                                legInfo={leg}
                                finalFare={legFinalFare}
                                isLastCell={isLastCell}
                                ticketState={undefined}
                                appName={appName}
                                lastStopName={lastStop}
                                onBookButtonClick={onBookButtonClick}
                                nextTwoArrivalTimes={undefined}
                                firstArrivalTime={undefined}
                                onViewTimetable={onViewTimetable}
                                timeTableData={undefined}
                                isSingleMode={undefined}
                                transitTime={formatTimeFromSeconds(leg.duration, true, userLanguageStrings)}
                                journeyMapData={undefined}
                                onConfirmRoute={() => {}}
                                isDataLoading={false}
                                showMetroOptions={false}
                                entryStationName={firstStation}
                                handleEditPress={() => {}}
                            />
                        );
                    case 'Bus':
                        return (
                            <BusTransitCellFlow
                                key={leg.legOrder}
                                legInfo={leg}
                                isLastCell={isLastCell}
                                totalTicketCount={totalTicketCount}
                                onClassChange={undefined}
                                isDataLoading={false}
                                fromJourneyInfoScreen={false}
                                transitTime={formatTimeFromSeconds(leg.duration, true, userLanguageStrings)}
                                onBusRouteSwitch={undefined}
                                journeyId={undefined}
                            />
                        );
                    case 'Subway':
                        return (
                            <TrainTransitCell
                                key={leg.legOrder}
                                legInfo={leg}
                                isLastCell={isLastCell}
                                onClassChange={undefined}
                                ticketState={undefined}
                                isDataLoading={false}
                                nextTwoArrivalTimes={undefined}
                                firstArrivalTime={undefined}
                                onViewTimetable={undefined}
                                timeTableData={undefined}
                                finalFare={legFinalFare}
                                onViaChangePress={() => {}}
                                transitTime={formatTimeFromSeconds(leg.duration, true, userLanguageStrings)}
                                tranformedRouteOptions={undefined}
                                isLoading={false}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </View>
    );
};

export const JourneyPlanScreenUI: React.FC<JourneyPlanScreenUIProps> = ({
    legs,
    mpDispatch,
    isLoading,
    legCategorySelections,
    onBookButtonClick,
    loadingLegOrder,
    onViewTimetable,
}: JourneyPlanScreenUIProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useDebounceBackPress(() => {
        navigation.goBack();
        return true;
    });

    // Merge legs with same base order (e.g., "1-1", "1-2", "1-3" -> "1")
    const mergedLegs = mergeTrackedLegs(legs);
    const metroLeg = mergedLegs.find(leg => leg.travelMode === 'Metro');

    const firstStation = metroLeg?.allSourceStations?.[0] || '';
    const lastStop = metroLeg?.allDestinationStations?.[metroLeg?.allDestinationStations?.length - 1] || '';
    return (
        <Animated.View style={{ flex: 1, backgroundColor: homeSheetBg }}>
            <Header title={userLanguageStrings.JourneyPlan} onBackPress={() => navigation.goBack()}></Header>
            {!isLoading && legs.length === 0 ? (
                <View style={tailwind.style('flex-1 justify-center items-center p-8')}>
                    <Text style={tailwind.style('text-lg text-gray-600 text-center')}>
                        No journey information available
                    </Text>
                </View>
            ) : (
                <ScrollView
                    style={tailwind.style('flex-1')}
                    contentContainerStyle={{ paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}>
                    <JourneyLegs
                        legs={mergedLegs}
                        mpDispatch={mpDispatch}
                        legCategorySelections={legCategorySelections}
                        onBookButtonClick={onBookButtonClick}
                        isLoading={isLoading}
                        loadingLegOrder={loadingLegOrder}
                        lastStop={lastStop}
                        firstStation={firstStation}
                        onViewTimetable={onViewTimetable}
                    />
                </ScrollView>
            )}
        </Animated.View>
    );
};
