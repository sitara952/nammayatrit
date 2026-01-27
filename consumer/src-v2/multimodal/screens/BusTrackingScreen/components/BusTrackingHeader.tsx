import React, { useMemo } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { strings } from 'config-types';
import mtIcOrdinaryBusService from '../../../../assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import TicketIcon from '@/src-v2/assets/svg/TIcketIcon';
import Button from '@/src-v2/primitives/Button';
import ContentLoader, { Rect } from '@/typescript/designSystem/components/ContentLoader';

export interface BusTrackingHeaderProps {
    routeShortName: string | undefined;
    destinationStopName: string | undefined;
    arrivalTimeInSeconds: number[] | undefined;
    userLanguageStrings: strings;
    onBookTicket?: () => void;
    appName?: string;
    scheduledAt?: string | undefined;
}

// Header component showing route title, destination and upcoming arrival chips
export const BusTrackingHeader: React.FC<BusTrackingHeaderProps> = React.memo(
    ({ routeShortName, destinationStopName, arrivalTimeInSeconds, userLanguageStrings, onBookTicket, scheduledAt }) => {
        const nextArrivalTimes = useMemo(() => {
            return arrivalTimeInSeconds
                ?.filter(sec => sec > 0)
                .sort((a, b) => a - b)
                .map(sec => {
                    const minutes = Math.round(sec / 60);
                    const hours = Math.floor(minutes / 60);
                    const extraMinutes = minutes - hours * 60;
                    const timeString = hours > 0 ? `${hours}hr ${extraMinutes}m` : `${minutes} min`;
                    const isGreen = minutes < 30;
                    return { timeString, isGreen };
                })
                .filter((v, i, self) => self.findIndex(x => x.timeString === v.timeString) === i)
                .slice(0, 3);
        }, [arrivalTimeInSeconds]);

        // Shimmer placeholder shown while routeShortName is undefined
        const ShimmerPlaceholder: React.FC<{ style: StyleProp<ViewStyle> | undefined }> = props => {
            const { style } = props;

            return (
                <View style={style}>
                    <View style={tailwind.style('bg-[#F6F6F6] rounded-[12px] w-full h-34 overflow-hidden')} />
                    <View style={tailwind.style('absolute left-5 top-6 w-full')}>
                        {/* Route name shimmer - 2 lines */}
                        <View style={tailwind.style('m-3')}>
                            <ContentLoader width="100%" height="16" backgroundColor="#E6E7E8" foregroundColor="#F4F4F4">
                                <Rect x="0" y="0" rx="6" ry="6" width="256" height="18" />
                            </ContentLoader>
                        </View>
                        <View style={tailwind.style('m-3 mt-0')}>
                            <ContentLoader width="100%" height="16" backgroundColor="#E6E7E8" foregroundColor="#F4F4F4">
                                <Rect x="0" y="0" rx="6" ry="6" width="132" height="18" />
                            </ContentLoader>
                        </View>

                        {/* Arrival times shimmer - 3 chips */}
                        <View style={tailwind.style('flex-row items-cente ml-3')}>
                            <View style={tailwind.style('mr-2')}>
                                <ContentLoader
                                    width="56"
                                    height="14"
                                    backgroundColor="#E6E7E8"
                                    foregroundColor="#F4F4F4">
                                    <Rect x="0" y="0" rx="6" ry="6" width="56" height="14" />
                                </ContentLoader>
                            </View>
                            <View style={tailwind.style('mr-2')}>
                                <ContentLoader
                                    width="56"
                                    height="14"
                                    backgroundColor="#E6E7E8"
                                    foregroundColor="#F4F4F4">
                                    <Rect x="0" y="0" rx="6" ry="6" width="56" height="14" />
                                </ContentLoader>
                            </View>
                            <View>
                                <ContentLoader
                                    width="56"
                                    height="14"
                                    backgroundColor="#E6E7E8"
                                    foregroundColor="#F4F4F4">
                                    <Rect x="0" y="0" rx="6" ry="6" width="56" height="14" />
                                </ContentLoader>
                            </View>
                        </View>
                        <View style={tailwind.style('m-3 mt-3 w-full')}>
                            <ContentLoader width="95%" height="32" backgroundColor="#E6E7E8" foregroundColor="#F4F4F4">
                                <Rect x="0" y="0" rx="6" ry="6" width="95%" height="32" />
                            </ContentLoader>
                        </View>
                    </View>
                </View>
            );
        };

        if (!routeShortName) {
            return <ShimmerPlaceholder style={tailwind.style('bg-white rounded-[16px] px-5 py-6')} />;
        }

        return (
            <View style={tailwind.style('bg-white rounded-[36px] pb-4 pt-6 relative overflow-hidden')}>
                <View style={tailwind.style('absolute flex top-2 justify-center items-center w-full')}>
                    <View style={tailwind.style('h-1 w-10 bg-[#ECEDEF]')} />
                </View>
                <View style={tailwind.style('ml-5 mt-2 pr-[100px]')}>
                    <Animated.Text
                        style={tailwind.style('text-[26px] font-areaNormal-extrabold text-[#3B3A3C]')}
                        accessibilityLabel={`Bus ${routeShortName}`}>
                        {routeShortName}
                    </Animated.Text>
                    {destinationStopName && (
                        <Animated.Text
                            style={tailwind.style(
                                'text-[16px] font-areaNormal-extrabold text-[#3B3A3C] mt-0.5 capitalize',
                            )}
                            accessibilityLabel={`${destinationStopName} Stop`}>
                            to {destinationStopName} {userLanguageStrings.Stop}
                        </Animated.Text>
                    )}
                    {!nextArrivalTimes ? (
                        <View style={tailwind.style('mr-2 mt-4 mb-1')}>
                            <ContentLoader width="100%" height="52" backgroundColor="#E6E7E8" foregroundColor="#F4F4F4">
                                <Rect x="0" y="0" rx="6" ry="6" width="165" height="52" />
                            </ContentLoader>
                        </View>
                    ) : (
                        nextArrivalTimes.length > 0 && (
                            <Animated.View entering={FadeIn.duration(400)} style={tailwind.style('mt-4')}>
                                <Animated.Text
                                    style={tailwind.style('text-[14px] font-areaNormal-bold text-[#656565] mb-2')}>
                                    {`${userLanguageStrings.bus} ${userLanguageStrings.Arrivesin}`}
                                </Animated.Text>
                                <Animated.View style={tailwind.style('flex-row items-center flex-wrap')}>
                                    {nextArrivalTimes.map(({ timeString, isGreen }) => (
                                        <Animated.Text
                                            key={timeString}
                                            style={tailwind.style(
                                                'min-h-5 mr-2 mb-2 px-2 rounded-[6px] bg-[#F4F4F4] overflow-hidden',
                                                'font-areaNormal-extrabold text-[12px] leading-[20px] tracking-[0.2px]',
                                                isGreen ? 'text-[#097B42]' : 'text-[#FF7301] ',
                                            )}>
                                            {timeString}
                                        </Animated.Text>
                                    ))}
                                </Animated.View>
                            </Animated.View>
                        )
                    )}
                    {scheduledAt && (
                        <View style={tailwind.style('mt-2')}>
                            <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-bold text-[#656565]')}>
                                {userLanguageStrings.Scheduled + ' ' + userLanguageStrings.At + ' '} {scheduledAt}
                            </Animated.Text>
                        </View>
                    )}
                </View>
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="ordinary bus service"
                    source={mtIcOrdinaryBusService}
                    style={tailwind.style('absolute right--1 top--7 w-[111px] h-[164px]', {
                        transform: [{ scaleX: -1 }],
                    })}
                    resizeMode="contain"
                />
                {onBookTicket && (
                    <Button
                        size="lg"
                        type="primary"
                        style={tailwind.style(
                            'mb-4 flex-row mt-4 mx-5 bg-[#047AEA] items-center rounded-xl justify-center',
                        )}
                        onPress={onBookTicket}
                        testID="book-bus-ticket-button"
                        accessibilityLabel="Book bus ticket">
                        <>
                            <View style={tailwind.style('size-5 mr-2')}>
                                <TicketIcon fill="#ffffff" />
                            </View>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[16px] leading-[22px] font-areaNormal-bold text-center capitalize text-white',
                                )}>
                                {userLanguageStrings.Bookticket}
                            </Animated.Text>
                        </>
                    </Button>
                )}
            </View>
        );
    },
);

export default BusTrackingHeader;
