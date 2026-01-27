import { SourceType_sourceType, VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { strings } from 'config-types';
import React, { useMemo, useEffect } from 'react';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import mtIcAcService from '../../../../assets/3D-assets/bus-tier/mt_ic_ac_service.webp';
import mtIcDeluxeService from '../../../../assets/3D-assets/bus-tier/mt_ic_deluxe_service.webp';
import mtIcExpressService from '../../../../assets/3D-assets/bus-tier/mt_ic_express_service.webp';
import mtIcOrdinaryBusService from '../../../../assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import mtIcMultimodalMetro from '../../../../assets/mt_ic_multimodal_metro.webp';
import mtIcMultimodalTrainService from '../../../../assets/mt_ic_multimodal_train.webp';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import Shimmer from '@/src-v2/multimodal/screens/Search/components/SearchSectionListItem/Shimmer';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';

interface UpcomingTransportCardProps {
    routeShortName: string | undefined;
    serviceType: string | undefined;
    selectedStopName: string | undefined;
    mode: VehicleCategory_vehicleCategory;
    arrivalTimeInSeconds: number[] | undefined;
    userLanguageStrings: strings;
    onTrackBus: (() => void) | undefined;
    source: SourceType_sourceType | undefined;
    busesOnRoute: number | undefined;
}

interface PulseIndicatorProps {
    isLive: boolean;
}

const PulseIndicator: React.FC<PulseIndicatorProps> = ({ isLive }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (isLive) {
            scale.value = 1;
            opacity.value = 1;
            scale.value = withRepeat(withTiming(5, { duration: 2000 }), -1, false);
            opacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, false);
        }
    }, [isLive]);

    const pulseAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View style={tailwind.style('relative h-2.5 w-2.5 justify-center items-center')}>
            {isLive && (
                <Animated.View
                    style={[tailwind.style('absolute h-1 w-1 rounded-full bg-[#C6EEC0]'), pulseAnimationStyle]}
                />
            )}
            <Animated.View
                style={tailwind.style(
                    'rounded-full flex justify-center items-center',
                    isLive ? 'bg-[#C6EEC0]' : 'h-2.5 w-2.5  bg-[#F4F4F4]',
                )}>
                <Animated.View
                    style={[tailwind.style('h-1 w-1 rounded-full', isLive ? 'bg-[#00974B]' : 'bg-[#969696]')]}
                />
            </Animated.View>
        </Animated.View>
    );
};

export const UpcomingTransportCard: React.FC<UpcomingTransportCardProps> = ({
    routeShortName,
    serviceType,
    selectedStopName,
    arrivalTimeInSeconds,
    mode,
    userLanguageStrings,
    onTrackBus,
    source,
    busesOnRoute,
}) => {
    const serviceTierImage = useMemo(() => {
        if (mode === 'SUBWAY') {
            return mtIcMultimodalTrainService;
        }
        if (mode === 'METRO') {
            return mtIcMultimodalMetro;
        }
        switch (serviceType) {
            case 'AC':
                return mtIcAcService;
            case 'EXECUTIVE':
            case 'SPECIAL':
                // Deluxe
                return mtIcDeluxeService;
            case 'EXPRESS':
                // Express
                return mtIcExpressService;
            case 'ORDINARY':
                // Ordinary
                return mtIcOrdinaryBusService;
            default:
                // Default to Ordinary
                return mtIcOrdinaryBusService;
        }
    }, [serviceType, mode]);
    const nextArrivalTimes = useMemo(() => {
        return arrivalTimeInSeconds && arrivalTimeInSeconds.length > 0
            ? arrivalTimeInSeconds
                  .filter(seconds => seconds > 0)
                  .sort((a, b) => a - b)
                  .map((seconds, idx) => {
                      const minutes = Math.round(seconds / 60);
                      const hours = Math.floor(minutes / 60);
                      const extraMinutes = minutes - hours * 60;
                      const isGreen = minutes < 30;
                      const timeString = hours > 0 ? `${hours}hr ${extraMinutes}min` : `${minutes}min`;
                      return {
                          timeString,
                          isGreen,
                          key: idx,
                      };
                  })
                  .filter(
                      (value, index, self) => self.findIndex(item => item.timeString === value.timeString) === index,
                  )
                  .slice(0, 4)
            : [];
    }, [arrivalTimeInSeconds]);

    return (
        <Animated.View style={tailwind.style('flex-row justify-between items-end bg-white rounded-[20px]')}>
            <Animated.View
                layout={LinearTransition.springify().damping(24).stiffness(240)}
                style={tailwind.style('flex-1 justify-center min-h-[112px] pb-3')}>
                <Animated.View>
                    {routeShortName === undefined ? (
                        <>
                            <Animated.View
                                style={tailwind.style(
                                    'bg-white rounded-2xl p-2 py-4 shadow-sm border border-gray-100',
                                )}>
                                <Shimmer
                                    finalOpacity={0.7}
                                    height={60}
                                    width={SCREEN_WIDTH - 48}
                                    borderRadius={12}
                                    backgroundColor={'#DBDBDB'}
                                />
                                <Animated.View style={tailwind.style('mt-3')}>
                                    <Shimmer
                                        finalOpacity={0.7}
                                        height={20}
                                        width={SCREEN_WIDTH - 120}
                                        borderRadius={8}
                                        backgroundColor={'#DBDBDB'}
                                    />
                                </Animated.View>
                            </Animated.View>
                        </>
                    ) : (
                        <>
                            <Animated.View
                                layout={LinearTransition.springify().damping(24).stiffness(240)}
                                style={tailwind.style('pl-5 pt-6 flex-row items-center')}>
                                <Animated.Text
                                    style={tailwind.style('text-[20px] font-areaNormal-extrabold text-[#3B3A3C]')}
                                    accessibilityLabel={`Upcoming ${
                                        serviceType ? `${serviceType} ` : ''
                                    }${userLanguageStrings.BusTransit} ${routeShortName ? `route ${routeShortName}` : ''}`}>
                                    {routeShortName ?? ''}
                                </Animated.Text>
                                {serviceType ? (
                                    <Animated.View
                                        layout={LinearTransition.springify().damping(24).stiffness(240)}
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        style={tailwind.style('ml-2 rounded-lg min-h-[22px] bg-[#F4F4F4] px-2 ')}
                                        accessibilityLabel={
                                            source === 'LIVE'
                                                ? `${nextArrivalTimes.length} buses expected on this route soon`
                                                : 'No live bus information available for this route'
                                        }>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] font-areaNormal-extrabold text-[#656565] leading-[22px] uppercase tracking-[0.16px]',
                                            )}>
                                            {`${serviceType} ${userLanguageStrings.Bus}`}
                                        </Animated.Text>
                                    </Animated.View>
                                ) : null}
                            </Animated.View>
                            <Animated.View style={tailwind.style('pl-5 flex-row items-center pt-2.5')}>
                                {busesOnRoute !== undefined ? (
                                    <>
                                        <PulseIndicator isLive={source === 'LIVE'} />
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] font-areaNormal-extrabold pl-2',
                                                source === 'LIVE' ? 'text-[#00974B]' : 'text-[#969696]',
                                            )}>
                                            {source === 'LIVE'
                                                ? `${busesOnRoute || nextArrivalTimes.length} ${userLanguageStrings.BusesInRoute}`
                                                : `${userLanguageStrings.NoBusesInRoute}`}
                                        </Animated.Text>
                                    </>
                                ) : (
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[12px] font-areaNormal-extrabold',
                                            'text-[#969696]',
                                        )}>
                                        {userLanguageStrings.NoBusesInRoute}
                                    </Animated.Text>
                                )}
                            </Animated.View>
                        </>
                    )}
                </Animated.View>
                {/* Arrival Info */}
                {arrivalTimeInSeconds && (
                    <Animated.View
                        layout={LinearTransition.springify().damping(24).stiffness(240)}
                        entering={FadeIn}
                        style={tailwind.style('px-5 pt-3 mr-[92px]')}>
                        {source === 'LIVE' ? (
                            <Animated.View style={tailwind.style('')}>
                                <Animated.Text
                                    numberOfLines={2}
                                    layout={LinearTransition.springify().damping(24).stiffness(240)}
                                    style={tailwind.style(
                                        'text-[12px] font-areaNormal-extrabold leading-[20px] text-[#656565] capitalize',
                                    )}>
                                    {userLanguageStrings.ArrivesAtStop(selectedStopName ?? '')}
                                    {` ${userLanguageStrings.Bus} ${userLanguageStrings.Stop}`}
                                </Animated.Text>
                                <Animated.View
                                    entering={FadeIn.delay(100)}
                                    exiting={FadeOut.duration(90)}
                                    layout={LinearTransition.springify().damping(24).stiffness(240)}
                                    style={tailwind.style('flex-row items-center pt-1')}>
                                    {nextArrivalTimes.map(({ timeString, isGreen, key }) => {
                                        return (
                                            <Animated.View
                                                layout={LinearTransition.springify().damping(40).stiffness(300)}
                                                key={key}
                                                style={tailwind.style('items-start')}>
                                                <Animated.Text
                                                    layout={LinearTransition.springify().damping(40).stiffness(300)}
                                                    style={tailwind.style(
                                                        'min-h-5 justify-center items-center px-[5px] rounded-[6px] bg-[#F4F4F4] overflow-hidden',
                                                        `text-white font-areaNormal-extrabold text-[10px] leading-[20px] tracking-[0.2px]`,
                                                        isGreen ? 'text-[#097B42]' : 'text-[#FF7301]',
                                                    )}
                                                    accessibilityLabel={
                                                        nextArrivalTimes.length > 0
                                                            ? `Upcoming buses arriving in ${nextArrivalTimes.map(t => t.timeString).join(', ')}`
                                                            : 'No upcoming bus arrivals'
                                                    }>
                                                    {timeString}
                                                </Animated.Text>
                                            </Animated.View>
                                        );
                                    })}
                                    <Animated.View layout={LinearTransition.springify().damping(24).stiffness(240)}>
                                        <Pressable
                                            style={tailwind.style('ml-1.5')}
                                            testID={'track-bus-button'}
                                            accessibilityRole="button"
                                            onPress={onTrackBus}
                                            accessibilityLabel="Track bus in real-time button">
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-[11px] leading-[20px] font-areaNormal-extrabold underline text-[#016ACD]',
                                                )}>
                                                {userLanguageStrings.TrackBus}
                                            </Animated.Text>
                                        </Pressable>
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
                        ) : null}
                        {source === 'GTFS' ? (
                            <Animated.View
                                style={tailwind.style('mb-1')}
                                entering={FadeIn.delay(100)}
                                exiting={FadeOut.duration(90)}>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={onTrackBus}
                                    testID={'timetable-bus-button'}
                                    accessibilityLabel="View time table button"
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[12px] font-areaNormal-extrabold leading-[20px] text-[#656565]',
                                        )}>
                                        {userLanguageStrings.NoLiveDataAvailablePleaseCheck}
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[13px] font-areaNormal-extrabold underline text-[#016ACD]',
                                            )}
                                            accessibilityLabel="View time table">
                                            {userLanguageStrings.Timetable}
                                        </Animated.Text>
                                    </Animated.Text>
                                </Pressable>
                            </Animated.View>
                        ) : null}
                    </Animated.View>
                )}
            </Animated.View>
            <Animated.Image
                accessible={false}
                entering={SlideInRight.delay(500)}
                source={serviceTierImage}
                style={tailwind.style('absolute right-0 w-[92px] h-[120px] top-3', {
                    transform: [{ scaleX: mode === 'BUS' ? -1 : 1 }],
                })}
            />
        </Animated.View>
    );
};
