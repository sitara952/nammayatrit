import BottomSheet from '@gorhom/bottom-sheet';
import { useKeyboardHandler, NativeEvent } from 'react-native-keyboard-controller';
import { useSharedValue, withTiming, runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useState } from 'react';

/**
 * Custom hook to synchronize keyboard movement with a BottomSheet/View.
 *
 * @param currentBottomSheetRef - Ref to the BottomSheet to control on keyboard events.
 * @returns {Object} keyboardY: animated style for keyboard translation,
 *                   isVisible: shared value for keyboard visibility,
 *                   isVisibleState: React state for keyboard visibility (for React JS usage)
 */
const useKeyBoardMovement = (currentBottomSheetRef: React.RefObject<BottomSheet | null> | undefined | null) => {
    const keyboardY = useSharedValue(0);
    const isVisible = useSharedValue(false);
    const [isVisibleState, setKeyboardVisible] = useState(false);

    useAnimatedReaction(
        () => isVisible.value,
        (current, prev) => {
            if (current !== prev) {
                runOnJS(setKeyboardVisible)(current);
            }
        },
        [],
    );
    const handleEnd = (e: NativeEvent) => {
        if (!e.progress) {
            isVisible.value = false;
            currentBottomSheetRef?.current?.expand();
        } else if (e.progress === 1) isVisible.value = true;
    };

    const handleMove = (e: NativeEvent) => {
        keyboardY.value = withTiming(-e.height, { duration: 16 });
    };

    useKeyboardHandler(
        {
            onStart: () => {
                'worklet';
            },
            onMove: e => {
                'worklet';
                runOnJS(handleMove)(e);
            },
            onInteractive: () => {
                'worklet';
            },
            onEnd: e => {
                'worklet';
                runOnJS(handleEnd)(e);
            },
        },
        [],
    );

    return { keyboardY, isVisible, isVisibleState };
};

export default useKeyBoardMovement;
