import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import {
    BusIconMissed,
    BusIconWillBeMissed,
    TrainIconMissed,
    TrainIconWillBeMissed,
} from '@/src-v2/multimodal/components/svg/transport';
import { MetroIconMissed, MetroIconWillBeMissed } from '@/src-v2/multimodal/components/svg/transport/MetroIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useEffect, useState, useRef } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { getIconBGFromType } from '../utils/getTransitIconUtils';
import { NextBusesListProps, NextBusesListSection } from './NextBusesList';
import { useConfigContext } from '@/typescript/context/ConfigContext';

/**
 * Base props shared across all transit modes
 */
type BaseTransitStateProps = {
    /** Current status of the transit - whether it was missed or will be missed */
    status: 'missed' | 'will-be-missed';
    /** Additional information text displayed above the title */
    info: string;
    /** Main title text for the transit state */
    title: string;
    /** Type of transit mode */
    mode: 'Bus' | 'Metro' | 'Subway';
    /** Callback function when user presses the skip and take next transit button */
    handleOnPressSkipAndTakeNextTransit: () => void;
    /** Callback function when user presses the other options button */
    handleOnPressOtherOptions: () => void;
};

/**
 * Props specific to Bus transit mode
 * Includes additional bus-specific properties like next bus list and bus number
 */
type BusTransitStateProps = BaseTransitStateProps & {
    mode: 'Bus';
    /** Props for rendering the list of next available buses */
    nextBusesListProps: NextBusesListProps;
    /** The number/identifier of the next bus */
    nextBusNumber: string;
};

/**
 * Props for non-bus transit modes (Metro, Subway)
 * These modes don't require bus-specific properties
 */
type NonBusTransitStateProps = BaseTransitStateProps & {
    mode: 'Metro' | 'Subway';
};

/**
 * Union type for all transit state props
 * TypeScript will enforce that bus-specific props are only provided when mode is 'Bus'
 */
type TransitWillMissOrMissedStateProps = BusTransitStateProps | NonBusTransitStateProps;

type SkipAndTakeNextTransitButtonProps = {
    status: 'missed' | 'will-be-missed';
    mode: 'Bus' | 'Metro' | 'Subway';
    nextBusNumber: string | undefined;
    onPress: () => void;
};

const SkipAndTakeNextTransitButton = ({ status, mode, nextBusNumber, onPress }: SkipAndTakeNextTransitButtonProps) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    const [timeLeft, setTimeLeft] = useState<number>(-1);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Initialize timer when status becomes 'missed'
    useEffect(() => {
        if (status === 'missed') {
            setTimeLeft(10);
        } else {
            setTimeLeft(-1);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [status]);

    // Handle countdown
    useEffect(() => {
        if (timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev <= 1 ? 0 : prev - 1;
                    if (newTime === 0) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                        }
                        onPress();
                    }
                    return newTime;
                });
            }, 1000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
        return undefined;
    }, [timeLeft > 0]);

    const buttonText =
        status === 'will-be-missed'
            ? mode === 'Bus'
                ? userLanguageStrings.SkipAndTakeBusText(nextBusNumber)
                : mode === 'Metro'
                  ? userLanguageStrings.SkipAndTakeNextMetroText
                  : userLanguageStrings.SkipAndTakeNextTrainText
            : mode === 'Bus'
              ? userLanguageStrings.SwitchToBusText(nextBusNumber)
              : mode === 'Metro'
                ? userLanguageStrings.SwitchToTheNextMetroText
                : userLanguageStrings.SwitchToTheNextTrainText;

    return (
        <Pressable
            testID="skip-and-take-next-bus-button"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={buttonText + ' button'}
            style={tailwind.style('px-[24px]')}
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        `bg-[${colors.Confirm_button_bg}] h-[57px] flex-row items-center gap-[8px] justify-center rounded-[18px]`,
                    ),
                    animatedStyle,
                ]}>
                <Animated.Text
                    numberOfLines={1}
                    style={tailwind.style(
                        `text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[${colors.Confirm_button_text}]`,
                    )}>
                    {buttonText}
                    {timeLeft > 0 ? ` (${timeLeft}s)` : ''}
                </Animated.Text>
                <Icon
                    icon={<DoubleChevronRight fill={colors.Confirm_button_text} />}
                    color={colors.Confirm_button_text}
                    size={15}
                />
            </Animated.View>
        </Pressable>
    );
};

export const TransitWillMissOrMissedState = (props: TransitWillMissOrMissedStateProps) => {
    const { mode, title, info, status, handleOnPressSkipAndTakeNextTransit, handleOnPressOtherOptions } = props;
    const { handlers: otherOptionsButtonHandlers, animatedStyle: otherOptionsButtonAnimatedStyle } =
        useScaleAnimation();

    const isBusMode = mode === 'Bus';
    const busProps = isBusMode ? props : null;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <>
            <Animated.View
                entering={FadeIn.duration(250)}
                exiting={FadeOut.duration(100)}
                layout={LinearTransition.springify().damping(38).stiffness(280)}
                style={tailwind.style('mx-6 flex-row justify-between items-start pb-4')}>
                <Animated.View layout={LinearTransition.springify().damping(38).stiffness(280)}>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold text-[#7E7E7E] leading-[16px] tracking-[0.2px]',
                            `max-w-[${SCREEN_WIDTH - 48 - 48 - 8}px]`,
                        )}>
                        {info}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style(
                            'text-base font-areaNormal-extrabold text-[#313131]  leading-[27px] tracking-[0.14px] pt-2.5',
                            `max-w-[${SCREEN_WIDTH - 16 - 48 - 48}px]`,
                        )}>
                        {title}
                    </Animated.Text>
                </Animated.View>
                {mode === 'Metro' ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        layout={LinearTransition.springify().damping(38).stiffness(280)}>
                        {status === 'missed' ? (
                            <Animated.View
                                style={tailwind.style(
                                    'w-12 h-12 justify-center items-center rounded-2xl bg-[#F24649]',
                                )}>
                                <Icon icon={<MetroIconMissed />} size={32} color={undefined} />
                            </Animated.View>
                        ) : (
                            <Animated.View
                                style={tailwind.style(
                                    'w-12 h-12 justify-center items-center rounded-2xl',
                                    `bg-[${getIconBGFromType('Metro')}]`,
                                )}>
                                <Icon icon={<MetroIconWillBeMissed />} size={32} color={undefined} />
                            </Animated.View>
                        )}
                    </Animated.View>
                ) : null}
                {mode === 'Bus' ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        layout={LinearTransition.springify().damping(38).stiffness(280)}>
                        {status === 'missed' ? (
                            <Animated.View
                                style={tailwind.style(
                                    'w-12 h-12 justify-center items-center rounded-2xl bg-[#F24649]',
                                )}>
                                <Icon icon={<BusIconMissed />} size={32} color={undefined} />
                            </Animated.View>
                        ) : (
                            <Animated.View
                                style={tailwind.style(
                                    'w-12 h-12 justify-center items-center rounded-2xl',
                                    `bg-[${getIconBGFromType('Bus')}]`,
                                )}>
                                <Icon icon={<BusIconWillBeMissed />} size={32} color={undefined} />
                            </Animated.View>
                        )}
                    </Animated.View>
                ) : null}
                {mode === 'Subway' ? (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        layout={LinearTransition.springify().damping(38).stiffness(280)}>
                        {status === 'missed' ? (
                            <Animated.View
                                style={tailwind.style(
                                    'w-12 h-12 justify-center items-center rounded-2xl bg-[#F24649]',
                                )}>
                                <Icon icon={<TrainIconMissed />} size={32} color={undefined} />
                            </Animated.View>
                        ) : (
                            <Animated.View
                                style={tailwind.style(
                                    'w-12 h-12 justify-center items-center rounded-2xl',
                                    `bg-[${getIconBGFromType('Subway')}]`,
                                )}>
                                <Icon icon={<TrainIconWillBeMissed />} size={32} color={undefined} />
                            </Animated.View>
                        )}
                    </Animated.View>
                ) : null}
            </Animated.View>
            <SkipAndTakeNextTransitButton
                status={status}
                mode={mode}
                nextBusNumber={isBusMode ? busProps?.nextBusNumber : undefined}
                onPress={handleOnPressSkipAndTakeNextTransit}
            />
            <Pressable
                testID="other-options-button"
                onPress={handleOnPressOtherOptions}
                accessibilityRole="button"
                accessibilityLabel="Other Options button"
                style={tailwind.style('pt-[22px]')}
                {...otherOptionsButtonHandlers}>
                <Animated.View style={otherOptionsButtonAnimatedStyle}>
                    <Animated.Text
                        style={tailwind.style('text-[14px] text-center font-areaNormal-extrabold text-[#656565]')}>
                        {userLanguageStrings.OtherOptions}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
            {isBusMode && busProps ? <NextBusesListSection {...busProps.nextBusesListProps} /> : null}
            <Animated.View style={tailwind.style('h-3')} />
        </>
    );
};
