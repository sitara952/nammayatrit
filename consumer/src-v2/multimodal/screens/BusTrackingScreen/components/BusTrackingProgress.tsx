import React, { useCallback, useMemo } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import OnboardingStop from '@/src-v2/multimodal/components/svg/OnboardingStop';
import { EnhancedStopMapping } from '../../SingleModeTicketBooking/Types';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import mtIcBusTracking from '@/src-v2/assets/mt_ic_bus_top_view_tracking.webp';
import { strings } from 'config-types';

interface BusTrackingProgressProps {
    routeStops: EnhancedStopMapping[];
    vehiclePositions: Record<string, Record<string, number>> | null;
    onboardingStopCode: string | null;
    onAllStopsMeasured?: () => void;
    userLanguageStrings: strings;
}

const StopItem = React.memo(
    ({
        stop,
        index,
        totalStops,
        onboardingStopCode,
        vehiclePositions,
        onLayout,
        userLanguageStrings,
    }: {
        stop: EnhancedStopMapping;
        index: number;
        totalStops: number;
        onboardingStopCode: string | null;
        vehiclePositions: Record<string, Record<string, number>> | null;
        onLayout: (event: LayoutChangeEvent, index: number, stopCode: string) => void;
        userLanguageStrings: strings;
    }) => {
        const handleLayout = useCallback(
            (event: LayoutChangeEvent) => {
                onLayout(event, index, stop.stopCode);
            },
            [index, stop.stopCode, onLayout],
        );
        const ConfigManager = useConfigContext();
        const colors = ConfigManager.get('themeColors');
        const isOnboardingStop = stop.stopCode?.toLowerCase() === onboardingStopCode?.toLowerCase();
        const busProgress = useMemo(() => {
            if (!vehiclePositions || index === totalStops - 1) return null;
            const busesAtStop = vehiclePositions[stop.stopCode];
            if (!busesAtStop) return null;

            return Object.entries(busesAtStop).map(([busId, progress]) => ({
                busId,
                progress,
            }));
        }, [vehiclePositions, stop.stopCode, index, totalStops]);

        return (
            <View style={tailwind.style('relative')}>
                {/* Stop Content */}
                <View style={tailwind.style('z-0')}>
                    <Animated.View
                        onLayout={handleLayout}
                        style={[
                            tailwind.style('flex-row items-center px-4 pb-2'),
                            index === totalStops - 1 && tailwind.style('mb--8'),
                        ]}>
                        <Animated.View
                            style={[
                                tailwind.style('w-[28px] items-center z-0'),
                                isOnboardingStop && tailwind.style('w-[28px]'),
                            ]}>
                            {isOnboardingStop ? (
                                <OnboardingStop />
                            ) : (
                                <Animated.View
                                    style={tailwind.style(
                                        'h-2 w-2 bg-[#C9C9C9]',
                                        index === 0 || index === totalStops - 1 ? 'rounded-[2px]' : 'rounded-full',
                                    )}
                                />
                            )}
                        </Animated.View>

                        <Animated.View
                            style={[tailwind.style('flex-1 ml-4'), isOnboardingStop && tailwind.style('ml-3')]}>
                            {isOnboardingStop && (
                                <Text
                                    style={tailwind.style('text-[12px] text-green-600 font-areaNormal-extrabold mb-1')}>
                                    {userLanguageStrings.SelectStartPoint}
                                </Text>
                            )}
                            {index === 0 && (
                                <Text
                                    style={tailwind.style('text-[12px] text-[#969696] font-areaNormal-extrabold mb-1')}>
                                    {userLanguageStrings.Startingfrom}
                                </Text>
                            )}
                            {index === totalStops - 1 && (
                                <Text
                                    style={tailwind.style('text-[12px] text-[#969696] font-areaNormal-extrabold mb-1')}>
                                    {userLanguageStrings.Stop}
                                </Text>
                            )}
                            <Text style={tailwind.style('text-[13px] text-[#3B3A3C] font-areaNormal-bold capitalize')}>
                                {stop.stopName}
                            </Text>
                        </Animated.View>
                    </Animated.View>
                </View>

                {/* Progress Section */}
                {index !== totalStops - 1 && (
                    <>
                        {/* Bus Indicators */}
                        {busProgress?.map(({ busId, progress }) => {
                            return (
                                <Animated.View
                                    key={busId}
                                    style={[
                                        tailwind.style('absolute w-[28px] left-4 z-30'),
                                        {
                                            top:
                                                progress === 0
                                                    ? 0 // Align with the dot when at 0%
                                                    : progress === 100
                                                      ? 60 // Align with next dot when at 100%
                                                      : (progress * 60) / 100, // Normal progress positioning
                                        },
                                    ]}>
                                    <Animated.View style={tailwind.style('items-center ml-[1px] w-[26px] h-[39px]')}>
                                        <Animated.Image
                                            accessible={true}
                                            accessibilityLabel="bus tracking image"
                                            source={mtIcBusTracking}
                                            style={[tailwind.style('absolute left-0 h-[80px] w-[28px] z-3')]}
                                        />
                                    </Animated.View>
                                </Animated.View>
                            );
                        })}

                        {/* Divider */}
                        <View style={tailwind.style('flex-row items-center px-4 pl-8 mt-4 mb-4 mr-[28px]')}>
                            <View style={tailwind.style('w-[28px]')} />
                            <Divider
                                direction="horizontal"
                                style={tailwind.style('flex-1')}
                                type="default"
                                labelPosition="center"
                                offset={0}
                                offsetBackground="transparent"
                                dividerColor={colors.CrossButton_bg}
                                strokeDashArray={undefined}
                            />
                        </View>
                    </>
                )}
            </View>
        );
    },
);

export const BusTrackingProgress: React.FC<BusTrackingProgressProps> = ({
    routeStops,
    vehiclePositions,
    onboardingStopCode,
    onAllStopsMeasured,
    userLanguageStrings,
}) => {
    const handleOnLayout = useCallback(
        (_event: LayoutChangeEvent, index: number, _stopcode: string) => {
            if (index === routeStops.length - 1 && typeof onAllStopsMeasured === 'function') {
                onAllStopsMeasured();
            }
        },
        [routeStops.length, onAllStopsMeasured],
    );
    return (
        <View style={tailwind.style('flex-1 relative', `mb-[12px]`)}>
            {/* Background Track */}
            <View style={tailwind.style('absolute inset-0 px-4 z-10')}>
                <View style={tailwind.style('w-[28px] h-full bg-[#E5E5E5] rounded-[34px]')} />
            </View>

            {/* Stops List */}
            <View style={tailwind.style('flex-1 pb-10 z-10')}>
                {routeStops.map((stop, index) => (
                    <StopItem
                        key={stop.stopCode}
                        stop={stop}
                        index={index}
                        totalStops={routeStops.length}
                        onboardingStopCode={onboardingStopCode}
                        vehiclePositions={vehiclePositions}
                        onLayout={handleOnLayout}
                        userLanguageStrings={userLanguageStrings}
                    />
                ))}
            </View>
        </View>
    );
};
