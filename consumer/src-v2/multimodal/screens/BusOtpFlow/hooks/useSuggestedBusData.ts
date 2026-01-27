import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    selectCurrentLocationCoords,
    selectNewFeatureFlags,
    selectOperatingCity,
    updateSuggestedBusDataCumulative,
} from '@/typescript/state/client/session';
import { useIdentifyNearByBusPostMutation } from '@/api/integrations/rtk/IdentifyNearByBusPost';
import { cityToCityEnum } from '@/typescript/utils/common';
import { usePolling } from '@/typescript/hooks/usePolling';
import { riderLocationResponse } from '@/readOnly/api/types/RiderLocationResponse.gen';
import { useCallback, useMemo, useEffect } from 'react';

export const useSuggestedBusData = (isFocused: boolean, shouldDoPolling: boolean = false) => {
    const dispatch = useAppDispatch();
    const currentLatLon = useAppSelector(selectCurrentLocationCoords);
    const city = useAppSelector(selectOperatingCity);
    const [identifyBusApiCall] = useIdentifyNearByBusPostMutation();
    const identifyBusPolling = useAppSelector(selectNewFeatureFlags).identifyBusPollingTime;

    const apiParam = useMemo(() => {
        return {
            body: {
                city: cityToCityEnum(city),
                riderLat: currentLatLon?.coords.latitude ?? 0,
                riderLon: currentLatLon?.coords.longitude ?? 0,
                locationAccuracy: currentLatLon?.coords.accuracy,
            },
        };
    }, [city, currentLatLon]);

    const postApiCall = useCallback(
        async (res: riderLocationResponse) => {
            dispatch(updateSuggestedBusDataCumulative(res.buses ?? []));
        },
        [dispatch],
    );

    const shouldPollApi = useCallback(() => {
        return isFocused && !!(currentLatLon?.coords.latitude && currentLatLon?.coords.latitude);
    }, [isFocused, currentLatLon]);

    usePolling({
        callApiFn: identifyBusApiCall,
        params: apiParam,
        pollingInterval: identifyBusPolling,
        conditionToCall: shouldPollApi,
        postApiCall: postApiCall,
        postApiCallError: () => undefined,
        cause: 'Journey Info Polling',
        forceRefetchDeps: [currentLatLon, city],
        enable: shouldDoPolling && shouldPollApi(),
    });

    useEffect(() => {
        if (!shouldDoPolling && shouldPollApi()) {
            identifyBusApiCall(apiParam)
                .unwrap()
                .then(postApiCall)
                .catch(() => undefined);
        }
    }, [shouldDoPolling]);
};
