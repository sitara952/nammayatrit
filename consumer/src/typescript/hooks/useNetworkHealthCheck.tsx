import { useEffect, useRef } from 'react';
import colors from '../designSystem/colorPalette';
import { useNetInfo, refresh } from '@react-native-community/netinfo';
import { useConfigContext } from '../context/ConfigContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { useSnackbar } from '../../../../consumer/src-v2/primitives/Snackbar';
import { colors as DefaultColors } from 'config-types/src/domain/default/themes/colors';
import { useNetworkCheck } from './useNetworkCheck';
export const useNetworkHealthCheck = () => {
    const { isConnected } = useNetInfo();
    const { syncPendingRequests } = useOfflineSync();
    const { show } = useSnackbar();
    const { slowInternet } = useNetworkCheck(isConnected);

    const count = useRef(0);
    const wasDisconnected = useRef(false);
    const wasSlow = useRef(false);
    const intervalsId = useRef<NodeJS.Timeout | null>(null);
    const refreshing = useRef(false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const onBackOnline = () => {
        syncPendingRequests();
        if (wasDisconnected.current) {
            show({
                message: userLanguageStrings.BackOnline,
                backgroundColor: colors?.primitive?.green?.[1],
                duration: 1000,
                persist: false,
                action: undefined,
                actionTextColor: DefaultColors.white,
                headingTextColor: DefaultColors.white,
            });
            count.current = 0;
            refreshing.current = false;
            wasDisconnected.current = false;
        } else if (wasSlow.current) {
            show({
                message: 'Connection Established',
                backgroundColor: colors?.primitive?.green?.[1],
                duration: 1000,
                persist: false,
                action: undefined,
                actionTextColor: DefaultColors.white,
                headingTextColor: DefaultColors.white,
            });
            wasSlow.current = false;
        }
    };

    const showRefreshing = () => {
        show({
            message: userLanguageStrings.refreshing,
            backgroundColor: colors?.primitive?.gray?.[7],
            duration: 3000,
            persist: true,
            action: undefined,
            actionTextColor: DefaultColors.white,
            headingTextColor: DefaultColors.white,
        });
    };

    const showDissconnected = () => {
        wasDisconnected.current = true;
        count.current = 0;
        show({
            message: userLanguageStrings.NoInternetConnection,
            backgroundColor: colors?.recovered?.yellowMid,
            duration: undefined,
            persist: true,
            action: {
                label: userLanguageStrings.Refresh,
                onPress: () => {
                    refreshing.current = true;
                    runFunctionNTimesAndFinallyRun(refresh, 5, 800, showDissconnected);
                    showRefreshing();
                },
            },
            actionTextColor: DefaultColors.black,
            headingTextColor: DefaultColors.black,
        });
    };

    const runFunctionNTimesAndFinallyRun = (
        func: () => void,
        n: number,
        intervalMs: number,
        finallyDoIt: () => void,
    ) => {
        intervalsId.current = setInterval(() => {
            func();
            count.current = count.current + 1;
            if (count.current === n) {
                intervalsId.current && clearInterval(intervalsId.current);
                if (!isConnected) {
                    finallyDoIt();
                }
            }
        }, intervalMs);
    };

    const handleSlowNetwork = () => {
        show({
            message: 'Having trouble connecting, Retrying...',
            backgroundColor: colors?.recovered?.yellowMid,
            duration: undefined,
            persist: true,
            action: undefined,
            actionTextColor: DefaultColors.black,
            headingTextColor: DefaultColors.black,
        });
    };
    useEffect(() => {
        if (isConnected) {
            intervalsId.current && clearInterval(intervalsId.current);
            if (slowInternet) {
                wasSlow.current = true;
                if (wasDisconnected.current) {
                    count.current = 0;
                    refreshing.current = false;
                    wasDisconnected.current = false;
                }
                handleSlowNetwork();
                return;
            }
            onBackOnline();
        } else if (isConnected === false) {
            runFunctionNTimesAndFinallyRun(refresh, 5, 800, showDissconnected);
        }
        return () => {
            intervalsId.current && clearInterval(intervalsId.current);
        };
    }, [isConnected, slowInternet]);
};
