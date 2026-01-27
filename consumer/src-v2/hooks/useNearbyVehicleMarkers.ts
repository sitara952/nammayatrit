import { useContext, useEffect, useMemo, useRef, useCallback } from 'react';
import { shallowEqual } from 'react-redux';
import { throttle } from 'lodash';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNearbyDrivers } from '@/typescript/state/client/maps';
import {
    selectAppConfig,
    selectCurrentLocationCoords,
    selectNearbyDriversConfig,
    BottomSheetStage,
} from '@/typescript/state/client/session';
import { MapContext } from '@/typescript/Maps/MapContext';
import { createBucketSignature, filterNearbyDrivers, filterNearbyPublicTransport } from '@/src-v2/utils/nearby';
import type { nearbyDriverRes, nearbyDriverReq } from '@/typescript/state/server/nearbyDriversApi';
import type { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { usePolling, Result } from '@/typescript/hooks/usePolling';
import { useGetNearbyDriversMutation } from '@/typescript/state/server/nearbyDriversApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { navigationRef } from '@/typescript/navigation/RootNavigation';
import { useLocationServices } from '@/typescript/hooks/useLocationServices';
import { LatLng } from 'react-native-maps';

interface UseNearbyVehicleMarkersOptions {
    bottomSheetStage: BottomSheetStage;
    enabled: boolean;
    travelMode: MultimodalTravelMode_multimodalTravelMode;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    startTracking: boolean;
}

type NearbyDriversParams = {
    body: nearbyDriverReq;
    skipCache: boolean;
};

export const useNearbyVehicleMarkers = (options: UseNearbyVehicleMarkersOptions) => {
    const { bottomSheetStage, enabled, travelMode, navigation, startTracking = false } = options;

    const lastFilterTime = useRef(0);
    const { mapRef } = useContext(MapContext);

    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const nearbyDriversConfig = useAppSelector(selectNearbyDriversConfig);
    const mapId = mapRef.current?.mapId ?? 'MapBeforeRide';
    const nearbyDrivers = useAppSelector(state => selectNearbyDrivers(state, mapId), shallowEqual);
    const currentScreenName = navigationRef.getCurrentRoute()?.name;
    const shouldFetch = useRef(true);
    const appConfig = useAppSelector(selectAppConfig);
    // const { setAutoClearTimeout } = useAutoClearTimeout();

    const [getNearbyDriversMutation] = useGetNearbyDriversMutation();
    const isBusMode = travelMode === 'Bus';

    const callApiFn = useCallback(
        (params: NearbyDriversParams): Result<nearbyDriverRes> => {
            const mutationResult = getNearbyDriversMutation(params);
            return {
                unwrap: async (): Promise<nearbyDriverRes> => {
                    const result = await mutationResult.unwrap();
                    if (!result) {
                        throw new Error('No data returned from nearby drivers API');
                    }
                    return result;
                },
            };
        },
        [getNearbyDriversMutation],
    );

    const hasValidLocation =
        currentLocationCoords?.coords?.latitude !== undefined && currentLocationCoords?.coords?.longitude !== undefined;

    const pollingParams: NearbyDriversParams = useMemo(
        () => ({
            body: {
                location: {
                    lat: currentLocationCoords?.coords?.latitude ?? 0,
                    lon: currentLocationCoords?.coords?.longitude ?? 0,
                },
                radius: nearbyDriversConfig.radius ?? 500,
                travelMode: travelMode,
                vehicleVariants: undefined,
            },
            skipCache: isBusMode,
        }),
        [
            currentLocationCoords?.coords?.latitude,
            currentLocationCoords?.coords?.longitude,
            nearbyDriversConfig.radius,
            isBusMode,
        ],
    );

    const conditionToCall = useCallback(() => {
        return (
            hasValidLocation &&
            enabled &&
            bottomSheetStage === BottomSheetStage.Home &&
            currentScreenName === 'homeTab_homeScreen' &&
            shouldFetch.current &&
            startTracking
        );
    }, [isBusMode, hasValidLocation, bottomSheetStage, currentScreenName, shouldFetch, startTracking, enabled]);

    const postApiCall = useCallback(
        async (_res: nearbyDriverRes) => {
            if (travelMode == 'Taxi') {
                shouldFetch.current = false;
            }
        },
        [travelMode],
    );

    const postApiCallError = useCallback(async (error: unknown) => {
        console.error('useNearbyVehicleMarkers - polling error:', error);
    }, []);

    usePolling<NearbyDriversParams, nearbyDriverRes, Result<nearbyDriverRes>>({
        callApiFn: callApiFn,
        params: pollingParams,
        pollingInterval: appConfig.flowConfig.nearByBusConfig.nearbyBusPollingInterval,
        conditionToCall: conditionToCall,
        postApiCall: postApiCall,
        postApiCallError: postApiCallError,
        forceRefetchDeps: [currentLocationCoords],
        cause: 'nearbyBusesPolling',
        enable: enabled && startTracking,
    });

    const nearbyDriversMemo = useMemo(
        () => nearbyDrivers.nearbyDrivers,
        [
            nearbyDrivers.nearbyDrivers?.buckets?.length,
            nearbyDrivers.nearbyDrivers?.buckets?.reduce((sum, bucket) => sum + bucket.driverInfo.length, 0),
            nearbyDrivers.nearbyDrivers?.vehicleDataBuckets?.length,
        ],
    );

    const maxBuses = appConfig.flowConfig.nearByBusConfig.maxNearbyBuses;

    const filteredNearbyDrivers = useMemo(() => {
        if (!nearbyDriversMemo) {
            return undefined;
        }

        if (travelMode != 'Taxi') {
            return filterNearbyPublicTransport(nearbyDriversMemo, maxBuses);
        }

        if (!nearbyDriversConfig.enabled || !nearbyDriversConfig.vehicleLimit) {
            return undefined;
        }

        const filterStartTime = performance.now();
        const result = filterNearbyDrivers(nearbyDriversMemo, nearbyDriversConfig);
        const filterTime = performance.now() - filterStartTime;
        lastFilterTime.current = filterTime;
        return result;
    }, [
        nearbyDriversMemo,
        travelMode,
        nearbyDriversConfig.enabled,
        nearbyDriversConfig.vehicleLimit,
        maxBuses,
        nearbyDriversConfig.autoCategorySplitPercent,
        nearbyDriversConfig.closeRangeDriversPercent,
    ]);

    const bucketSignature = useMemo(
        () => createBucketSignature(filteredNearbyDrivers?.buckets),
        [filteredNearbyDrivers?.buckets],
    );

    const updateMarkersThrottled = useRef(
        throttle((mapRefCurrent, drivers, forceUpdate: boolean, isBusMode: boolean) => {
            if (mapRefCurrent) {
                const hasBuckets = drivers?.buckets?.length > 0;
                const hasVehicleDataBuckets = drivers?.vehicleDataBuckets?.length > 0;

                if (hasBuckets || hasVehicleDataBuckets) {
                    if (isBusMode) {
                        mapRefCurrent.updateNearbyClusterMarkers(drivers, forceUpdate, false, navigation, travelMode);
                    } else {
                        mapRefCurrent.updateNearbyMarkers(drivers, undefined, forceUpdate);
                    }
                }
            }
        }, 4000),
    ).current;

    const { recenterLocation } = useLocationServices({ initialize: false });

    useEffect(() => {
        if (!startTracking) {
            updateMarkersThrottled.cancel();
            mapRef.current?.removeNearbyMarkers();
            mapRef?.current?.removeCircle({ circleId: 'nearbyBusesTracking' });
            recenterLocation();
        } else {
            mapRef.current?.animateCamera({
                lat: currentLocationCoords?.coords?.latitude,
                lon: currentLocationCoords?.coords?.longitude,
                zoom: 17,
                duration: 500,
            });
            const centerLocation: LatLng = {
                latitude: currentLocationCoords?.coords?.latitude ?? 0,
                longitude: currentLocationCoords?.coords?.longitude ?? 0,
            };
            if (centerLocation?.latitude && centerLocation?.longitude && travelMode != 'Taxi') {
                mapRef.current?.addCircle({
                    id: 'nearbyBusesTracking',
                    center: centerLocation,
                    radius: appConfig.flowConfig.nearByBusConfig.nearbyBusCircleRadius,
                    strokeColor: '#007BFF',
                    fillColor: 'rgba(0, 123, 255, 0.1)',
                    strokeWidth: 0.5,
                    visible: true,
                });
            }
        }
    }, [startTracking]);

    useEffect(() => {
        if (
            enabled &&
            bottomSheetStage === BottomSheetStage.Home &&
            currentLocationCoords?.coords?.latitude &&
            currentLocationCoords?.coords?.longitude
        ) {
            mapRef.current?.setCurrentLocationMarkerVisibility(true);
        }
    }, [enabled, bottomSheetStage, currentLocationCoords]);

    useEffect(() => {
        if (enabled && startTracking && filteredNearbyDrivers && bottomSheetStage === BottomSheetStage.Home) {
            const hasBuckets = filteredNearbyDrivers?.buckets?.length > 0;
            const hasVehicleDataBuckets = filteredNearbyDrivers?.vehicleDataBuckets?.length > 0;
            console.info(
                'useNearbyVehicleMarkers - hasBuckets:',
                hasBuckets,
                'hasVehicleDataBuckets:',
                hasVehicleDataBuckets,
            );
            if (hasBuckets || hasVehicleDataBuckets) {
                updateMarkersThrottled(
                    mapRef.current,
                    filteredNearbyDrivers,
                    travelMode === 'Bus',
                    travelMode === 'Bus',
                );
            }
        }
    }, [enabled, startTracking, bucketSignature, filteredNearbyDrivers, bottomSheetStage, travelMode]);

    useEffect(() => {
        return () => {
            mapRef.current?.removeNearbyMarkers();
        };
    }, []);

    return {
        filteredNearbyDrivers,
        nearbyDriversConfig,
        currentLocationCoords,
        bucketSignature,
    };
};
