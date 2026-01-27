import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import { useRefsContext } from '../../../../../src/typescript/context/RefsContext';
export const BottomSheetModalBackdrop: React.FC<BottomSheetBackgroundProps> = props => {
    const { animatedIndex, style } = props;
    /**
     * Add all the refs of sheet modals which needs to close on overlay press
     */
    const { multiTransitFeedbackBottomSheetModalRef } = useRefsContext();
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1]),
        };
    });

    const handleBackdropPress = () => {
        multiTransitFeedbackBottomSheetModalRef.current?.dismiss({
            overshootClamping: true,
        });
    };
    const colors = {
        recovered: {
            neutralLow: '#7B7B7B',
        },
    };
    return (
        <Pressable
            accessibilityLabel="Close button"
            accessibilityRole="button"
            testID={`3f1561d8-4631-4fcb-bca2-7ebaebddc79a`}
            onPress={handleBackdropPress}
            style={tailwind.style('flex-1 absolute  inset-0')}>
            {/* TODO: Add Blur Component for iOS and let us keep the below view for Android */}
            <Animated.View
                style={[tailwind.style('bg-[' + `${colors?.recovered?.neutralLow}` + '80]'), style, animatedStyle]}
            />
        </Pressable>
    );
};
