import { useState } from 'react';
import Animated from 'react-native-reanimated';
import { SharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { StyleType } from '../types/CommonTypes';
import LinearGradient from 'react-native-linear-gradient';

interface ProgressBarProps {
    animatedProgressRef: SharedValue<number>;
    min?: number;
    max?: number;
    fillColor?: string;
    unFillColor?: string;
    height?: number;
    style: StyleType;
    containerStyle: StyleType;
    gradient?: string[];
    useGradient?: boolean;
}

export const ProgressBar = ({
    animatedProgressRef,
    min = 0,
    max = 100,
    fillColor = '#58545D',
    unFillColor = '#F0F0F0',
    height = 10,
    style,
    containerStyle,
    gradient = ['#4facfe', '#00f2fe'],
    useGradient = false,
}: ProgressBarProps) => {
    const progress = animatedProgressRef;

    const [sliderWidth, setSliderWidth] = useState(0);
    const animatedTrackStyle = useAnimatedStyle(() => ({
        width: interpolate(progress.value, [min, max], [0, sliderWidth]),
    }));

    return (
        <Animated.View style={containerStyle}>
            <Animated.View
                onLayout={e => {
                    setSliderWidth(e.nativeEvent.layout.width);
                }}
                style={[
                    {
                        height: height,
                        borderRadius: height / 2,
                        backgroundColor: unFillColor,
                        zIndex: 1,
                    },
                    style,
                ]}
            />
            {useGradient ? (
                <Animated.View
                    style={[
                        {
                            height: height,
                            borderRadius: height / 2,
                            overflow: 'hidden',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                        },
                        style,
                    ]}>
                    <Animated.View style={[{ height: '100%' }, animatedTrackStyle]}>
                        <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            ) : (
                <Animated.View
                    style={[
                        {
                            height: height,
                            borderRadius: height / 2,
                            overflow: 'hidden',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                        },
                        style,
                    ]}>
                    <Animated.View
                        style={[
                            {
                                height: '100%',
                                backgroundColor: fillColor,
                            },
                            animatedTrackStyle,
                        ]}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
};
