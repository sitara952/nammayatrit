import { useEffect, useRef, useCallback } from 'react';
import { BackHandler } from 'react-native';

/**
 * Custom hook that provides debounced back press handling.
 *
 * @param callback The function to be called when a back press occurs (after debounce)
 * @param debounceTime The debounce time in milliseconds (default: 1000ms)
 * @param dependencies Optional array of dependencies that will trigger a reattachment of the back handler
 * @returns void
 *
 * @example
 * // Basic usage
 * useDebounceBackPress(() => {
 *   navigation.goBack();
 *   return true;
 * });
 *
 * @example
 * // With dependencies
 * useDebounceBackPress(() => {
 *   if (isChatOpen) {
 *     setIsChatOpen(false);
 *   } else {
 *     BackHandler.exitApp();
 *   }
 *   return true;
 * }, 1000, [isChatOpen]);
 */
const useDebounceBackPress = (
    callback: () => boolean,
    debounceTime: number = 1000,
    dependencies: Array<string | boolean | object | null | undefined> | undefined = [],
): void => {
    const isProcessing = useRef(false);

    const handleBackPress = useCallback(() => {
        if (isProcessing.current) {
            return true;
        }

        isProcessing.current = true;
        setTimeout(() => {
            isProcessing.current = false;
        }, debounceTime);

        return callback();
    }, [callback, debounceTime, ...dependencies]);

    useEffect(() => {
        const backPressListener = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => {
            backPressListener.remove();
        };
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [handleBackPress]);
};

export default useDebounceBackPress;
