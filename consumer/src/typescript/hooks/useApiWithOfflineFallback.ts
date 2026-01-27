import { useOfflineSync } from '../context/OfflineSyncContext';
import { OfflineSyncEndpoints } from '../types/OfflineSyncEndpoints';
import { useNetworkSpeedCheck } from './useNetworkSpeedCheck';

interface MutationConfig {
    [k: string]: unknown;
}

interface Params {
    endpoint: OfflineSyncEndpoints;
    mutationFn: (cfg: MutationConfig) => Promise<unknown>;
    mutationConfig: MutationConfig;
    onlyNoInternet: boolean | undefined;
}

export const useApiWithOfflineFallback = () => {
    const { storePendingRequest } = useOfflineSync();
    const { checkSpeed } = useNetworkSpeedCheck();

    const handleApiCallWithOfflineFallback = async ({
        endpoint,
        mutationFn,
        mutationConfig,
        onlyNoInternet,
    }: Params): Promise<boolean> => {
        const { slow, reason, netInfo } = checkSpeed();
        console.info('[OfflineFallback] netInfo snapshot:', JSON.stringify(netInfo, null, 2));
        console.info(
            `[OfflineFallback] network type: ${netInfo.type}, gen: ${
                netInfo.type === 'cellular' ? (netInfo.details?.cellularGeneration ?? '-') : '-'
            }, slow: ${slow}, reason: ${reason}`,
        );

        console.info(`[OfflineFallback] decision for "${endpoint}" → ${slow ? 'QUEUE' : 'TRY ONLINE'} (${reason})`);

        if (!slow || onlyNoInternet) {
            try {
                await mutationFn(mutationConfig);
                console.info(`[OfflineFallback] "${endpoint}" succeeded online`);
                return true;
            } catch (err) {
                console.warn(`[OfflineFallback] "${endpoint}" failed online – queuing for retry. Error:`, err);
            }
        }

        storePendingRequest({ endpoint, mutationConfig });
        console.info(`[OfflineFallback] "${endpoint}" stored for later sync`);
        return false;
    };

    return { handleApiCallWithOfflineFallback };
};
