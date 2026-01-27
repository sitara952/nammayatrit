import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { BottomSheetView, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import mtIcBusSideView from '../../../../../../assets/3D-assets/mt_ic_bus_side_view.webp';
import mtIcCheckInArrow from '../../../../../../assets/3D-assets/mt_ic_check-in-arrow.webp';
import mtIcMetroSideView from '../../../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import mtIcTrainSideView from '../../../../../../assets/3D-assets/mt_ic_train_side_view.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

import { PopUpModalConfig } from '../PopUpModalConfig';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import { MetroConfirmLocation, MetroConfirmLocationProps } from '../../UpdateJourney/MetroConfirmLocation';
import { CloseButton } from '../CloseButton';

export interface TransitCheckInProps {
    mode: 'train' | 'metro' | 'bus';
    onCheckInPress: () => void;
    onClosePress: () => void;
    backgroundStyle?: string;
    metroConfirmProps: MetroConfirmLocationProps;
}

const CheckIn = () => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    return (
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path
                d="M16.4604 7.117L11.078 14.5177C10.5457 15.2497 9.45429 15.2497 8.92197 14.5177L3.53964 7.117C2.89887 6.23594 3.52824 5 4.61767 5L15.3823 5C16.4718 5 17.1011 6.23594 16.4604 7.117Z"
                fill={colors.view_ticket_text}
            />
        </Svg>
    );
};

export const TransitCheckIn = ({
    onCheckInPress,
    onClosePress,
    mode,
    backgroundStyle,
    metroConfirmProps,
}: TransitCheckInProps) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const { handlers: noHandler, animatedStyle: noAnimatedStyle } = useScaleAnimation();
    const { liveJourneyTransitCheckInModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useDebounceBackPress(() => {
        onClosePress();
        return true;
    });

    // Add translation animation
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(20, {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true,
        );
    }, []);

    const arrowAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <>
            <PopUpModalConfig
                style={backgroundStyle}
                sheetRef={liveJourneyTransitCheckInModalRef}
                onClosePress={onClosePress}>
                <BottomSheetView style={tailwind.style(`pt-[30px] pb-[${bottom || 16}px]`)}>
                    <Animated.View style={tailwind.style('items-center justify-center')}>
                        <Animated.Image
                            accessible={false}
                            resizeMode="contain"
                            style={[tailwind.style(`h-[60px]`, mode === 'bus' ? 'mb-5' : ''), arrowAnimatedStyle]}
                            source={mtIcCheckInArrow}
                        />
                        <Animated.Image
                            accessible={false}
                            resizeMode="contain"
                            style={tailwind.style(
                                `w-[${SCREEN_WIDTH - 48}px] h-[105px]`,
                                mode === 'bus' ? 'h-[75px]' : '',
                            )}
                            source={
                                mode === 'metro'
                                    ? mtIcMetroSideView
                                    : mode === 'train'
                                      ? mtIcTrainSideView
                                      : mtIcBusSideView
                            }
                        />
                    </Animated.View>
                    {mode === 'bus' && <Animated.View style={tailwind.style('w-full h-[2px] bg-[#E5E5E5]')} />}
                    <Animated.View style={tailwind.style('px-6')}>
                        {mode === 'bus' ? (
                            <Animated.View style={tailwind.style('pt-[19px]')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[16px] font-areaNormal-extrabold text-[#313131] text-center',
                                    )}>
                                    {userLanguageStrings.CheckInIntoYourBus}
                                </Animated.Text>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] leading-[25px] font-areaNormal-extrabold text-[#3B3A3C] mt-[8px] text-center',
                                    )}>
                                    {userLanguageStrings.ThisHelpsUsTrackTheBusAndAccurateMentionYourWhenYouCanGetDown}
                                </Animated.Text>
                            </Animated.View>
                        ) : (
                            <Text
                                style={tailwind.style(
                                    'text-base leading-[27px] font-areaNormal-extrabold text-[#313131] text-center tracking-[0.14px] px-6 pt-[30px] ',
                                )}>
                                {
                                    userLanguageStrings.AreYouSureThatYouAreInsideThisTrainThisWillHelpUsTrackStopAndAlertYouAtDestination
                                }
                            </Text>
                        )}
                        <Pressable
                            testID="show-ticket-button"
                            accessibilityLabel="Confirm check-in button"
                            onPress={async () => {
                                onCheckInPress();
                            }}
                            accessibilityRole="button"
                            style={tailwind.style('mt-[26px]')}
                            {...handlers}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        `bg-[${colors.view_ticket_bg}] h-[57px] flex-row items-center gap-[8px] justify-center rounded-[18px]`,
                                    ),
                                    animatedStyle,
                                ]}>
                                <Icon icon={<CheckIn />} size={20} />
                                <Animated.Text
                                    style={tailwind.style(
                                        `text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[${colors.view_ticket_text}]`,
                                    )}>
                                    {userLanguageStrings.ConfirmCheckIn}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                        <Pressable
                            testID="close-button"
                            accessibilityLabel="Close button"
                            onPress={onClosePress}
                            accessibilityRole="button"
                            style={tailwind.style('mt-3')}
                            {...noHandler}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'h-[57px] flex-row items-center gap-[8px] justify-center rounded-[18px]',
                                    ),
                                    noAnimatedStyle,
                                ]}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[#3B3A3C]',
                                    )}>
                                    {userLanguageStrings.NoIDidNotGetInYet}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                    {mode === 'bus' && (
                        <CloseButton
                            onPress={onClosePress}
                            closeButtonStyle="bg-white"
                            style=" absolute top-[20px] right-[20px] z-10"
                        />
                    )}
                </BottomSheetView>
            </PopUpModalConfig>
            {metroConfirmProps ? <MetroConfirmLocation {...metroConfirmProps} /> : null}
        </>
    );
};
