/* eslint-disable functional/immutable-data */
import {
    FRFSServiceTierType_fRFSServiceTierType,
    MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';
import { nearbyDriverRes } from '@/typescript/state/server/nearbyDriversApi.ts';
import { publicTransportInfo } from '@/readOnly/api/types/PublicTransportInfo.gen';
import { markerData, NativeProcessedMarkers } from '../Maps/MapType';
import { computeHeading } from './common';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import React from 'react';

const POS_EPS_DEG = 0.00001; // ~1 m latitude

export type BusCluster = {
    lat: number;
    lon: number;
    count: number;
    vehicles: publicTransportInfo[];
    serviceType: FRFSServiceTierType_fRFSServiceTierType | undefined;
};

export const navigateToBusTracking = (
    navigation: NativeStackNavigationProp<MainNavigationParamList>,
    routeCode: string,
) => {
    navigation.navigate(
        'busTracking',
        {
            routeCode: routeCode,
            vehicleType: 'BUS',
            fromJourneyInfoScreen: false,
            fromSingleModeSearch: true,
            sourceStop: undefined,
            destinationStop: undefined,
            onBusRouteSwitch: undefined,
            journeyId: undefined,
            legOrder: undefined,
        },
        { pop: true },
    );
};

export const handleBusPress = (navigation: NativeStackNavigationProp<MainNavigationParamList>, routeCode: string) => {
    return () => navigateToBusTracking(navigation, routeCode);
};

export const getGridSize = (zoom: number) => {
    if (zoom >= 16) return 0.001;
    if (zoom >= 14) return 0.005;
    if (zoom >= 12) return 0.01;
    return 0.02;
};

export const getClusterKey = (lat: number, lon: number, gridSize: number) => {
    const latKey = Math.floor(lat / gridSize);
    const lonKey = Math.floor(lon / gridSize);
    return `${latKey},${lonKey}`;
};

export const getServiceTierTypeImgKey = (serviceTierType: FRFSServiceTierType_fRFSServiceTierType | undefined) => {
    switch (serviceTierType) {
        case 'ORDINARY':
            return 'bus';
        case 'EXPRESS':
            return 'express_bus';
        case 'AC':
            return 'ac_bus';
        case 'EXECUTIVE':
            return 'deluxe_bus';
        default:
            return 'bus';
    }
};

export const buildcluster = (
    nearbyDrivers: nearbyDriverRes,
    isClusteringEnabled: boolean,
    gridSize: number,
): Map<string, BusCluster> => {
    const clusters = new Map<string, BusCluster>();

    nearbyDrivers.vehicleDataBuckets?.forEach(bucket => {
        if (bucket.vehicleInfo.tag === 'PublicTransport') {
            const serviceTierType = bucket.vehicleInfo.contents.serviceType;
            bucket.vehicleInfo.contents.vehicles.forEach((vehicle: publicTransportInfo) => {
                if (!vehicle.vehicleNumber) return;

                if (isClusteringEnabled) {
                    const key = getClusterKey(vehicle.currentLocation.lat, vehicle.currentLocation.lon, gridSize);
                    const cluster = clusters.get(key);
                    if (cluster) {
                        cluster.count++;
                        cluster.lat = (cluster.lat * (cluster.count - 1) + vehicle.currentLocation.lat) / cluster.count;
                        cluster.lon = (cluster.lon * (cluster.count - 1) + vehicle.currentLocation.lon) / cluster.count;
                        cluster.vehicles.push(vehicle);
                    } else {
                        clusters.set(key, {
                            lat: vehicle.currentLocation.lat,
                            lon: vehicle.currentLocation.lon,
                            count: 1,
                            vehicles: [vehicle],
                            serviceType: undefined,
                        });
                    }
                } else {
                    const key = vehicle.vehicleNumber;
                    clusters.set(key, {
                        lat: vehicle.currentLocation.lat,
                        lon: vehicle.currentLocation.lon,
                        count: 1,
                        vehicles: [vehicle],
                        serviceType: serviceTierType,
                    });
                }
            });
        }
    });

    return clusters;
};

export const buildAndroidClusterMarkers = (
    clusters: Map<string, BusCluster>,
    travelMode: MultimodalTravelMode_multimodalTravelMode,
): NativeProcessedMarkers[] => {
    const processedMarkers: NativeProcessedMarkers[] = [];
    clusters.forEach((cluster, key) => {
        if (cluster.count > 1) {
            processedMarkers.push({
                id: `cluster-${key}`,
                latitude: cluster.lat,
                longitude: cluster.lon,
                rotation: 90,
                zIndex: 200,
                vehicleVariant: travelMode.toLowerCase(),
                clusterCount: cluster.count,
                isCluster: true,
                animationDuration: 0,
                shouldAnimate: false,
                size: 30,
                title: '',
                rotationEnabled: false,
                routeCode: undefined,
                action: undefined,
            });
        } else {
            const vehicle = cluster.vehicles[0];
            if (vehicle?.vehicleNumber) {
                processedMarkers.push({
                    id: vehicle.vehicleNumber,
                    latitude: vehicle.currentLocation.lat,
                    longitude: vehicle.currentLocation.lon,
                    rotation: vehicle.bearing,
                    zIndex: 100,
                    vehicleVariant: getServiceTierTypeImgKey(cluster.serviceType),
                    clusterCount: 0,
                    isCluster: false,
                    animationDuration: 5000,
                    shouldAnimate: true,
                    size: 30,
                    title: vehicle.shortName || vehicle.vehicleNumber,
                    rotationEnabled: true,
                    routeCode: vehicle.routeCode,
                    action: travelMode == 'Bus' ? 'navigateToBusTracking' : undefined,
                });
            }
        }
    });

    return processedMarkers;
};

export const updateClusterMarkers = (
    currentMarkers: Map<string, markerData>,
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    clusters: Map<string, BusCluster>,
    navigation: NativeStackNavigationProp<MainNavigationParamList>,
    moveMarker: (params: {
        setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
        markerId: string;
        newPosition: { latitude: number; longitude: number };
        animation: boolean;
        animationDuration: number | undefined;
        rotation: number | undefined;
        rotationDuration: number | undefined;
    }) => void,
) => {
    console.info('updating ios');

    const prev = currentMarkers;
    const seen = new Set<string>();
    const markersToAdd: markerData[] = [];
    const markersToUpdate: Array<{ id: string; data: markerData }> = [];
    const idsToRemove: string[] = [];
    /* eslint-disable functional/immutable-data */
    clusters.forEach((cluster, key) => {
        const isCluster = cluster.count > 1;
        if (isCluster) {
            const id = `cluster-${key}`;
            seen.add(id);
            const existing = prev.get(id);

            if (existing) {
                if (existing.description !== cluster.count.toString()) {
                    markersToUpdate.push({
                        id,
                        data: {
                            ...existing,
                            description: cluster.count.toString(),
                        },
                    });
                }
            } else {
                markersToAdd.push({
                    id,
                    markerKey: id,
                    coordinate: { latitude: cluster.lat, longitude: cluster.lon },
                    zIndex: 200,
                    anchor: { x: 0.5, y: 0.5 },
                    rotation: 0,
                    rotationEnabled: true,
                    visible: true,
                    title: '',
                    description: cluster.count.toString(),
                    children: null,
                    style: {},
                    pinIconType: 'nearBy',
                    vehicleVariant: undefined,
                    multimodalVariant: 'ClusterBus',
                    onClick: undefined,
                    showEditIcon: false,
                    ref: undefined,
                    calloutText: undefined,
                    calloutOnPress: undefined,
                    markerOnPress: undefined,
                    showCallout: false,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                });
            }
        } else {
            const vehicle = cluster.vehicles[0];
            if (!vehicle?.vehicleNumber) return;
            const id = vehicle.vehicleNumber;
            seen.add(id);
            const lat = vehicle.currentLocation.lat;
            const lon = vehicle.currentLocation.lon;
            const rot = vehicle.bearing ?? 0;

            const existing = prev.get(id);

            if (existing && existing.ref && existing.pinIconType === 'nearBy' && existing.multimodalVariant === 'Bus') {
                const hasPositionChanged =
                    Math.abs(existing.coordinate.latitude - lat) > POS_EPS_DEG ||
                    Math.abs(existing.coordinate.longitude - lon) > POS_EPS_DEG;

                if (hasPositionChanged) {
                    const calculatedRotation = computeHeading(
                        { latitude: existing.coordinate.latitude, longitude: existing.coordinate.longitude },
                        { latitude: lat, longitude: lon },
                    );
                    moveMarker({
                        setMarkers,
                        markerId: id,
                        newPosition: { latitude: lat, longitude: lon },
                        animation: true,
                        animationDuration: 2000,
                        rotation: calculatedRotation,
                        rotationDuration: 50,
                    });
                }
            } else {
                const onClick = handleBusPress(navigation, vehicle.routeCode);
                markersToAdd.push({
                    id,
                    markerKey: id,
                    coordinate: { latitude: lat, longitude: lon },
                    zIndex: 100,
                    anchor: { x: 0.5, y: 0.5 },
                    rotation: rot,
                    rotationEnabled: true,
                    visible: true,
                    title: vehicle.shortName || '',
                    description: cluster.serviceType || '',
                    children: null,
                    style: {},
                    pinIconType: 'nearBy',
                    vehicleVariant: undefined,
                    multimodalVariant: 'Bus',
                    onClick: onClick,
                    showEditIcon: false,
                    ref: undefined,
                    calloutText: undefined,
                    calloutOnPress: undefined,
                    markerOnPress: undefined,
                    showCallout: false,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                });
            }
        }
    });

    prev.forEach(m => {
        if (
            m.pinIconType === 'nearBy' &&
            (m.multimodalVariant === 'Bus' || m.multimodalVariant === 'ClusterBus') &&
            !seen.has(m.markerKey)
        ) {
            idsToRemove.push(m.markerKey);
        }
    });

    if (idsToRemove.length > 0) {
        setMarkers(curr => {
            const next = new Map(curr);
            idsToRemove.forEach(id => next.delete(id));
            return next;
        });
    }

    if (markersToUpdate.length > 0) {
        setMarkers(curr => {
            const next = new Map(curr);
            markersToUpdate.forEach(u => {
                if (next.has(u.id)) {
                    next.set(u.id, u.data);
                }
            });
            return next;
        });
    }

    if (markersToAdd.length > 0) {
        setMarkers(curr => {
            const next = new Map(curr);
            markersToAdd.forEach(m => next.set(m.id, m));
            return next;
        });
    }
};
