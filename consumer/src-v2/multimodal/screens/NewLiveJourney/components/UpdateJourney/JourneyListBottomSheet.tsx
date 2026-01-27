import Animated, { useAnimatedStyle, interpolate, useSharedValue } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { PopUpModalConfig } from '../StatusPopUpModal/PopUpModalConfig';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { TimelineCard } from '../Iternary/TimelineCard';
import { TransitType } from '../Iternary/types';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '@/src-v2/primitives/Pressable';
import UpdateTransitBottomSheet, { LegUpdateStatus } from './UpdateTransitBottomSheet';
import { memo, useState, useMemo, useEffect } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { isEqual } from 'lodash';
import { ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { MetroConfirmLocationProps } from './MetroConfirmLocation';
import { Stop } from '@/src-v2/multimodal/types/journeyTracking';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type LegUpdateType = {
    legOrder: string;
    status: LegUpdateStatus;
};

const JourneyListBottomSheet = ({
    onClosePress,
    onLegUpdate,
    journeySteps,
    sheetRef,
    allLegs,
    onMetroStationConfirm,
    predictedLeg,
    shouldAutoOpenUpdateTransit,
    setShouldAutoOpenUpdateTransit,
}: {
    onClosePress: () => void;
    onLegUpdate: (legUpdate: LegUpdateType) => void;
    journeySteps: TransitType[];
    sheetRef: React.RefObject<BottomSheetModal | null>;
    allLegs: ProcessedLegInfo[];
    onMetroStationConfirm: (legOrder: string, station: Stop) => void;
    predictedLeg: ProcessedLegInfo | undefined;
    shouldAutoOpenUpdateTransit: boolean;
    setShouldAutoOpenUpdateTransit: (next: boolean) => void;
}) => {
    console.error('rendering bottom sheet', journeySteps.length);
    const { liveJourneyUpdateTransitBottomSheetRef } = useRefsContext();
    const { animatedStyle, handlers } = useScaleAnimation();
    const { bottom } = useSafeAreaInsets();
    const [selectedLegForUpdate, setSelectedLegForUpdate] = useState<ProcessedLegInfo | undefined>(undefined);
    const sheetAnimatedIndex = useSharedValue(-1);
    const sheetAnimatedPosition = useSharedValue(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const animatedBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: interpolate(sheetAnimatedIndex.value, [-1, 0], [1, 0.95]) }],
        };
    });

    // Build metro confirm props for the selected leg
    const metroConfirmProps = useMemo((): MetroConfirmLocationProps | null => {
        if (!selectedLegForUpdate || !['METRO', 'SUBWAY'].includes(selectedLegForUpdate.transitMode)) {
            return null;
        }

        return {
            stations: selectedLegForUpdate.staticInfo.onRouteStops,
            possibleCheckInStations: selectedLegForUpdate.realTimeInfo.possibleCheckInStations,
            onStationConfirm: (station: Stop) => {
                onMetroStationConfirm(selectedLegForUpdate.staticInfo.legOrder, station);
            },
        };
    }, [selectedLegForUpdate, onMetroStationConfirm]);

    // Get current vehicle stop for the selected leg using business logic helper
    const currentVehicleStop = useMemo((): Stop | undefined => {
        if (selectedLegForUpdate) return selectedLegForUpdate.realTimeInfo.currentStop;
        return undefined;
    }, [selectedLegForUpdate]);

    // Auto-open only when explicitly requested by parent (fix-location status-badge press flow)
    useEffect(() => {
        if (!shouldAutoOpenUpdateTransit || !predictedLeg) return;
        setSelectedLegForUpdate(predictedLeg);
        liveJourneyUpdateTransitBottomSheetRef.current?.present();
        setShouldAutoOpenUpdateTransit(false); // reset trigger after auto-open
    }, [shouldAutoOpenUpdateTransit, predictedLeg]);

    return (
        <>
            <PopUpModalConfig
                onClosePress={() => {}}
                sheetRef={sheetRef}
                containerStyle={tailwind.style('')}
                style="bg-transparent"
                snapPoints={['80%']}
                isScrollable={false}
                enableDynamicSizing={false}>
                <BottomSheetView style={tailwind.style(``)}>
                    <Animated.View
                        style={[
                            tailwind.style(`bg-white h-full rounded-t-[28px] pb-[${bottom || 16}px]`),
                            animatedBottomSheetStyle,
                        ]}>
                        <Animated.View style={tailwind.style('mx-[24px] pt-[36px]')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#3B3A3C] text-[24px] leading-[32px] font-areaNormal-extrabold',
                                )}>
                                {userLanguageStrings.WhereAreYou}
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#656565] text-[15px] leading-[25px] font-areaNormal-extrabold pt-[10px] tracking-[0.14px]',
                                )}>
                                {userLanguageStrings.LostTrackOfLocationPleaseCheckIn}
                            </Animated.Text>
                        </Animated.View>
                        <ScrollView
                            style={tailwind.style('mt-[36px] px-[30px] max-h-[60%]')}
                            showsVerticalScrollIndicator={false}>
                            {journeySteps.map((transit, index) => (
                                <TimelineCard
                                    onSafety={() => {}}
                                    isJourneyStatus={true}
                                    key={index}
                                    transits={transit}
                                    isFirstLeg={index === 0}
                                    isLastLeg={index === journeySteps.length - 1}
                                    isCurrentLeg={index === 2} // Metro is current leg
                                    currentIndex={index}
                                    currentStatus="LIVE"
                                    switchToWalk={undefined}
                                    onCall={undefined}
                                    onBoost={undefined}
                                    onRetryBooking={undefined}
                                    onMarkComplete={undefined}
                                    onViewTimetable={() => {}}
                                    onPressOtherOptions={undefined}
                                    onCheckIn={() => {}}
                                    isLoading={false}
                                    onUpdateTransit={() => {
                                        liveJourneyUpdateTransitBottomSheetRef.current?.present();
                                        const leg = allLegs.find(l => l.staticInfo.legOrder === transit.legOrder);
                                        setSelectedLegForUpdate(leg);
                                    }}
                                />
                            ))}
                        </ScrollView>
                        <Pressable
                            accessibilityLabel="Close button"
                            testID="options"
                            style={tailwind.style('mt-[33px] mx-[24px]')}
                            onPress={onClosePress}
                            accessibilityRole="button"
                            {...handlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'bg-[#F4F4F4] h-[57px]  rounded-[17px] flex-row items-center justify-center',
                                    ),
                                    animatedStyle,
                                ]}>
                                <Animated.Text
                                    style={tailwind.style('text-[#3B3A3C] text-[14px] font-areaNormal-extrabold')}>
                                    {userLanguageStrings.Close}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                </BottomSheetView>
            </PopUpModalConfig>
            <UpdateTransitBottomSheet
                animatedIndex={sheetAnimatedIndex}
                animatedPosition={sheetAnimatedPosition}
                type={selectedLegForUpdate?.transitMode || 'WALK'}
                state={selectedLegForUpdate?.vehicleState || 'VEHICLEISARRIVING'}
                onConfirmPress={status => {
                    const legOrder = selectedLegForUpdate?.staticInfo.legOrder || '';
                    onLegUpdate({ legOrder, status });
                }}
                fromLocation={selectedLegForUpdate?.staticInfo.origin.stationName ?? ''}
                toLocation={selectedLegForUpdate?.staticInfo.destination.stationName ?? ''}
                metroConfirmProps={metroConfirmProps}
                currentVehicleStop={currentVehicleStop}
                allLegs={allLegs}
                currentLeg={selectedLegForUpdate}
                onLegChange={setSelectedLegForUpdate}
            />
        </>
    );
};

const MemoizedJourneyListBottomSheet = memo(JourneyListBottomSheet, (prev, next) => {
    const journeyStepsEqual = isEqual(prev.journeySteps, next.journeySteps);
    const AutoOpenUpdateTransitEqual = prev.shouldAutoOpenUpdateTransit === next.shouldAutoOpenUpdateTransit;
    return journeyStepsEqual && AutoOpenUpdateTransitEqual;
});

export default MemoizedJourneyListBottomSheet;
