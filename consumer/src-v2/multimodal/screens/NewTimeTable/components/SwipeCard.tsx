import { useHaptic } from '@/src-v2/utils/useHaptic';
import { forwardRef, PropsWithChildren, useImperativeHandle } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'react-native-haptic-feedback';
import Animated, {
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';

type SwipeToRateCardProps = {
    animatedPosition: SharedValue<number>;
    onCardSwiped: ((direction: 'left' | 'right') => void) | undefined;
    onCardRemoved: (() => void) | undefined;
    currentIndex: number;
    cardIndex: number;
    totalCards: number;
    disabled: boolean;
};

export interface SwipeCardRef {
    resetCard: () => void;
}

export const SwipeCard = forwardRef<SwipeCardRef, PropsWithChildren<SwipeToRateCardProps>>(
    (
        { animatedPosition, children, onCardSwiped, onCardRemoved, currentIndex, cardIndex, totalCards, disabled },
        ref,
    ) => {
        // Calculate if this is the current active card
        const isCurrentCard = currentIndex === cardIndex;
        const isNextCard = (currentIndex + 1) % totalCards === cardIndex;
        const isPrevCard = (currentIndex - 1 + totalCards) % totalCards === cardIndex;

        const translateX = useSharedValue(0);
        const isHidden = useSharedValue(false);

        // Calculate initial stack position
        const initialStackPosition = isCurrentCard ? 0 : isNextCard ? 1 : isPrevCard ? 2 : 3;

        // Initialize animated values based on initial stack position
        const animatedScale = useSharedValue(interpolate(initialStackPosition, [0, 1, 2, 3], [1, 0.95, 0.9, 0.85]));
        const animatedTranslateY = useSharedValue(interpolate(initialStackPosition, [0, 1, 2, 3], [0, 8, 16, 24]));

        // Stack position for smooth interpolation (0 = front, 1 = next, 2 = third, etc.)
        const stackPosition = useSharedValue(initialStackPosition);
        const haptic = useHaptic(Haptics.HapticFeedbackTypes.selection, {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
        });

        useAnimatedReaction(
            () => animatedPosition.value,
            (next, prev) => {
                if (next >= 100 && prev && prev < 100) {
                    haptic && runOnJS(haptic)();
                }
                if (next <= -100 && prev && prev > -100) {
                    haptic && runOnJS(haptic)();
                }
            },
        );

        // Update stack position based on card position changes
        useAnimatedReaction(
            () => ({ isCurrentCard, isNextCard, isPrevCard }),
            ({ isCurrentCard, isNextCard, isPrevCard }) => {
                const newStackPosition = isCurrentCard ? 0 : isNextCard ? 1 : isPrevCard ? 2 : 3;
                stackPosition.value = withSpring(newStackPosition, { damping: 25, stiffness: 300 });
            },
        );

        // Animate scale and translateY based on interpolated stack position
        useAnimatedReaction(
            () => stackPosition.value,
            position => {
                // Interpolate scale: 1.0 at front, gradually smaller towards back
                const targetScale = interpolate(position, [0, 1, 2, 3], [1, 0.95, 0.9, 0.85]);
                animatedScale.value = withSpring(targetScale, { damping: 25, stiffness: 300 });

                // Interpolate translateY: 0 at front, gradually more offset towards back
                const targetTranslateY = interpolate(position, [0, 1, 2, 3], [0, 8, 16, 24]);
                animatedTranslateY.value = withSpring(targetTranslateY, { damping: 25, stiffness: 300 });
            },
        );

        const handleCardSwiped = (direction: 'left' | 'right') => {
            onCardSwiped?.(direction);
            // Add a delay before calling onCardRemoved to allow animation to complete
            if (onCardRemoved) {
                setTimeout(() => {
                    onCardRemoved?.();
                }, 500);
            }
        };

        const resetCardPosition = () => {
            // Keep card hidden during entire reset process
            isHidden.value = true;

            // Very fast reset animation - almost instant
            translateX.value = withSpring(0, { damping: 50, stiffness: 800 }, finished => {
                if (finished) {
                    // Show card immediately when reset is done
                    isHidden.value = false;
                }
            });
            animatedPosition.value = withSpring(0, { damping: 50, stiffness: 800 });

            // Note: scale, opacity, and translateY will be updated automatically
            // by the useAnimatedReaction based on the card's new position
        };

        useImperativeHandle(ref, () => ({
            resetCard: resetCardPosition,
        }));

        const panGesture = Gesture.Pan()
            .enabled(!disabled)
            .activeOffsetX([-5, 5])
            .activeOffsetY([-100, 100])
            .onUpdate(event => {
                // Only allow swiping if this is the current card
                if (isCurrentCard) {
                    translateX.value = event.translationX;
                    animatedPosition.value = event.translationX;
                }
            })
            .onEnd(event => {
                // Only handle swipe end if this is the current card
                if (!isCurrentCard) return;

                if (event.translationX > 100) {
                    // Hide card immediately when swipe threshold is crossed
                    isHidden.value = true;

                    translateX.value = withSpring(800, {
                        damping: 18,
                        stiffness: 220,
                        overshootClamping: false,
                    });
                    animatedPosition.value = withSpring(800, {
                        damping: 18,
                        stiffness: 220,
                        overshootClamping: false,
                    });
                    runOnJS(handleCardSwiped)('right');
                } else if (event.translationX < -100) {
                    // Hide card immediately when swipe threshold is crossed
                    isHidden.value = true;

                    translateX.value = withSpring(-800, {
                        damping: 18,
                        stiffness: 220,
                        overshootClamping: false,
                    });
                    animatedPosition.value = withSpring(-800, {
                        damping: 18,
                        stiffness: 220,
                        overshootClamping: false,
                    });
                    runOnJS(handleCardSwiped)('left');
                } else {
                    translateX.value = withSpring(0, { damping: 28, stiffness: 180 });
                    animatedPosition.value = withSpring(0, { damping: 28, stiffness: 180 });
                }
            });

        const animatedCardStyle = useAnimatedStyle(() => {
            // Calculate z-index based on card position
            const zIndex = isCurrentCard ? 100 : isNextCard ? 99 : isPrevCard ? 98 : 97;

            // Hide card when it's marked as hidden or being swiped away
            const isSwipedAway = Math.abs(translateX.value) > 200;
            const finalOpacity = isHidden.value || isSwipedAway ? 0 : 1;

            return {
                transform: [
                    { translateX: translateX.value },
                    { translateY: animatedTranslateY.value },
                    { scale: animatedScale.value },
                    { rotate: `${interpolate(translateX.value, [-100, 0, 100], [-10, 0, 10])}deg` },
                ],
                zIndex: zIndex,
                opacity: finalOpacity,
            };
        });

        const handleOnLayout = () => {
            // Only run the intro animation if the card is at position 0 and is the current card
            if (translateX.value === 0 && isCurrentCard && !disabled) {
                translateX.value = withDelay(
                    100,
                    withSpring(25, { damping: 28, stiffness: 180 }, _finished => {
                        translateX.value = withSpring(-25, { damping: 28, stiffness: 180 }, _finished => {
                            translateX.value = withSpring(0, { damping: 28, stiffness: 180 });
                        });
                    }),
                );
            }
        };

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View onLayout={handleOnLayout} style={[animatedCardStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        );
    },
);
