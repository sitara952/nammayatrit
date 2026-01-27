import { SourceType_sourceType, VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { strings } from 'config-types';
import React, { useMemo } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInRight } from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { getServiceTierImage } from '../../../utils/BusServiceUtils';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppName } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getTransitMetaInfoLabel } from '../../Ticket/TicketUtils/utils';

interface BusTransitInfoCardProps {
    routeShortName: string | undefined;
    serviceType: string | undefined;
    serviceName: string | undefined;
    selectedStopName: string | undefined;
    mode: VehicleCategory_vehicleCategory;
    arrivalTimeInSeconds: number[] | undefined;
    userLanguageStrings: strings;
    onTrackBus: (() => void) | undefined;
    source: SourceType_sourceType | undefined;
    busesOnRoute: number | null;
    hasUpcomingBusInfo: boolean;
}

// interface PulseIndicatorProps {
//     isLive: boolean;
// }

// const PulseIndicator: React.FC<PulseIndicatorProps> = ({ isLive }) => {
//     const scale = useSharedValue(1);
//     const opacity = useSharedValue(1);

//     useEffect(() => {
//         if (isLive) {
//             scale.value = 1;
//             opacity.value = 1;
//             scale.value = withRepeat(withTiming(5, { duration: 2000 }), -1, false);
//             opacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, false);
//         }
//     }, [isLive]);

//     const pulseAnimationStyle = useAnimatedStyle(() => {
//         return {
//             transform: [{ scale: scale.value }],
//             opacity: opacity.value,
//         };
//     });

//     return (
//         <Animated.View style={tailwind.style('relative h-2.5 w-2.5 justify-center items-center')}>
//             {isLive && (
//                 <Animated.View
//                     style={[tailwind.style('absolute h-1 w-1 rounded-full bg-[#C6EEC0]'), pulseAnimationStyle]}
//                 />
//             )}
//             <Animated.View
//                 style={tailwind.style(
//                     'rounded-full flex justify-center items-center',
//                     isLive ? 'bg-[#C6EEC0]' : 'h-2.5 w-2.5  bg-[#F4F4F4]',
//                 )}>
//                 <Animated.View
//                     style={[tailwind.style('h-1 w-1 rounded-full', isLive ? 'bg-[#00974B]' : 'bg-[#969696]')]}
//                 />
//             </Animated.View>
//         </Animated.View>
//     );
// };

export const BusTransitInfoCard: React.FC<BusTransitInfoCardProps> = ({
    routeShortName,
    serviceType,
    serviceName,
    // selectedStopName,
    arrivalTimeInSeconds,
    mode,
    // userLanguageStrings,
    onTrackBus,
    source,
    busesOnRoute,
    hasUpcomingBusInfo,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const serviceTierImage = useMemo(() => getServiceTierImage(mode, serviceType), [mode, serviceType]);
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
                      const timeString =
                          hours > 0
                              ? `${hours}${userLanguageStrings.Hour} ${extraMinutes}${userLanguageStrings.Min}`
                              : `${minutes}${userLanguageStrings.Min}`;
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

    const appName = useAppSelector(selectAppName);
    console.warn('busesOnRoute:', busesOnRoute);
    console.warn('nextArrivalTimes:', nextArrivalTimes);

    return (
        <Animated.View style={tailwind.style('flex-row bg-white overflow-hidden')}>
            <Animated.View
                layout={LinearTransition.springify().damping(24).stiffness(240)}
                style={tailwind.style('flex-1 justify-center min-h-[112px] pb-6 overflow-hidden')}>
                <Animated.View
                    layout={LinearTransition.springify().damping(24).stiffness(240)}
                    style={tailwind.style('pl-5 pt-6 flex-row items-center')}>
                    <Animated.View style={tailwind.style('flex-col')}>
                        <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                            {routeShortName ?? ''}
                        </Animated.Text>
                        {appName === 'odishaYatri' && (
                            <>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[17px] font-areaNormal-extrabold text-[#656565] mt-1',
                                    )}>
                                    {userLanguageStrings.SelectYourDestinationStopFrom}
                                </Animated.Text>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[17px] font-areaNormal-extrabold text-[#656565] mt-1',
                                    )}>
                                    {userLanguageStrings.below}.
                                </Animated.Text>
                            </>
                        )}
                    </Animated.View>
                    {serviceType && appName !== 'odishaYatri' ? (
                        <Animated.View
                            layout={LinearTransition.springify().damping(24).stiffness(240)}
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style('')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[16px] font-areaNormal-extrabold text-[#ABABAB] leading-[22px] tracking-[0.16px]',
                                    serviceType === 'AC' ? '' : 'capitalize',
                                )}>
                                {' '}
                                | {`${getTransitMetaInfoLabel(serviceName ?? serviceType, userLanguageStrings)} `}
                            </Animated.Text>
                        </Animated.View>
                    ) : null}
                </Animated.View>
                <Animated.View
                    layout={LinearTransition.springify().damping(24).stiffness(240)}
                    style={tailwind.style('pl-5 flex-row pt-[18px]')}>
                    {/* <PulseIndicator isLive={source === 'LIVE'} /> */}
                    {source === 'LIVE' && (busesOnRoute || nextArrivalTimes.length) ? (
                        <Animated.View
                            layout={LinearTransition.springify().damping(24).stiffness(240)}
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style(
                                'w-9 h-[34px] bg-[#EDFAEC] rounded-[10px] justify-center items-center',
                            )}>
                            <Animated.Text
                                style={tailwind.style('text-[14px] font-areaNormal-extrabold', 'text-[#09941E]')}>
                                {(busesOnRoute || nextArrivalTimes.length) < 10
                                    ? `0${busesOnRoute || nextArrivalTimes.length}`
                                    : busesOnRoute || nextArrivalTimes.length}
                            </Animated.Text>
                        </Animated.View>
                    ) : null}
                    {source === 'LIVE' ? (
                        <Animated.View
                            layout={LinearTransition.springify().damping(24).stiffness(240)}
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style('flex-col pl-2.5')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] leading-[17px] font-areaNormal-extrabold text-[#656565]',
                                )}>
                                {userLanguageStrings.BusesInRoute}
                            </Animated.Text>
                            <Pressable
                                accessibilityRole="button"
                                hitSlop={10}
                                accessibilityLabel="Track bus button"
                                style={tailwind.style('')}
                                testID={'track-bus-button'}
                                onPress={onTrackBus}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] leading-[17px] font-areaNormal-extrabold underline text-[#016ACD]',
                                    )}>
                                    {userLanguageStrings.TrackBus}
                                </Animated.Text>
                            </Pressable>
                        </Animated.View>
                    ) : null}
                    {!(source === 'LIVE') && appName !== 'odishaYatri' ? (
                        <Animated.View
                            layout={LinearTransition.springify().damping(24).stiffness(240)}
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style('flex-col')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] leading-[17px] font-areaNormal-extrabold text-[#656565]',
                                )}>
                                {userLanguageStrings.NoBusesInRoute}
                            </Animated.Text>
                            {hasUpcomingBusInfo && (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Timetable button"
                                    onPress={onTrackBus}
                                    testID={'timetable-bus-button'}
                                    hitSlop={10}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[12px] leading-[17px] font-areaNormal-extrabold underline text-[#016ACD]',
                                        )}>
                                        {userLanguageStrings.Timetable}
                                    </Animated.Text>
                                </Pressable>
                            )}
                        </Animated.View>
                    ) : null}
                </Animated.View>
                <Animated.View
                    style={tailwind.style(
                        'absolute h-[1px] bg-[#F1F2F2] bottom-0 left-5',
                        `w-[${SCREEN_WIDTH - 40 - 32}px]`,
                    )}
                />
                {/* Arrival Info */}
                {/* {arrivalTimeInSeconds && (
                    <Animated.View
                        layout={LinearTransition.springify().damping(24).stiffness(240)}
                        entering={FadeIn}
                        style={tailwind.style('px-5 pt-3 mr-[92px]')}>
                        {source === 'LIVE' ? (
                            <Animated.View style={tailwind.style('')}>
                                <Animated.Text
                                    numberOfLines={1}
                                    layout={LinearTransition.springify().damping(24).stiffness(240)}
                                    style={tailwind.style(
                                        'text-[12px] font-areaNormal-extrabold leading-[20px] text-[#656565] capitalize',
                                    )}>
                                    {userLanguageStrings.ArrivesAtStop(selectedStopName ?? '')}
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
                                                    )}>
                                                    {timeString}
                                                </Animated.Text>
                                            </Animated.View>
                                        );
                                    })}
                                </Animated.View>
                            </Animated.View>
                        ) : null}
                    </Animated.View>
                )} */}
            </Animated.View>
            <Animated.Image
                accessible={true}
                accessibilityLabel={`${mode.toLowerCase()} transit`}
                entering={SlideInRight.delay(500)}
                source={serviceTierImage}
                style={tailwind.style('absolute  w-[92px] h-[120px] -top-0 right-3.5', {
                    transform: [{ scaleX: mode === 'BUS' ? -1 : 1 }, { scale: 1.3 }],
                })}
            />
        </Animated.View>
    );
};
