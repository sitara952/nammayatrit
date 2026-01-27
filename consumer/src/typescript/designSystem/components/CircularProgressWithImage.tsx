import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { AnimationObject } from 'lottie-react-native';
import React from 'react';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useAnimatedContextValues } from '../../context/AnimatedValuesContext';
import CircularProgress from '../../designSystem/components/primitives/CircularProgress';
import { tailwind } from '../../tailwindTheme/tailwind';
import { Platform, View } from 'react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';

type CircularProgressWithImageProps = {
    lottieSrc: string | AnimationObject | { uri: string } | undefined;
    animatedProgressRef: SharedValue<number>;
    renderMode: 'HARDWARE' | 'SOFTWARE' | 'AUTOMATIC' | undefined;
};

const CircularProgressWithImage = (props: CircularProgressWithImageProps) => {
    const { sheetAnimatedPosition } = useAnimatedContextValues(undefined);

    const animatedSvgProgressPosition = useAnimatedStyle(() => {
        const offset = Platform.OS === 'ios' ? 50 : 110;
        return {
            bottom: SCREEN_HEIGHT - sheetAnimatedPosition.value - offset,
        };
    });

    return (
        <CircularProgress
            animatedProgressRef={props.animatedProgressRef}
            value={0}
            style={[
                tailwind.style(
                    `absolute bottom-0 z-10 left-[${
                        SCREEN_WIDTH / 2 - 62.5
                    }px] z-100 overflow-hidden h-[125px] w-[125px]`,
                ),
                animatedSvgProgressPosition,
            ]}>
            <View style={tailwind.style('w-[125px] h-[125px] justify-center items-center')}>
                <View
                    style={tailwind.style(
                        'w-[105px] h-[105px] rounded-full  justify-center items-center overflow-hidden',
                    )}>
                    <LottieWithFallback
                        fallback={undefined}
                        style={tailwind.style('w-[130px] h-[130px]', {
                            overflow: 'hidden',
                            borderRadius: 100,
                        })}
                        source={props.lottieSrc ?? ''}
                        autoPlay
                        loop
                        renderMode={props.renderMode}
                    />
                </View>
            </View>
        </CircularProgress>
    );
};

export default CircularProgressWithImage;
