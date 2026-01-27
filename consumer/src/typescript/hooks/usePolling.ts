import { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { useAppStateChange } from '@/typescript/hooks/useAppState';
export interface Result<C> {
    unwrap(): Promise<C>;
}

const enablePollingDebugLogs = false;

const pollingDebugLogs = (...args: (string | number | boolean | undefined)[]) => {
    if (enablePollingDebugLogs) {
        console.info('Polling Debug Logs', ...args);
    }
};

export function usePolling<A, B, C extends Result<B>>({
    callApiFn,
    params,
    pollingInterval,
    conditionToCall,
    postApiCall,
    postApiCallError,
    forceRefetchDeps = [],
    cause,
    enable = true,
}: {
    callApiFn: (params: A) => C;
    params: A;
    pollingInterval: number;
    conditionToCall: () => boolean;
    postApiCall: (res: B) => Promise<void>;

    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    postApiCallError: (error: any) => Promise<void> | undefined;
    forceRefetchDeps: Array<string | boolean | object | null | undefined> | undefined;
    cause: string | undefined;
    enable: boolean;
}) {
    pollingDebugLogs('Polling Interval', pollingInterval, 'Cause:', cause, 'Condition:', conditionToCall());
    const timeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activePollingId = useRef<number>(0);
    const exponentialFactor = useRef<number>(0);

    useEffect(() => {
        if (!enable) return;
        pollingDebugLogs('useEffect called', 'Condition:', conditionToCall(), 'Cause:', cause);
        const callInternalApi = () => {
            pollingDebugLogs('useEffect if condition', 'Cause:', cause);
            const id = ++activePollingId.current;
            callApi(id);
        };
        callInternalApi();
        return () => {
            pollingDebugLogs('useEffect returned', 'Cause:', cause);
            activePollingId.current++;
            if (timeOutRef.current) {
                clearTimeout(timeOutRef.current);
            }
        };
    }, [conditionToCall(), enable]);

    const doTimeOut = (id: number, exponentialFactor: number | undefined) => {
        if (conditionToCall() && id === activePollingId.current) {
            const delay = Math.pow(2, exponentialFactor ?? 0) * 1000;
            pollingDebugLogs('Do-TimeOut If with delay:', delay, 'Cause:', cause);
            timeOutRef.current = setTimeout(callApi, exponentialFactor !== undefined ? delay : pollingInterval, id);
        } else {
            pollingDebugLogs(
                'Do-TimeOut Else',
                'Cause:',
                cause,
                'id:',
                id,
                'activePollingId:',
                activePollingId.current,
            );
        }
    };

    const callApi = (id: number) => {
        pollingDebugLogs('Polling condition: Now Call API', 'Cause:', cause);
        callApiFn(params)
            .unwrap()
            .then(res => {
                if (exponentialFactor.current !== 0) {
                    exponentialFactor.current = 0;
                }
                postApiCall(res)
                    .then(() => {})
                    .catch(_ => {})
                    .finally(() => {
                        doTimeOut(id, undefined);
                    });
            })
            .catch(error => {
                pollingDebugLogs('Error while making API call', 'Cause:', cause, 'Error:', error);
                doTimeOut(id, ++exponentialFactor.current);
                postApiCallError?.(error);
            });
    };

    useAppStateChange({
        onActive: React.useCallback(() => {
            if (!enable) return;
            const id = ++activePollingId.current;
            pollingDebugLogs('Called the api again onActive', id, 'Cause:', cause);
            callApi(id);
        }, [...forceRefetchDeps, enable]),
        onBackground: () => {},
    });

    useFocusEffect(
        React.useCallback(() => {
            if (!enable) return;
            const id = ++activePollingId.current;
            callApi(id);
            return () => {
                if (timeOutRef.current) {
                    clearTimeout(timeOutRef.current);
                }
                activePollingId.current++;
            };
        }, [...forceRefetchDeps, enable]),
    );
}
