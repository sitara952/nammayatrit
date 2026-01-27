import { useNetInfo } from '@react-native-community/netinfo';
import { useMemo } from 'react';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean;
    shouldMakeApiCalls: boolean;
    isNetworkStateKnown: boolean;
}

export const useNetworkAware = (): NetworkStatus => {
    const { isConnected, isInternetReachable } = useNetInfo();

    const networkStatus = useMemo(() => {
        // Check if network state is still unknown (initial state)
        const isNetworkStateKnown = isConnected !== null;

        const connected = Boolean(isConnected);
        const reachable = isInternetReachable !== false; // null means unknown, treat as true

        // Only determine shouldMakeApiCalls if network state is known
        // If unknown, default to true to avoid premature offline mode
        const shouldMakeApiCalls = isNetworkStateKnown ? connected && reachable : true;

        return {
            isConnected: connected,
            isInternetReachable: reachable,
            shouldMakeApiCalls,
            isNetworkStateKnown,
        };
    }, [isConnected, isInternetReachable]);

    return networkStatus;
};
