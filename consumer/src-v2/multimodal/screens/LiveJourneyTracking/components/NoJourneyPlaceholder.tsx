import React, { useState, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { ActivityIndicator } from 'react-native';

import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';

import {
    BottomSheetStage,
    SearchInput,
    selectIsServiceable,
    setActiveInput,
    setBottomSheetStage,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import { isUndefined } from 'lodash';

const SearchIcon = (color: string) => {
    return (
        <Svg width="14" height="15" viewBox="0 0 14 15" fill="none">
            <Path
                d="M6.41125 13.1663C2.96125 13.1663 0.15625 10.3612 0.15625 6.91125C0.15625 3.46125 2.96125 0.65625 6.41125 0.65625C9.86125 0.65625 12.6663 3.46125 12.6663 6.91125C12.6663 10.3612 9.86125 13.1663 6.41125 13.1663ZM6.41125 2.89125C4.20625 2.89125 2.40625 4.69125 2.40625 6.89625C2.40625 9.10125 4.20625 10.9012 6.41125 10.9012C8.61625 10.9012 10.4163 9.10125 10.4163 6.89625C10.4163 4.69125 8.61625 2.89125 6.41125 2.89125Z"
                fill={color}
            />
            <Path d="M11.1535 10.0614L9.5625 11.6523L12.2566 14.3464L13.8476 12.7554L11.1535 10.0614Z" fill={color} />
        </Svg>
    );
};

const _getComingSoonComponent = () => {
    return (
        <Animated.View style={tailwind.style(' px-6 mb-10')}>
            <Animated.Text
                style={tailwind.style('text-[28px] font-areaNormal-extrabold text-[#FF8C42] text-center mb-4')}>
                Coming Soon!
            </Animated.Text>

            <Animated.Text
                style={tailwind.style(
                    'text-[16px] font-areaNormal-bold text-[#3B3A3C;] text-center leading-[24px] px-4',
                )}>
                You'll soon be able to track your active journeys in real-time from this screen.
            </Animated.Text>
        </Animated.View>
    );
};

export const NoJourneyPlaceholder = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [isLoading, setIsLoading] = useState(false);
    const isProcessing = useRef(false);
    const appSystemConfig = useAppSelector(selectAppConfig);

    const handleOnPress = () => {
        if (isProcessing.current || isLoading) {
            return;
        }

        isProcessing.current = true;
        setIsLoading(true);
        hapticEffect(HapticFeedbackTypes.selection, undefined);

        // Small delay to ensure loading spinner is visible
        setTimeout(() => {
            dispatch(setActiveInput(SearchInput.Destination));
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'empty_live_tab' }));
            navigation.navigate(
                'mainTabNavigation',
                {
                    screen: 'homeTab_homeScreen',
                },
                { pop: true },
            );
            isProcessing.current = false;
            setIsLoading(false);
        }, 100);
    };

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');
    const isServiceable = useAppSelector(selectIsServiceable);
    return (
        <HardwareBackpressHandler>
            <Animated.View style={tailwind.style('flex-1 justify-center bg-[#F7F7F7]')}>
                <VideoPlayer
                    source={require('../../../../assets/videos/mt_ic_live_journey_placeholder.mp4')}
                    resizeMode="cover"
                    shouldLoop={true}
                    style={tailwind.style('absolute inset-0 h-full w-full')}
                    containerStyle={undefined}
                    fallbackElement={undefined}
                    bufferingElement={undefined}
                    onVideoEnd={undefined}
                    autoPlay={undefined}
                    bufferConfig={undefined}
                    videoRef={undefined}
                    pauseVideo={undefined}
                    videoControls={undefined}
                    onStateChange={undefined}
                    onError={undefined}
                    onBuffer={undefined}
                    muted={undefined}
                    bufferingDelay={undefined}
                    enableNetworkOptimizations={undefined}
                    networkOptimizationConfig={undefined}
                    bufferingElementStyle={undefined}
                    enablePauseOnGesture={undefined}
                    showMuteControl={undefined}
                    muteControlStyle={undefined}
                    onGesturePress={undefined}
                    handleMuteToggle={undefined}
                    disableFocus={true}
                    ignoreSilentSwitch={'obey'}
                    preventsDisplaySleepDuringVideoPlayback={false}
                />
                <Animated.View style={tailwind.style('flex-1 ')} />
                <Animated.View style={tailwind.style('pb-[50px]')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[19px] font-areaNormal-bold text-[#353436] px-15 text-center leading-[26px] tracking-[0.16px] pt-1',
                        )}>
                        {userLanguageStrings.Youdonthaveanyactivejourneynow}
                    </Animated.Text>
                    {!isUndefined(isServiceable) &&
                    isServiceable === true &&
                    appSystemConfig.flowConfig.enableLiveTracking ? (
                        <Pressable
                            testID="journey-placeholder-button"
                            accessibilityRole="button"
                            accessibilityLabel={`Plan journey now button`}
                            onPress={handleOnPress}
                            style={tailwind.style(
                                `min-h-[57px] bg-[${colors.Button_for_modes_bg}] justify-center items-center mx-17 flex-row rounded-[22px] mt-5`,
                            )}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.Button_for_modes_text} />
                            ) : (
                                <>
                                    {SearchIcon(colors.Button_for_modes_text)}
                                    <Animated.Text
                                        style={tailwind.style(
                                            `text-[16px] font-areaNormal-extrabold text-[${colors.Button_for_modes_text}] pl-3`,
                                        )}>
                                        {userLanguageStrings.Planajourneynow}
                                    </Animated.Text>
                                </>
                            )}
                        </Pressable>
                    ) : null}
                </Animated.View>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};
