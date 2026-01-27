import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import Animated, { interpolate, runOnJS, useAnimatedStyle } from 'react-native-reanimated';
import colors from '@/typescript/designSystem/colorPalette';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';

type BottomSheetBackdropProps = BottomSheetBackgroundProps & {
    /* eslint-disable myCustomPlugin/enforce-optional-params */
    onBackdropPress?: () => void;
};

export const SheetBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    const { animatedIndex, style } = props;
    const [pointerEvents, setPointerEvents] = useState<'none' | 'auto'>('none');
    /**
     * Add all the refs of sheet modals which needs to close on overlay press
     */

    const animatedStyle = useAnimatedStyle(() => {
        runOnJS(setPointerEvents)(animatedIndex.value <= 0 ? 'none' : 'auto');
        return {
            opacity: interpolate(animatedIndex.value, [-1, 0, 1], [0, 0, 1]),
        };
    });

    const handleBackdropPress = () => {
        // Add ref
        props.onBackdropPress?.();
    };

    return (
        <Pressable
            accessibilityRole="button"
            testID="review_feedback_sheet_backdrop"
            onPress={handleBackdropPress}
            accessibilityLabel="Close button"
            style={style}
            pointerEvents={pointerEvents}>
            {/* TODO: Add Blur Component for iOS and let us keep the below view for Android */}
            <Animated.View
                style={[tailwind.style('bg-[' + `${colors?.recovered?.neutralHigh}` + '80]'), style, animatedStyle]}
            />
        </Pressable>
    );
};
