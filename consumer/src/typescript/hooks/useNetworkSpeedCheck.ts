import { useEffect, useRef, useState } from 'react';
import { useNetInfo, NetInfoState } from '@react-native-community/netinfo';

const SLOW_CELLULAR_GENS = ['2g', '3g', 'slow-2g'] as const;
const WIFI_MIN_MBPS = 1;
const OFFLINE_DEBOUNCE_MS = 1500;

const isVerySlowWifi = (state: NetInfoState): boolean => {
    if (state.type !== 'wifi') return false;
    const d = state.details ?? {};
    const speeds = [d.linkSpeed, d.txLinkSpeed, d.rxLinkSpeed].filter(
        (v): v is number => typeof v === 'number' && v >= 0,
    );
    return speeds.length === 0 || Math.min(...speeds) < WIFI_MIN_MBPS;
};

export const useNetworkSpeedCheck = () => {
    const rawNetInfo = useNetInfo();

    const [netInfo, setNetInfo] = useState<NetInfoState>(rawNetInfo);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (rawNetInfo && (!rawNetInfo.isConnected || rawNetInfo.isInternetReachable === false)) {
            timerRef.current = setTimeout(() => setNetInfo(rawNetInfo), OFFLINE_DEBOUNCE_MS);
        } else {
            setNetInfo(rawNetInfo);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [rawNetInfo]);

    const [isConnected, setIsConnected] = useState(Boolean(netInfo.isConnected && netInfo.isInternetReachable));
    useEffect(() => {
        setIsConnected(Boolean(netInfo.isConnected && netInfo.isInternetReachable));
    }, [netInfo.isConnected, netInfo.isInternetReachable]);

    const checkSpeed = () => {
        if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
            return { slow: true, reason: 'offline', netInfo };
        }

        if (
            netInfo.type === 'cellular' &&
            netInfo.details?.cellularGeneration &&
            SLOW_CELLULAR_GENS.includes(
                netInfo.details.cellularGeneration.toLowerCase() as (typeof SLOW_CELLULAR_GENS)[number],
            )
        ) {
            return {
                slow: true,
                reason: `cellular-${netInfo.details.cellularGeneration}`,
                netInfo,
            };
        }

        if (netInfo.details?.isConnectionExpensive) {
            return { slow: true, reason: 'expensive-connection', netInfo };
        }

        if (isVerySlowWifi(netInfo)) {
            return { slow: true, reason: 'slow-wifi', netInfo };
        }

        return { slow: false, reason: 'ok', netInfo };
    };

    return { checkSpeed, isConnected };
};

// Example usage elsewhere in your app:
// const { checkSpeed, isConnected } = useNetworkSpeedCheck();
// useEffect(() => {
//   if (isConnected) {
//     console.log("We're back online!");
//   } else {
//     console.log('Offline or too slow — queuing requests.');
//   }
// }, [isConnected]);
