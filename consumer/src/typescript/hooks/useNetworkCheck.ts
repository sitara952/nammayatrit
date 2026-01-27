import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { useLazyNetworkCheckQuery } from './networkCheckApi';
import { selectAppConfig, selectNetworkState, setNetworkState } from '../state/client/session';

export const useNetworkCheck = (isConnected: boolean | null) => {
    const [slowInternet, setSlowInternet] = useState(false);
    const latencyArray = useRef<number[]>([]);
    const [apiCall] = useLazyNetworkCheckQuery();
    const dispatch = useAppDispatch();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const networkState = useAppSelector(selectNetworkState);
    const appConfig = useAppSelector(selectAppConfig);

    const checkInternet = async () => {
        const start = Date.now();
        try {
            await apiCall().unwrap();
        } catch {
            console.error('network api timed-out');
        }
        const duration = Date.now() - start;
        latencyArray.current = [duration, ...latencyArray.current.slice(0, 10)];
        const avgDuration =
            latencyArray.current.reduce((a, b) => {
                return a + b;
            }) / latencyArray.current.length;
        const isSlow = avgDuration > 500;
        if (!isSlow && latencyArray.current.length > 5) {
            setSlowInternet(false);
            if (networkState === 'slow') dispatch(setNetworkState('okay'));
            latencyArray.current = [];
        } else if (isSlow) setSlowInternet(true);
    };

    useEffect(() => {
        if (!appConfig.uiConfig.slowInternetConfig.showSlowInternetSnackbar) return;
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (isConnected && (networkState === 'slow' || slowInternet)) {
            intervalRef.current = setInterval(() => checkInternet(), 2000);
        } else {
            setSlowInternet(false);
            latencyArray.current = [];
        }
        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [networkState, slowInternet, isConnected]);

    return { slowInternet };
};
