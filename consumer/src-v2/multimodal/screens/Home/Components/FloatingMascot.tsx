import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import React, { useState } from 'react';
import Animated, { SlideInDown, SlideOutDown, useAnimatedStyle } from 'react-native-reanimated';

import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import WaveLottie from '../../../../assets/lottie/wave-delayed.lottie';

export const FloatingMascot = () => {
    const { sheetAnimatedPosition, sheetAnimatedIndex } = useAnimatedContextValues(undefined);
    const [showDriverImg, setShowDriverImg] = useState(true);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY:
                        sheetAnimatedIndex.value === -1 ? 900 : -(SCREEN_HEIGHT - sheetAnimatedPosition.value) + 270,
                },
            ],
        };
    });
    React.useEffect(() => {
        const delay = setTimeout(() => {
            setShowDriverImg(false);
        }, 8470);

        return () => clearTimeout(delay);
    }, []);

    return showDriverImg ? (
        <Animated.View
            style={[tailwind.style('absolute w-full -z-10 bottom-0'), animatedStyle]}
            exiting={SlideOutDown.duration(1500)}>
            <Animated.View entering={SlideInDown.duration(1610).delay(1680)} exiting={SlideOutDown.duration(1800)}>
                <LottieWithFallback
                    style={tailwind.style('w-[400px] h-[500px] z-0')}
                    source={WaveLottie}
                    autoPlay
                    fallback={undefined}
                />
            </Animated.View>
        </Animated.View>
    ) : null;
};
