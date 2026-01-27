import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
interface ShimmerProps {
    width: number | string;
    height: number | string;
    borderRadius?: number;
    backgroundColor?: string;
    initialOpacity?: number;
    finalOpacity?: number;
    wrapperStyle?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({
    width,
    height,
    borderRadius = 5,
    backgroundColor = '#E0E0E0',
    initialOpacity = 0.3,
    finalOpacity = 0.6,
    wrapperStyle = '',
}) => {
    const opacity = useSharedValue(initialOpacity);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withTiming(finalOpacity, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true,
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                {
                    width: typeof width === 'number' ? width : width,
                    height,
                    backgroundColor,
                    borderRadius,
                } as ViewStyle,
                animatedStyle,
                tailwind.style(wrapperStyle),
            ]}
        />
    );
};

export const TransitModesShimmer: React.FC = () => {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
            }}>
            <Shimmer width={100} height={24} borderRadius={7} />
            <Shimmer width={40} height={16} borderRadius={3} />
        </View>
    );
};

export default Shimmer;
