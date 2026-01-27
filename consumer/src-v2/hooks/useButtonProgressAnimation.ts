import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { setIsEditButtonDisabled } from '@/typescript/state/client/search';
import { selectSearchId } from '@/typescript/state/client/user';

// Delay after animation completes before enabling button (in milliseconds)
const ENABLE_DELAY = 100;

/**
 * Hook for handling button animation with progress circle
 *
 * @param isExternallyDisabled - Whether the button is disabled from outside this hook
 * @param onButtonClick - Callback function to execute when button is clicked
 * @returns Object containing state and handlers for the button animation
 */
export const useButtonProgressAnimation = (isExternallyDisabled: boolean, onButtonClick: () => void) => {
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const dispatch = useAppDispatch();
    const searchId = useAppSelector(state => selectSearchId(state, null));

    const disableTimeMs = newFeatureFlags.editTipOrVehicleButtonDisableThreshold;
    const disableTimeSecs = Math.ceil(disableTimeMs / 1000);

    const [localButtonDisabled, setLocalButtonDisabled] = useState(true);
    const [secondsRemaining, setSecondsRemaining] = useState(disableTimeSecs);
    const [progressValue, setProgressValue] = useState(0);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [_, setComponentMounted] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const isComponentMountedRef = useRef(true);
    const buttonDisabled = localButtonDisabled || isExternallyDisabled;

    useEffect(() => {
        isComponentMountedRef.current = true;
        setLocalButtonDisabled(true);
        setProgressValue(0);
        startTimeRef.current = Date.now();
        setComponentMounted(true);

        // Reset Redux state if it's stuck as true from previous session
        // This handles the case where app was closed during the timeout
        if (isExternallyDisabled && searchId) {
            dispatch(setIsEditButtonDisabled({ id: searchId, payload: false }));
        }

        return () => {
            isComponentMountedRef.current = false;
        };
    }, [isExternallyDisabled, searchId, dispatch]);

    // Clean up animation when component unmounts
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Handle enabling the button after animation completes
    useEffect(() => {
        if (animationComplete && localButtonDisabled) {
            const enableTimer = setTimeout(() => {
                if (isComponentMountedRef.current) {
                    setLocalButtonDisabled(false);
                    setAnimationComplete(false);
                }
            }, ENABLE_DELAY);

            return () => clearTimeout(enableTimer);
        }
        return undefined;
    }, [animationComplete, localButtonDisabled]);

    // Start timer and update progress when button is disabled
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (buttonDisabled) {
            setAnimationComplete(false);
            setProgressValue(0);
            setSecondsRemaining(disableTimeSecs);
            startTimeRef.current = Date.now();

            // Update very frequently for smoother animation
            const updateIntervalMs = 16; // ~60fps for smoother animation

            intervalRef.current = setInterval(() => {
                if (!isComponentMountedRef.current) return;
                const elapsedTime = Date.now() - startTimeRef.current;
                const progress = Math.min(elapsedTime / disableTimeMs, 0.999);
                const remaining = Math.max(0, disableTimeSecs - elapsedTime / 1000);
                setSecondsRemaining(remaining);
                setProgressValue(progress);

                if (elapsedTime >= disableTimeMs - updateIntervalMs) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }

                    setProgressValue(1);
                    setSecondsRemaining(0);
                }
            }, updateIntervalMs);

            // Final safeguard to ensure animation completes
            const finalTimeout = setTimeout(() => {
                if (isComponentMountedRef.current) {
                    setProgressValue(1);
                    setSecondsRemaining(0);
                }
            }, disableTimeMs - 10);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                clearTimeout(finalTimeout);
            };
        } else {
            setProgressValue(0);
            setSecondsRemaining(0);
            return undefined;
        }
    }, [buttonDisabled, disableTimeSecs, disableTimeMs]);

    const handleButtonPress = () => {
        if (buttonDisabled) return;

        setLocalButtonDisabled(true);
        setAnimationComplete(false);
        setProgressValue(0);

        onButtonClick();

        timeoutRef.current = setTimeout(() => {
            if (isComponentMountedRef.current) {
                setProgressValue(1);
            }
        }, disableTimeMs - 100);
    };

    // Handle animation completion
    const handleAnimationComplete = () => {
        if (progressValue >= 0.99) {
            setAnimationComplete(true);
        }
    };

    return {
        buttonDisabled,
        secondsRemaining,
        progressValue,
        handleButtonPress,
        handleAnimationComplete,
    };
};
