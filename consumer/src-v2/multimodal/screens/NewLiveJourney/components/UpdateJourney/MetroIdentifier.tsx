import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import metroSideView from '@/src-v2/assets/3D-assets/live-journey/metro-side-view-v2.webp';
import Svg, { Path } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const LoaderSpinner = () => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1,
        );
    }, []);

    const spinnerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotate: `${rotation.value}deg`,
                },
            ],
        };
    });

    return (
        <Animated.View style={spinnerStyle}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zM4.376 12a7.624 7.624 0 1015.248 0 7.624 7.624 0 00-15.248 0z"
                    fill="#E6E6E6"
                />
                <Path
                    d="M12 2.285c0-.71.577-1.293 1.282-1.21a11 11 0 019.643 9.643c.083.705-.5 1.282-1.21 1.282s-1.275-.579-1.383-1.28a8.432 8.432 0 00-7.052-7.052C12.58 3.56 12 2.995 12 2.285z"
                    fill="#656565"
                />
            </Svg>
        </Animated.View>
    );
};

const MetroIdentifier = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            style={tailwind.style(
                'py-[11px] pl-[90px] pr-[20px] gap-[6px] rounded-[20px] border border-[#F4F4F4] relative overflow-hidden bg-[#FBFBFB] flex-row items-center justify-between',
            )}>
            <Animated.Image
                accessible={false}
                source={metroSideView}
                style={tailwind.style('w-[80px] h-[50px] left-0 absolute left-[0px] overflow-hidden')}
            />
            <Animated.Text
                numberOfLines={2}
                style={tailwind.style('text-[14px] w-[198px] leading-[20px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                {userLanguageStrings.IdentifyingYourNearestMetroStop}
            </Animated.Text>
            <LoaderSpinner />
        </Animated.View>
    );
};

export default MetroIdentifier;
