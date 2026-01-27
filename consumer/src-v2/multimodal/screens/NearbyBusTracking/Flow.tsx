import React, { useEffect, useContext, useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { MapContext } from '@/typescript/Maps/MapContext';
import { useNearbyBusTracking } from '../../hooks/useNearbyBusTracking';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentRegion } from '@/typescript/state/client/maps';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';
import { LatLng } from 'react-native-maps';
import { NearbyBusTrackingUI } from './UI';
import { PlatformType_platformType } from '@/readOnly/api/types/Enums.gen';
import {
    nearbyBusBookingPostWithParams,
    useNearbyBusBookingPostMutation,
} from '@/api/integrations/rtk/NearbyBusBookingPost';
import { usePolling } from '@/typescript/hooks/usePolling';
import { nearbyBusesResponse } from '@/readOnly/api/types/NearbyBusesResponse.gen';

export const NearbyBusTrackingFlow: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { mapRef } = useContext(MapContext);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const [searchRadius] = useState(1000);
    const [currentCenter, setCurrentCenter] = useState<LatLng | null>(null);
    const [canPoll, setcanPoll] = useState(false);

    const [getNearbyBuses] = useNearbyBusBookingPostMutation();
    const { updateNearbyBusPositions } = useNearbyBusTracking(mapRef);
    const reduxCurrentRegion = useAppSelector(state => {
        return selectCurrentRegion(state, mapRef.current?.mapId ?? null);
    });

    const fallbackLat = 13.008098;
    const fallbackLon = 80.213407;

    const platFormType: PlatformType_platformType = 'MULTIMODAL';
    const requestParams: nearbyBusBookingPostWithParams = useMemo(
        () => ({
            body: {
                platformType: platFormType,
                requireRecentRide: false,
                userLat: currentCenter?.latitude ?? currentLocationCoords?.coords.latitude ?? fallbackLat,
                userLon: currentCenter?.longitude ?? currentLocationCoords?.coords.longitude ?? fallbackLon,
                requireNearbyBuses: true,
                vehicleType: 'BUS',
            },
        }),
        [currentLocationCoords?.coords.latitude, currentLocationCoords?.coords.longitude, currentCenter],
    );

    const getInitialLocation = (): LatLng => {
        if (currentLocationCoords?.coords) {
            return {
                latitude: currentLocationCoords.coords.latitude,
                longitude: currentLocationCoords.coords.longitude,
            };
        }

        return {
            latitude: fallbackLat,
            longitude: fallbackLon,
        };
    };

    const handleNearbyBusesResponse = useCallback(
        async (result: nearbyBusesResponse) => {
            try {
                const buses = result?.nearbyBuses ?? [];
                updateNearbyBusPositions(buses, currentCenter);
            } catch (error) {
                console.error('Error processing nearby buses:', error);
            }
        },
        [updateNearbyBusPositions, currentCenter],
    );

    usePolling({
        callApiFn: getNearbyBuses,
        params: requestParams,
        pollingInterval: 3000,
        conditionToCall: () => {
            return (
                canPoll &&
                !!currentLocationCoords?.coords?.latitude &&
                !!currentLocationCoords?.coords?.longitude &&
                !!currentCenter
            );
        },
        postApiCall: handleNearbyBusesResponse,
        postApiCallError: async error => {
            console.error('Error fetching nearby buses:', error);
        },
        cause: 'Nearby Bus Tracking',
        forceRefetchDeps: [
            currentLocationCoords?.coords?.latitude?.toString(),
            currentLocationCoords?.coords?.longitude?.toString(),
            currentCenter?.latitude?.toString(),
            currentCenter?.longitude?.toString(),
        ],
        enable: true,
    });

    useEffect(() => {
        if (!mapRef.current || !reduxCurrentRegion.region) return;

        const center: LatLng = {
            latitude: reduxCurrentRegion.region.latitude,
            longitude: reduxCurrentRegion.region.longitude,
        };

        setCurrentCenter(center);

        mapRef.current?.addCircle({
            id: 'nearbyBusesSearch',
            center: center,
            radius: searchRadius,
            strokeColor: '#007BFF',
            fillColor: 'rgba(0, 123, 255, 0.1)',
            strokeWidth: 0.5,
            visible: true,
        });
    }, [reduxCurrentRegion.region, searchRadius]);

    useEffect(() => {
        setcanPoll(true);
        if (mapRef.current?.addStaticMapPadding) {
            mapRef.current.addStaticMapPadding({ top: 0, right: 0, bottom: 0, left: 0 });
        }
        setTimeout(() => {
            handleRecenter();
        }, 200);

        return () => {
            if (mapRef.current) {
                mapRef.current.removeCircle({ circleId: 'nearbyBusesSearch' });
            }
            setcanPoll(false);
        };
    }, []);

    const handleRecenter = () => {
        const location = getInitialLocation();
        if (mapRef.current) {
            mapRef.current.animateCamera({
                lat: location.latitude,
                lon: location.longitude,
                zoom: 15,
                duration: 500,
            });
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return <NearbyBusTrackingUI onBack={handleBack} />;
};

export default NearbyBusTrackingFlow;
