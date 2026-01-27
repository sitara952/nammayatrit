import React, { useRef } from 'react';
import { Platform, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import InputGroupDirection from '../../../../../src/typescript/assets/svg/direction/InputGroupDirection';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import {
    setIsServiceable,
    updateSearchedStop,
    updateStopLocationTextInput,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { EditPencil } from '@/typescript/assets/svg/symbols/EditPencil';

export const FromToArrow = () => {
    return (
        <Svg width={10} height={47} viewBox="0 0 10 47" fill="none">
            <Circle cx={5.03906} cy={7.5} r={4.5} fill="#8B8B8F" />
            <Circle cx={5.03906} cy={38.5} r={4.5} fill="#F7493F" />
            <Circle cx={5.03906} cy={38.5} r={1.96094} fill="#fff" />
            <Path
                d="M5.135 14v18"
                stroke="url(#paint0_linear_1150_25812)"
                strokeWidth={1.49495}
                strokeMiterlimit={10}
            />
            <Defs>
                <LinearGradient
                    id="paint0_linear_1150_25812"
                    x1={5.63501}
                    y1={14}
                    x2={5.63501}
                    y2={32}
                    gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#8B8B8F" />
                    <Stop offset={1} stopColor="#F7493F" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};

type ToAndFromSearchInputsProps = {
    enableAutoFocus: boolean | undefined;
    dropLocation: string;
    setDropLocation: (text: string) => void;
    startLocation: string;
    setStartLocation: (text: string) => void;
    startLocationDistance: number | undefined;
    appName: string;
    handleOnSourcePress: () => void;
    fallbackView: boolean;
};

const ToAndFromSearchInputAlternate = ({
    enableAutoFocus = true,
    dropLocation,
    setDropLocation,
    startLocation,
    startLocationDistance,
    handleOnSourcePress,
    fallbackView,
}: ToAndFromSearchInputsProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appSystemConfig = useAppSelector(selectAppConfig);
    const whereToTextInputRef = useRef<TextInput>(null);
    const handleOnLayout = () => {
        if (Platform.OS === 'android') {
            whereToTextInputRef?.current?.focus();
        }
    };
    const dispatch = useAppDispatch();
    const handleDestinationChangeText = (text: string) => {
        dispatch(updateSearchedStop({ index: 0, location: null }));
        dispatch(updateStopLocationTextInput({ index: 0, text }));
        dispatch(setIsServiceable(true));
        setDropLocation(text);
    };

    return (
        <Animated.View style={tailwind.style('px-4 pt-[22px] pb-3')}>
            <Animated.View style={tailwind.style('flex-row bg-white items-center px-4 rounded-[20px] min-h-[78px]')}>
                {appSystemConfig.screenConfig.singleModeSearchScreenConfig?.showInputGroupDirection && (
                    <Animated.View style={{ top: -10 }}>
                        <InputGroupDirection isMultimodal={true} numStops={undefined} heightMap={undefined} />
                    </Animated.View>
                )}
                <Animated.View style={tailwind.style('flex-col')}>
                    <Animated.View style={tailwind.style('flex px-4 my-[16px]')}>
                        <Animated.View style={tailwind.style('flex flex-row justify-between')}>
                            {!fallbackView ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Source button"
                                    hitSlop={{ top: 8, bottom: 8, left: 10, right: 10 }}
                                    onPress={handleOnSourcePress}
                                    testID="SOURCE_CLICK">
                                    <Animated.Text
                                        style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                                        <Animated.Text
                                            style={[{ textDecorationLine: 'underline', textTransform: 'capitalize' }]}>
                                            {startLocation}
                                        </Animated.Text>
                                        <Animated.Text style={[tailwind.style('text-[#969696]')]}>
                                            {' '}
                                            ({startLocationDistance ? (startLocationDistance / 1000).toFixed(2) : '0'}
                                            {userLanguageStrings.km} {userLanguageStrings.away})
                                        </Animated.Text>
                                    </Animated.Text>
                                </Pressable>
                            ) : (
                                <Animated.Text
                                    style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                                    <Animated.Text style={[{ textTransform: 'capitalize' }]}>
                                        {`${userLanguageStrings.PleaseEnterTheBusRouteBelow} -`}
                                    </Animated.Text>
                                </Animated.Text>
                            )}
                            {appSystemConfig.screenConfig.singleModeSearchScreenConfig?.showEditPencil &&
                                !fallbackView && (
                                    <Pressable
                                        accessibilityRole="button"
                                        testID="SOURCE_ICON_CLICK"
                                        onPress={handleOnSourcePress}
                                        hitSlop={{ top: 8, bottom: 8, left: 10, right: 10 }}
                                        style={[tailwind.style('pr-10')]}
                                        accessibilityLabel="Edit location button">
                                        <EditPencil />
                                    </Pressable>
                                )}
                        </Animated.View>
                        <TextInput
                            accessibilityLabel="Text input field"
                            onLayout={handleOnLayout}
                            style={[
                                tailwind.style(
                                    'mt-[14px] p-0 text-[16px] font-areaNormal-extrabold text-[#3B3A3C]',
                                    `w-[${SCREEN_WIDTH - 16 * 4}px]`,
                                    Platform.OS === 'ios' ? 'leading-[20px]' : '',
                                ),
                                {
                                    includeFontPadding: false,
                                },
                            ]}
                            autoFocus={Platform.OS === 'ios' ? enableAutoFocus : false}
                            ref={whereToTextInputRef}
                            placeholder={
                                fallbackView ? 'Search for bus routes' : userLanguageStrings.SearchForBusStopAndBusNo
                            } // bus one
                            returnKeyType="search"
                            onChangeText={handleDestinationChangeText}
                            defaultValue={dropLocation}
                            placeholderTextColor={'#C9C9C9'}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
            {/* <Animated.View style={tailwind.style('flex-row')}>
                <Animated.View style={tailwind.style('h-[1px] w-[20%] bg-[#656565]')} />
                <Animated.View style={tailwind.style('h-[1px] w-[80%] bg-[#656565]')} />
            </Animated.View> */}
        </Animated.View>
    );
};

export default ToAndFromSearchInputAlternate;
