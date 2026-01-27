import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { DownArrow, UpArrow } from '../../../../../src-v2/multimodal/components/svg/Arrows';
import { Icon } from '../../../../../src/typescript/components/Icon';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { useScaleAnimation } from '../../../../../src/typescript/utils/useScaleAnimation';
import { ThumbsDown, ThumbsUp } from './svg/Thumbs';
import { getIconFromType } from '@/src-v2/multimodal/components/PublicTransportCard/PublicTransportCardUtils';
import { AccordionProps, RateTravelModeProps, YesOrNoProps } from '../types';
import { createAction } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const RateTravelMode = (props: RateTravelModeProps) => {
    const { item, mpDispatch, travelModeRate, editable } = props;
    return (
        <Animated.View
            key={item.legOrder}
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            layout={LinearTransition}
            style={tailwind.style('flex-row items-center justify-between border-b border-[#F5F5F5] py-4')}
            accessible={true}
            accessibilityLabel={`Rate your experience for ${item.transitMode} ride`}>
            <Animated.View style={tailwind.style('flex-row items-center ')}>
                <Icon
                    icon={getIconFromType(
                        item.transitMode === 'metro' ? 'metroNoleaf' : item.transitMode,
                        20,
                        '#4E5053',
                    )}
                    size={20}
                    color="#4E5053"
                />
                <Animated.Text
                    entering={FadeIn.delay(100)}
                    exiting={FadeOut}
                    layout={LinearTransition}
                    style={tailwind.style(
                        `pl-2 text-[#313131] text-[15px] font-areaNormal-bold leading-[22px] tracking-[0.35px] capitalize`,
                    )}>
                    {item.count ? `${item.transitMode} ${item.count}` : item.transitMode} ride
                </Animated.Text>
            </Animated.View>

            <YesOrNo
                travelModeRate={travelModeRate}
                mpDispatch={mpDispatch}
                legOrder={item.legOrder}
                mode={item.transitMode}
                editable={editable}
            />
        </Animated.View>
    );
};

export const Accordion = (props: AccordionProps) => {
    const { accordionState, mpDispatch, journeyItems, travelModeRate, editable } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            layout={LinearTransition}
            style={tailwind.style('rounded-[16px] p-4 border border-neutral-100 border-solid mt-8 mx-4')}>
            <Pressable
                accessibilityLabel="Rate your travel modes button"
                accessibilityRole="button"
                testID={`fdca6330-9426-4a08-86cc-a57e3257558a`}
                onPress={() => {
                    if (editable) {
                        mpDispatch(createAction('ACCORDION_TOGGLE', { state: !accordionState }));
                    }
                }}
                disabled={!editable} // Disable the pressable if not editable
            >
                <Animated.View
                    style={tailwind.style('flex-row items-center justify-between')}
                    accessibilityLabel={'Rate your travel modes'}>
                    <Animated.Text
                        style={tailwind.style('text-[15px] font-areaNormal-bold text-[#313131] leading-[22px]')}>
                        {userLanguageStrings.RateYourTravelModes}
                    </Animated.Text>
                    {accordionState ? (
                        <Icon icon={<UpArrow fill={undefined} />} size={16} color="#313131" />
                    ) : (
                        <Icon icon={<DownArrow fill={undefined} />} size={16} color="#313131" />
                    )}
                </Animated.View>
            </Pressable>
            {accordionState ? (
                <Animated.View style={tailwind.style('pt-5')} entering={FadeIn} exiting={FadeOut}>
                    {journeyItems.map((item, _) => (
                        <RateTravelMode
                            item={item}
                            mpDispatch={mpDispatch}
                            travelModeRate={travelModeRate}
                            editable={editable}
                        />
                    ))}
                </Animated.View>
            ) : null}
        </Animated.View>
    );
};

const YesOrNo = (props: YesOrNoProps & { mode: string | undefined }) => {
    const { animatedStyle } = useScaleAnimation();
    const { travelModeRate, mpDispatch, legOrder, mode, editable } = props;
    return (
        <Animated.View
            layout={LinearTransition}
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            style={tailwind.style('flex-row items-center gap-[8px]')}>
            <Pressable
                testID={`ee20042a-b8b8-45cf-aeed-468336203c87`}
                onPress={() => {
                    if (editable) {
                        mpDispatch(createAction('RATE_TRAVEL_MODE', { legOrder: legOrder, isGoodExperience: true }));
                    }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Thumbs up button for ${mode || 'this'} ride`}
                disabled={!editable} // Disable the pressable if not editable
            >
                {({ pressed }) => (
                    <Animated.View
                        style={[
                            tailwind.style(
                                `py-[9px] px-3 ${
                                    pressed || travelModeRate[legOrder] === true
                                        ? 'bg-[#313131]  border-transparent'
                                        : 'bg-[#FFFFFF]  border-neutral-100'
                                } border rounded-[20px] border-solid`,
                            ),
                            animatedStyle,
                        ]}>
                        <Icon
                            size={20}
                            icon={
                                <ThumbsUp
                                    stroke={pressed || travelModeRate[legOrder] === true ? '#FFFFFF' : '#727581'}
                                />
                            }
                        />
                    </Animated.View>
                )}
            </Pressable>
            <Pressable
                testID={`81b0cd73-46a9-4ff2-bd60-a44d39ade2d4`}
                onPress={() => {
                    if (editable) {
                        mpDispatch(createAction('RATE_TRAVEL_MODE', { legOrder: legOrder, isGoodExperience: false }));
                    }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Thumbs down button for ${mode || 'this'} ride`}
                disabled={!editable} // Disable the pressable if not editable
            >
                {({ pressed }) => (
                    <Animated.View
                        layout={LinearTransition}
                        entering={FadeIn.delay(100)}
                        exiting={FadeOut}
                        style={[
                            tailwind.style(
                                `py-[9px] px-3 ${
                                    pressed || travelModeRate[legOrder] === false
                                        ? 'bg-[#313131] border-transparent'
                                        : 'bg-[#FFFFFF]  border-neutral-100 '
                                } border  rounded-[20px] border-solid`,
                            ),
                            animatedStyle,
                        ]}>
                        <Icon
                            size={20}
                            icon={
                                <ThumbsDown
                                    stroke={pressed || travelModeRate[legOrder] === false ? '#FFFFFF' : '#727581'}
                                />
                            }
                        />
                    </Animated.View>
                )}
            </Pressable>
        </Animated.View>
    );
};
