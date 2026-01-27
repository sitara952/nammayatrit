import { useAnimatedReaction, runOnJS, SharedValue } from 'react-native-reanimated';
import { useRef } from 'react';

const debounceTime: number = 200;

const useOnAnimationEnd = (
    animatedPosition: SharedValue<number>,
    shouldRun: React.MutableRefObject<boolean>,
    onAnimationStop: (currPos: number) => void,
) => {
    const animatedHeights = useRef<number[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const startTimer = (currentPosition: number) => {
        clearTimer();
        timerRef.current = setTimeout(() => {
            onAnimationStop(currentPosition); // Callback for animation end
            animatedHeights.current = []; // Clear history
        }, debounceTime);
    };

    useAnimatedReaction(
        () => animatedPosition.value,
        currentPosition => {
            if (!shouldRun.current) return;

            animatedHeights.current.push(currentPosition);

            // Note:: Commenting this logic to verify if everything works without this change
            // BE CAREFUL WHEN EDITING CODE BELOW
            const len = animatedHeights.current.length;
            if (len >= 3) {
                const lastElement = animatedHeights.current[len - 1] ?? 0;
                const last2ndElement = animatedHeights.current[len - 2] ?? 0;
                const last3rdElement = animatedHeights.current[len - 3] ?? 0;

                const diffLastTwo = Math.abs(lastElement - last2ndElement);
                const diffLastThree = Math.abs(lastElement - last3rdElement);

                if (Math.abs(diffLastThree - diffLastTwo) > 0) {
                    // Potential animation stop detected, debounce the callback
                    runOnJS(startTimer)(currentPosition);
                } else {
                    // Reset the timer if there’s significant movement
                    runOnJS(clearTimer)();
                }
            }
        },
        [shouldRun, onAnimationStop], // dependencies
    );
};

export default useOnAnimationEnd;
