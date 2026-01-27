import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
import { Icon } from '../common/Icon';
import { TicketIcon } from '../svg/Ticket.tsx';
import { RotateLoop } from '../common/RotateLoop.tsx';
import { createAction, Resolver } from '@/typescript/utils/common';
import { MultiModalRideScreenAction } from '../../screens/LiveJourneyTracking/Types';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext.tsx';

type PaymentStatusToastProps = {
    status: 'SUCCESS' | 'FAILURE' | 'PENDING';
    mpDispatch: Resolver<MultiModalRideScreenAction>;
};

const Reload = () => {
    return (
        <Svg width="17" height="16" viewBox="0 0 17 16" fill="none">
            <G clip-path="url(#clip0_5482_376)">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.03641 9.50753C5.39513 9.59048 5.61869 9.94854 5.53573 10.3073L5.08945 12.237C5.04961 12.4093 4.94296 12.5587 4.79297 12.6523C4.64298 12.7459 4.46193 12.7761 4.28966 12.7363L2.34955 12.2874C1.99084 12.2044 1.76732 11.8464 1.85031 11.4876C1.93331 11.1289 2.29138 10.9054 2.65009 10.9884L3.94063 11.287L4.23668 10.0068C4.31964 9.64812 4.67769 9.42457 5.03641 9.50753Z"
                    fill="#F78118"
                />
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.9954 3.64803C12.1454 3.55439 12.3264 3.52418 12.4987 3.56403L14.4388 4.0129C14.7976 4.09589 15.0211 4.45397 14.9381 4.81268C14.8551 5.17139 14.497 5.39491 14.1383 5.31192L12.8477 5.01334L12.5517 6.29348C12.4687 6.65221 12.1107 6.87576 11.752 6.7928C11.3932 6.70984 11.1697 6.35179 11.2526 5.99307L11.6989 4.06334C11.7387 3.89106 11.8454 3.74167 11.9954 3.64803Z"
                    fill="#F78118"
                />
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.8801 3.89824C12.1448 3.64236 12.5668 3.64955 12.8227 3.91429C15.1338 6.30546 15.1178 10.1169 12.7648 12.4888L12.7648 12.4889C11.2903 13.975 9.24346 14.5461 7.33079 14.2045C6.96834 14.1397 6.727 13.7934 6.79175 13.4309C6.8565 13.0685 7.20282 12.8272 7.56527 12.8919C9.0658 13.16 10.6656 12.7115 11.8182 11.5498C13.6594 9.69381 13.6718 6.71137 11.864 4.84092C11.6081 4.57617 11.6153 4.15412 11.8801 3.89824Z"
                    fill="#F78118"
                />
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.90755 12.4025C4.6428 12.6584 4.22075 12.6512 3.96487 12.3865C1.65377 9.99532 1.66984 6.18385 4.02281 3.81195L4.02284 3.81192C5.49727 2.32582 7.54414 1.75464 9.45681 2.09632C9.81926 2.16107 10.0606 2.50738 9.99585 2.86983C9.9311 3.23229 9.58478 3.47362 9.22233 3.40888C7.72179 3.14082 6.122 3.58924 4.96936 4.75101C3.12824 6.60697 3.11577 9.58941 4.9236 11.4599C5.17948 11.7246 5.17229 12.1467 4.90755 12.4025Z"
                    fill="#F78118"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_5482_376">
                    <Rect width="16" height="16" fill="white" transform="translate(0.5)" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};

export const PaymentStatusToast = (props: PaymentStatusToastProps) => {
    const { status, mpDispatch } = props;
    const { sheetAnimatedPosition } = useAnimatedContextValues(undefined);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    console.info('%c⧭', 'color: #8c0038', sheetAnimatedPosition.value);
    // const initialWidthSize = status=== 'PENDING' ? SCREEN_WIDTH - 32;

    const animatedPositionStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: -sheetAnimatedPosition.value - 180 }],
        };
    });

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(30).stiffness(320)}
            style={[tailwind.style('absolute bottom-0 w-full justify-center items-center'), animatedPositionStyle]}>
            <Animated.View
                layout={LinearTransition.springify().damping(30).stiffness(320)}
                style={[
                    tailwind.style(
                        'bg-[#2B282F] h-9 flex-row justify-center items-center rounded-[16px] px-5 mx-4',
                        status !== 'PENDING' ? `w-[${SCREEN_WIDTH - 32}px] h-[70px]` : '',
                    ),
                ]}>
                {status === 'PENDING' ? (
                    <Animated.View
                        entering={FadeIn.delay(100)}
                        exiting={FadeOut.duration(100)}
                        layout={LinearTransition.springify().damping(30).stiffness(320)}
                        style={tailwind.style('flex-row items-center')}>
                        <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-bold text-white')}>
                            {userLanguageStrings.TicketPaymentInProgress}
                        </Animated.Text>
                        <RotateLoop size={16}>
                            <Icon style={tailwind.style('pl-2')} icon={<Reload />} size={16} />
                        </RotateLoop>
                    </Animated.View>
                ) : null}
                {status === 'FAILURE' ? (
                    <Animated.View
                        entering={FadeIn.delay(100)}
                        exiting={FadeOut.duration(100)}
                        layout={LinearTransition.springify().damping(30).stiffness(320)}
                        style={tailwind.style('flex-row justify-between items-center w-full')}>
                        <Animated.View>
                            <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-bold text-white')}>
                                {userLanguageStrings.Paymentfailed}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                ) : null}
                {status === 'SUCCESS' ? (
                    <Animated.View
                        entering={FadeIn.delay(100)}
                        exiting={FadeOut.duration(100)}
                        layout={LinearTransition.springify().damping(30).stiffness(320)}
                        style={tailwind.style('flex-row justify-between items-center w-full')}>
                        <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-bold text-white')}>
                            {userLanguageStrings.Paymentsuccess}
                        </Animated.Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`View Ticket button`}
                            onPress={() => mpDispatch(createAction('VIEW_TICKET', undefined))}
                            testID="124c6f33-6a71-4370-ad14-6f4077d1881e">
                            <Animated.View
                                entering={FadeIn.delay(100)}
                                style={tailwind.style(
                                    'px-3 h-9 border-[1px] justify-center bg-white items-center border-[EEEEEE] rounded-[20px]',
                                )}>
                                <Icon color="#B8B6B9" icon={<TicketIcon />} size={20} />
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
};
