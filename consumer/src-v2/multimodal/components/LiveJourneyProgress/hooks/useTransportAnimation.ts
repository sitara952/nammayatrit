import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';

interface UseTransportAnimationProps {
    index: number;
    totalTransits: number;
    activeLiveTransit: number;
    activeLiveTransitProgress: number;
}

export const useTransportAnimation = ({
    index,
    totalTransits,
    activeLiveTransit,
    activeLiveTransitProgress,
}: UseTransportAnimationProps) => {
    const REMAINING_WIDTH = SCREEN_WIDTH - 32 - (totalTransits - 1) * 36 - (totalTransits - 1) * 20;

    const isActive = useDerivedValue(() => {
        return activeLiveTransit === index
            ? withSpring(1, { damping: 40, stiffness: 300 })
            : withSpring(0, { damping: 40, stiffness: 300 });
    });

    const sharedTranslateX = useDerivedValue(() => {
        return isActive.value
            ? withSpring(activeLiveTransitProgress, { damping: 40, stiffness: 300 })
            : withSpring(0, { damping: 40, stiffness: 300 });
    }, [activeLiveTransitProgress, isActive]);

    const containerWidth = useAnimatedStyle(() => {
        return {
            width: interpolate(isActive.value, [0, 1], [36, REMAINING_WIDTH]),
        };
    });

    const iconTranslate = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: interpolate(
                        sharedTranslateX.value,
                        [0, 100],
                        [0, REMAINING_WIDTH - 36],
                        Extrapolation.CLAMP,
                    ),
                },
            ],
        };
    });

    const viewTranslate = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: interpolate(
                        sharedTranslateX.value,
                        [0, 100],
                        [-(REMAINING_WIDTH - 36), 0],
                        Extrapolation.CLAMP,
                    ),
                },
            ],
        };
    });

    return {
        containerWidth,
        iconTranslate,
        viewTranslate,
        isActive,
    };
};
