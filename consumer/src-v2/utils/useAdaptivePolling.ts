import { useMemo, useRef } from 'react';

export interface PollingConfig {
    count: number;
    interval: number;
}

interface UseAdaptivePollingIntervalProps {
    pollingCounter: number;
    configs: PollingConfig[];
    exponentialBase?: number;
    stop: boolean;
}

/**
 * Adaptive polling interval calculator.
 *
 * TYPES:
 * - `PollingConfig` → { count: number; interval: number }
 * - `pollingCounter` → current attempt index (0-based)
 * - `exponentialBase` → multiplier used for exponential growth
 * - `stop` → when true, returns 0 and resets exponential state
 *
 * BEHAVIOR:
 * - Returns interval from `configs` while `pollingCounter` is within config ranges.
 * - After configs are exhausted, interval grows exponentially: base¹, base², base³...
 * - Exponential growth continues indefinitely until `stop` is true.
 * - When `stop` is true, polling stops and internal exponential power resets.
 */
export function useAdaptivePolling({
    configs,
    pollingCounter,
    exponentialBase = 5,
    stop = false,
}: UseAdaptivePollingIntervalProps) {
    const memoConfigs = useMemo(() => configs, [configs]);
    const powerRef = useRef(1);

    const pollingInterval = useMemo(() => {
        if (stop) {
            powerRef.current = 1;
            return 0;
        }
        // eslint-disable-next-line functional/no-let
        let preSum = 0;
        // eslint-disable-next-line functional/no-let
        for (let i = 0; i < memoConfigs.length; i++) {
            const config = memoConfigs[i];
            if (!config) continue;

            const { count, interval } = config;
            preSum += count;

            if (pollingCounter < preSum) {
                console.info(`[ADAPTIVE_POLLING] interval: ${interval} and pollingCounter: ${pollingCounter}`);
                powerRef.current = 1;
                return interval;
            }
        }

        powerRef.current *= exponentialBase;
        console.info(`[ADAPTIVE_POLLING] interval: ${powerRef.current} and pollingCounter: ${pollingCounter}`);
        return powerRef.current;
    }, [memoConfigs, pollingCounter, exponentialBase, stop]);

    return pollingInterval;
}
