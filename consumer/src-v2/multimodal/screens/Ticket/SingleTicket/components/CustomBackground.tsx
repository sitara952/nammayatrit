import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const UpArrow = () => {
    return (
        <Svg width="14" height="17" viewBox="0 0 14 17" fill="none">
            <Path d="M13 16L7 10L1 16" stroke="#656565" stroke-width="2" stroke-linejoin="round" />
            <Path opacity="0.2" d="M13 7L7 1L1 7" stroke="#656565" stroke-width="2" stroke-linejoin="round" />
        </Svg>
    );
};
const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({ style, animatedIndex }) => {
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    //#region styles
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(animatedIndex.value, [-1, 0], ['#fff', '#313131']),
        opacity: interpolate(animatedIndex.value, [-1, 0], [0, 0.85]),
    }));
    const containerStyle = useMemo(() => [style, containerAnimatedStyle], [style, containerAnimatedStyle]);
    //#endregion

    // render
    return (
        <Animated.View pointerEvents="none" style={containerStyle}>
            <Animated.View
                style={tailwind.style(
                    `pt-[${top ? top : 16}px] pb-[${bottom ? bottom : 16}px]`,
                    'justify-center items-center gap-4',
                )}>
                <Animated.Text
                    style={tailwind.style(
                        'text-base  font-areaNormal-extrabold text-center tracking-[0.25px] text-[#656565]',
                    )}>
                    {userLanguageStrings.TicketGenerated}
                </Animated.Text>
                <UpArrow />
            </Animated.View>
        </Animated.View>
    );
};

export default CustomBackground;
