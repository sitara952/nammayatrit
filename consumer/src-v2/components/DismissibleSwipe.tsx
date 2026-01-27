import React, { memo, useRef, useState } from 'react';
import { ViewStyle } from 'react-native';
import {
    PanGestureHandler,
    HandlerStateChangeEvent,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withTiming, interpolate } from 'react-native-reanimated';

/* ──────────────────────────────────────────
 * Constants:
 * THRESHOLD: Distance (in px) after which the swipe is considered a dismiss gesture
 * OFFSCREEN: Distance to slide the component off-screen before fade
 * FADE_START: Distance at which opacity fade begins
 * END_OPACITY: Final opacity value before fade-out completes
 * ────────────────────────────────────────── */
const THRESHOLD = 50;
const OFFSCREEN = 400;
const FADE_START = 20;
const END_OPACITY = 0.1;

/**
 * Props for DismissibleSwipe component:
 *
 * @param children - React node to render inside the swipeable container
 * @param onDismiss - Optional callback invoked after swipe-dismiss animation completes
 * @param direction - Allowed swipe direction(s): 'up', 'down', or 'both' (default is 'up')
 * @param style - Optional custom styles for the animated container
 */
interface Props {
    children: React.ReactNode;
    onDismiss?: () => void;
    direction?: 'up' | 'down' | 'both';
    style?: ViewStyle;
}

export const DismissibleSwipe = memo<Props>(({ children, onDismiss, direction = 'up', style }) => {
    const [visible, setVisible] = useState(true);
    const dismissed = useRef(false);
    const translateY = useSharedValue(0);
    const baseOpacity = useSharedValue(1);

    const onGesture = (e: PanGestureHandlerGestureEvent) => {
        if (dismissed.current) return;
        const dy = e.nativeEvent.translationY;
        const okUp = direction === 'up' || direction === 'both';
        const okDown = direction === 'down' || direction === 'both';
        if ((dy < 0 && okUp) || (dy > 0 && okDown)) {
            translateY.value = dy;
        }
    };

    const onEnd = (_e: HandlerStateChangeEvent<Record<string, unknown>>) => {
        if (dismissed.current) return;
        if (Math.abs(translateY.value) < THRESHOLD) {
            translateY.value = withTiming(0, { duration: 200 });
            return;
        }

        dismissed.current = true;
        const to = translateY.value < 0 ? -OFFSCREEN : OFFSCREEN;

        translateY.value = withTiming(to, { duration: 200 }, finished => {
            if (finished) runOnJS(startFade)();
        });
    };

    const startFade = () => {
        baseOpacity.value = withTiming(0, { duration: 150 }, fin => {
            if (fin) runOnJS(finish)();
        });
    };
    const finish = () => {
        setVisible(false);
        onDismiss?.();
    };

    const aStyle = useAnimatedStyle(() => {
        const dist = Math.abs(translateY.value);
        const dragFade = interpolate(dist, [FADE_START, THRESHOLD], [1, END_OPACITY]);
        const scale = interpolate(dist, [0, THRESHOLD], [1, 0.95]);

        return {
            opacity: baseOpacity.value * dragFade,
            transform: [{ translateY: translateY.value }, { scale }],
        };
    });

    if (!visible) return null;

    return (
        <PanGestureHandler onGestureEvent={onGesture} onEnded={onEnd}>
            <Animated.View style={[aStyle, style]}>{children}</Animated.View>
        </PanGestureHandler>
    );
});
