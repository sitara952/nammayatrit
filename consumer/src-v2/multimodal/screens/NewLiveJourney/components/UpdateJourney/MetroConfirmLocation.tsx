import React, { useState, useCallback } from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { PopUpModalConfig } from '../StatusPopUpModal/PopUpModalConfig';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { BottomSheetView, BottomSheetFooter, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import metroSideView from '@/src-v2/assets/3D-assets/live-journey/metro-side-with-arrow.webp';
import { StationsList } from '@/src-v2/multimodal/screens/MetroSubwayBooking/components/SourcePickerSheetContent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { Stop } from '@/src-v2/multimodal/types/journeyTracking';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface MetroConfirmLocationProps {
    stations: Stop[];
    possibleCheckInStations: Stop[];
    currentVehicleStop?: Stop; // Current position of the metro/vehicle
    onStationConfirm?: (station: Stop) => void;
}

export const MetroConfirmLocation: React.FC<MetroConfirmLocationProps> = ({
    stations,
    possibleCheckInStations,
    currentVehicleStop,
    onStationConfirm,
}) => {
    const { liveJourneyMetroConfirmLocationBottomSheetRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const [selectedStation, setSelectedStation] = useState<Stop | null>(null);
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleStationSelect = (station: transportStation) => {
        const stationToSelect = stations.find(s => s.code === station.code);
        if (stationToSelect) {
            setSelectedStation(stationToSelect);
        }
    };

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter
                {...props}
                bottomInset={0}
                style={{
                    shadowColor: '#ab9c9c',
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: -12,
                    ...tailwind.style(`bg-white w-full pb-[${bottom || 16}px]`),
                }}>
                <Pressable
                    accessibilityLabel="Confirm button"
                    testID="metro-confirm-location-button"
                    accessibilityRole="button"
                    disabled={!selectedStation}
                    onPress={() => {
                        if (selectedStation) {
                            onStationConfirm?.(selectedStation);
                        }
                    }}
                    {...handlers}>
                    <Animated.View
                        style={[
                            tailwind.style(
                                'mx-[24px] mt-[24px] h-[57px] rounded-[17px] bg-[#3B3A3C] justify-center items-center',
                                !selectedStation && 'opacity-50',
                            ),
                            animatedStyle,
                        ]}>
                        <Animated.Text
                            style={tailwind.style('text-[16px] leading-[24px] font-areaNormal-extrabold text-white')}>
                            {userLanguageStrings.Confirm}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>
            </BottomSheetFooter>
        ),
        [selectedStation, liveJourneyMetroConfirmLocationBottomSheetRef, onStationConfirm],
    );

    return (
        <PopUpModalConfig
            onClosePress={() => {}}
            sheetRef={liveJourneyMetroConfirmLocationBottomSheetRef}
            style="bg-[#F7F7F7]"
            isScrollable={false}
            enablePanDownToClose={false}
            footerComponent={renderFooter}
            stackBehavior="push">
            <BottomSheetView style={tailwind.style('h-[500px]')}>
                <Animated.View style={tailwind.style('flex-col items-center justify-center pt-[23px] px-[35px]')}>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="metro side view image"
                        source={metroSideView}
                        style={tailwind.style('w-[138px] h-[70px]')}
                    />
                    <Animated.Text
                        style={tailwind.style(
                            'text-[16px] leading-[24px] font-areaNormal-extrabold tracking-[0.2px]  pt-[12px] text-center',
                        )}>
                        {userLanguageStrings.ConfirmRightStationYouHaveCrossed}
                    </Animated.Text>
                </Animated.View>
                <Animated.View style={tailwind.style('pt-[20px] px-[19px] flex-1')}>
                    <StationsList
                        stations={stations.map(stopToTransportStation)}
                        selectedStation={selectedStation ? stopToTransportStation(selectedStation) : null}
                        onStationSelect={handleStationSelect}
                        bottomInset={bottom}
                        selectedColor={'bg-[#047AEA]'}
                        initialScrollIndex={(() => {
                            // Priority 1: Use current vehicle position if available
                            if (currentVehicleStop) {
                                const vehicleStopIndex = stations.findIndex(
                                    s => s.stopCode === currentVehicleStop.stopCode,
                                );
                                if (vehicleStopIndex >= 0) {
                                    return vehicleStopIndex;
                                }
                            }

                            // Priority 2: Use possible check-in stations
                            if (possibleCheckInStations?.[0]) {
                                const possibleStopIndex = stations.findIndex(
                                    s => s.stopCode === possibleCheckInStations[0]?.stopCode,
                                );
                                if (possibleStopIndex >= 0) {
                                    return possibleStopIndex;
                                }
                            }

                            // Priority 3: Default to first station
                            return 0;
                        })()}
                    />
                </Animated.View>
            </BottomSheetView>
        </PopUpModalConfig>
    );
};

const stopToTransportStation = (stop: Stop): transportStation => {
    return {
        code: stop.stopCode,
        name: stop.name ?? '',
        lat: stop.lat ?? 0,
        lon: stop.lon ?? 0,
        vehicleType: stop.vehicleType ?? '',
        address: stop.address ?? '',
        suggestedDestination: stop.suggestedDestination ?? [],
        gatesInfo: stop.gatesInfo ?? '',
        geoJson: stop.geoJson ?? '',
    };
};
