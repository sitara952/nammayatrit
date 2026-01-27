import { Pressable } from '@/src-v2/primitives/Pressable';
import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '../../../../src/typescript/components/Icon';
import { useAnimatedContextValues } from '../../../../src/typescript/context/AnimatedValuesContext.tsx';
import { tailwind } from '../../../../src/typescript/tailwindTheme/tailwind';
import { getIconFromType } from '../../../multimodal/screens/JourneyInfoScreen/components/TransitIconWrapper';
import { RecentMultimodalTrip } from '../Types.tsx';
import { useAppDispatch } from '@/typescript/state/hooks.ts';
import { updateSelectedSearchedStop } from '@/typescript/state/client/session.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import { emptyJourneyDetailsProps } from '@/src-v2/multimodal/screens/JourneyInfoScreen/index.tsx';

const RecentIcon = () => {
    return (
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Path
                d="M7.96582 1.29688C11.639 1.29705 14.6318 4.29064 14.6318 7.96387C14.6317 11.6369 11.6389 14.6297 7.96582 14.6299C4.2926 14.6299 1.29901 11.6371 1.29883 7.96387H2.63184C2.63201 10.9037 5.02593 13.2969 7.96582 13.2969C10.9056 13.2967 13.2987 10.9036 13.2988 7.96387C13.2988 5.02398 10.9057 2.63006 7.96582 2.62988V1.29688ZM8.63184 4.76562V7.29883H11.165V8.63184H7.29883V4.76562H8.63184ZM3.39941 5.20996L3.40625 5.2168C3.19292 5.5768 3.01924 5.95725 2.89258 6.35059L1.61914 5.94336C1.77246 5.44344 1.99218 4.97004 2.25879 4.52344L3.39941 5.20996ZM5.77148 3.0957C5.21816 3.34237 4.71148 3.68938 4.27148 4.10938L3.35156 3.14941C3.90482 2.62282 4.53138 2.19613 5.22461 1.88281L5.77148 3.0957Z"
                fill="#7E7E7E"
            />
        </Svg>
    );
};

const Plus = ({ fill = '#016ACD' }: { fill: string | undefined }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
            <Path
                d="M6.70078 1.5V1.25H6.45078H5.55078H5.30078V1.5V10.5V10.75H5.55078H6.45078H6.70078V10.5V1.5Z"
                fill={fill}
                stroke={fill}
                strokeWidth="0.8"
            />
            <Path
                d="M10.75 5.55005V5.30005H10.5H1.5H1.25V5.55005V6.45005V6.70005H1.5H10.5H10.75V6.45005V5.55005Z"
                fill={fill}
                stroke={fill}
                strokeWidth="0.8"
            />
        </Svg>
    );
};

export interface RecentTransitListProps {
    journeyIncludes: RecentMultimodalTrip[];
}

export const RecentTransitList = ({ journeyIncludes }: RecentTransitListProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { sheetAnimatedPosition } = useAnimatedContextValues(undefined);
    const dispatch = useAppDispatch();
    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - 54,
                },
            ],
        };
    });

    const handleOnPress = useCallback((recentTrip: RecentMultimodalTrip) => {
        dispatch(updateSelectedSearchedStop(recentTrip.destination));
        navigation.navigate('ServicesTab', {
            screen: 'singleModeBookingNavigator',
            params: {
                screen: 'journeyDetails',
                params: emptyJourneyDetailsProps,
            },
        });
    }, []);

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(300)}
            style={[tailwind.style(`w-full bottom-9`), floatingHeaderStyle, { zIndex: -1 }]}>
            <Animated.ScrollView
                horizontal
                style={[tailwind.style(Platform.OS === 'ios' ? 'overflow-visible' : ''), { elevation: 10 }]}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tailwind.style('px-4 gap-x-3 overflow-visible')}>
                {journeyIncludes.map((journeyType, index) => (
                    <Pressable
                        accessibilityLabel={journeyType.title + ' button'}
                        accessibilityRole="button"
                        key={index}
                        testID={`recent-transit-item-${index}`}
                        onPress={() => handleOnPress(journeyType)}
                        style={({ pressed }: { pressed: boolean }) => [
                            tailwind.style(
                                'flex p-[14px] w-[300px] bg-white overflow-visible border-[1px] border-[#F1F2F2] rounded-[20px]',
                                pressed && 'bg-[#F5F5F5]',
                                Platform.OS === 'ios' ? 'shadow-sm' : '',
                            ),
                        ]}>
                        <Animated.View style={tailwind.style('flex flex-row items-center gap-x-2')}>
                            <Icon icon={<RecentIcon />} size={16} color="#7E7E7E" />
                            <Animated.Text
                                numberOfLines={1}
                                style={tailwind.style(
                                    'text-[15px] font-areaNormal-extrabold text-[#353436] leading-[20px]',
                                    ` max-w-[${300 - 14 - 10 - 28}px]`,
                                )}>
                                {journeyType.title}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex-row items-center justify-between mt-2 ')}>
                            <Animated.View
                                style={tailwind.style('p-1 rounded-md flex-row items-center gap-x-2 bg-[#F5F5F5]')}>
                                {journeyType.journeyIncludes.map((journeyTransit, transitIndex) => {
                                    return (
                                        <Animated.View
                                            key={transitIndex}
                                            style={tailwind.style('flex flex-row items-center self-start rounded-md')}>
                                            {getIconFromType(journeyTransit.mode, 14, '#656565')}

                                            {transitIndex !== journeyType.journeyIncludes.length - 1 ? (
                                                <Icon
                                                    style={tailwind.style('ml-1.5')}
                                                    icon={<Plus fill="#656565" />}
                                                    size={8}
                                                    color="#656565"
                                                />
                                            ) : null}
                                        </Animated.View>
                                    );
                                })}
                            </Animated.View>
                            {journeyType.cost ? (
                                <Animated.View style={tailwind.style('flex-row gap-x-2')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[15px] font-areaNormal-extrabold text-[#3B3A3C] leading-[18px]',
                                        )}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[12px] font-inter-regular text-[#3B3A3C] leading-[18px]',
                                            )}>
                                            ₹{'\u200A'}
                                        </Animated.Text>
                                        {journeyType.cost}
                                    </Animated.Text>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                    </Pressable>
                ))}
            </Animated.ScrollView>
        </Animated.View>
    );
};
