import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import React from 'react';
import Animated, {
    interpolate,
    LinearTransition,
    SharedValue,
    useAnimatedProps,
    useAnimatedStyle,
} from 'react-native-reanimated';

import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { AnimatedScreenKey, useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import SwipeDown from '@/src-v2/assets/svg/SwipeDown';
import AnimateableText from 'react-native-animateable-text';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

type SwipeToViewMapProps = {
    onPress: () => void;
    buttonPositionUpwardsBy: SharedValue<number> | undefined;
    /**
     * Determines whether the header should float above the content
     * or be positioned statically within the layout.
     */
    screenName: AnimatedScreenKey | undefined;
    isFloatingHeader: boolean;
};

const SwipeToViewMap = (props: SwipeToViewMapProps) => {
    const { onPress, buttonPositionUpwardsBy, isFloatingHeader = true, screenName } = props;
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues(screenName);
    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - (buttonPositionUpwardsBy?.value ?? 0) - 72,
                },
            ],
        };
    });
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const buttonTextValue = useAnimatedProps(() => {
        return {
            text:
                sheetAnimatedIndex.value === 0
                    ? userLanguageStrings.Swipeuptoviewdetails
                    : userLanguageStrings.Swipedowntoviewmap,
        };
    }, [sheetAnimatedIndex]);

    const rotationStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: `${interpolate(sheetAnimatedIndex.value, [0, 1], [180, 0])}deg`,
            },
        ],
    }));

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(300)}
            style={[
                tailwind.style(`w-full`),
                tailwind.style(
                    isFloatingHeader ? `absolute -left-[${SCREEN_WIDTH / 2 - 140}px] px-[16px] items-end` : '',
                ),
                isFloatingHeader ? floatingHeaderStyle : {},
            ]}>
            <View style={tailwind.style('flex-row items-center justify-center mt-4 ')}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Swipe button`}
                    testID="9df66d29-7fa1-4e08-9c18-2106577aea32"
                    onPress={onPress}
                    style={tailwind.style(
                        `flex-row items-center justify-center gap-2 ${
                            isFloatingHeader ? 'bg-white py-[10px] px-4 rounded-full' : ''
                        }`,
                    )}>
                    <Animated.View style={rotationStyle}>
                        <SwipeDown />
                    </Animated.View>
                    <AnimateableText
                        onPress={onPress}
                        style={[
                            tailwind.style('text-[#4C4C4C] text-[13px] font-areaNormal-extrabold'),
                            { includeFontPadding: false },
                        ]}
                        animatedProps={buttonTextValue}></AnimateableText>
                    <Animated.View style={rotationStyle}>
                        <SwipeDown />
                    </Animated.View>
                </Pressable>
            </View>
        </Animated.View>
    );
};

export default SwipeToViewMap;
