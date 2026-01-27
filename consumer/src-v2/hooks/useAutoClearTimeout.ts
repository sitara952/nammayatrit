import { useEffect, useRef } from 'react';

/**
 * Custom hook that manages timeouts and can optionally clear them on unmount.
 * Dependency-based clearing should be handled by the user in their own useEffect.
 *
 * @returns An object with methods to set and clear timeouts
 */
export const useAutoClearTimeout = () => {
    const timeoutsRef = useRef<Map<NodeJS.Timeout, { clearOnUnmount: boolean }>>(new Map());

    // On unmount, clear only timeouts with clearOnUnmount=true
    useEffect(() => {
        return () => {
            for (const [id, meta] of timeoutsRef.current.entries()) {
                if (meta.clearOnUnmount) {
                    clearTimeout(id);
                }
            }
            // Remove only those cleared
            for (const [id, meta] of timeoutsRef.current.entries()) {
                if (meta.clearOnUnmount) {
                    timeoutsRef.current.delete(id);
                }
            }
        };
    }, []);

    /**
     * Sets a timeout that will optionally clear on unmount.
     *
     * @param callback - The function to call after the delay
     * @param delay - The delay in milliseconds before calling the callback
     * @param clearOnUnmount - Whether to clear this timeout on unmount (default: true)
     * @returns The timeout ID
     */
    const setAutoClearTimeout = (
        callback: () => void,
        delay: number,
        clearOnUnmount: boolean = true,
    ): NodeJS.Timeout => {
        const timeoutId = setTimeout(() => {
            timeoutsRef.current.delete(timeoutId);
            callback();
        }, delay);
        timeoutsRef.current.set(timeoutId, { clearOnUnmount });
        return timeoutId;
    };

    /**
     * Clears a specific timeout manually.
     *
     * @param timeoutId - The ID of the timeout to clear
     */
    const clearAutoClearTimeout = (timeoutId: NodeJS.Timeout | null | undefined): void => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutsRef.current.delete(timeoutId);
        }
    };

    /**
     * Clears all timeouts manually.
     *
     * @returns void
     */
    const clearAllTimeouts = (): void => {
        for (const id of timeoutsRef.current.keys()) {
            clearTimeout(id);
        }
        timeoutsRef.current.clear();
    };

    return {
        setAutoClearTimeout,
        clearAutoClearTimeout,
        clearAllTimeouts,
    };
};
