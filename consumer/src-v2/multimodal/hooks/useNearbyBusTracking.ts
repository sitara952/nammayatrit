import { MapRef } from '@/typescript/Maps/MapComponent';
import { nearbyBus } from '@/readOnly/api/types/NearbyBus.gen';
import { useRef, useCallback, useEffect } from 'react';
import { LatLng } from 'react-native-maps';
import { markerData } from '@/typescript/Maps/MapType';
import { haversineDistance } from '@/helpers/utils/Utils.gen';

const POSITION_THRESHOLD = 0.00001;
const UPDATE_DEBOUNCE_DELAY = 500;

const isWithinSearchRadius = (busLocation: LatLng, currentLocation: LatLng | null, searchRadius: number): boolean => {
    if (!currentLocation) return false;

    const distance = haversineDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        busLocation.latitude,
        busLocation.longitude,
    );

    return distance <= searchRadius;
};

const hasBusPositionChanged = (existingBus: nearbyBus, newBus: nearbyBus): boolean => {
    return (
        Math.abs(existingBus.currentLocation.lat - newBus.currentLocation.lat) > POSITION_THRESHOLD ||
        Math.abs(existingBus.currentLocation.lon - newBus.currentLocation.lon) > POSITION_THRESHOLD
    );
};

export const useNearbyBusTracking = (mapRef: React.RefObject<MapRef | null>) => {
    const busesRef = useRef<Map<string, nearbyBus>>(new Map());
    const busMarkersIds = useRef<string[]>([]);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            mapRef.current?.removeAllMarkers();
        };
    }, []);

    const updateNearbyBusPositions = useCallback(
        (nearbyBusess: nearbyBus[], currentLocation: LatLng | null) => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            updateTimeoutRef.current = setTimeout(() => {
                const nearbyBuses = nearbyBusess.filter(bus => {
                    if (!bus.currentLocation || !bus.vehicleNumber) return false;
                    if (currentLocation === null) return true;

                    const busLocation: LatLng = {
                        latitude: bus.currentLocation.lat,
                        longitude: bus.currentLocation.lon,
                    };

                    return isWithinSearchRadius(busLocation, currentLocation, 1);
                });

                const existingBuses = new Map(busesRef.current);
                const updatedBuses = new Map<string, nearbyBus>();
                const newBusMarkers: markerData[] = [];
                const busesToRemove: string[] = [];

                nearbyBuses.forEach((bus, index) => {
                    if (!bus.vehicleNumber) return;

                    const markerId = `bus_${bus.vehicleNumber}`;
                    //eslint-disable-next-line functional/immutable-data
                    updatedBuses.set(bus.vehicleNumber, bus);

                    if (existingBuses.has(bus.vehicleNumber)) {
                        const existingBus = existingBuses.get(bus.vehicleNumber);
                        if (!existingBus) return;

                        if (hasBusPositionChanged(existingBus, bus)) {
                            const newPosition: LatLng = {
                                latitude: bus.currentLocation.lat,
                                longitude: bus.currentLocation.lon,
                            };

                            mapRef.current?.moveMarker({
                                markerId,
                                newPosition,
                                animation: true,
                                animationDuration: 3000,
                                rotation: 0,
                                rotationDuration: undefined,
                            });
                        }
                    } else {
                        busMarkersIds.current.push(markerId);
                        const newBusMarker: markerData = {
                            id: markerId,
                            coordinate: {
                                latitude: bus.currentLocation.lat,
                                longitude: bus.currentLocation.lon,
                            },
                            zIndex: index + 4,
                            anchor: { x: 0.5, y: 0.5 },
                            rotationEnabled: false,
                            rotation: 0,
                            children: null,
                            style: {},
                            title: '',
                            description: `${bus.shortName}`,
                            visible: true,
                            markerKey: markerId,
                            pinIconType: 'nearByBus',
                            multimodalVariant: bus.serviceType,
                            vehicleVariant: undefined,
                            showEditIcon: undefined,
                            onClick: undefined,
                            markerOnPress: undefined,
                            ref: undefined,
                            calloutText: undefined,
                            calloutOnPress: undefined,
                            showCallout: undefined,
                            displayCalloutOnPress: undefined,
                            busStopEtaCallout: undefined,
                            primaryEtaMinutes: undefined,
                            secondaryEtaMinutes: undefined,
                        };

                        //eslint-disable-next-line functional/immutable-data
                        newBusMarkers.push(newBusMarker);
                    }
                });

                existingBuses.forEach((_, busId) => {
                    if (!updatedBuses.has(busId)) {
                        //eslint-disable-next-line functional/immutable-data
                        busesToRemove.push(busId);
                    }
                });

                busesToRemove.forEach(busId => {
                    const markerId = `bus_${busId}`;
                    mapRef.current?.removeMarker(markerId);
                    busMarkersIds.current = busMarkersIds.current.filter(id => id !== markerId);
                });

                if (newBusMarkers.length > 0) {
                    mapRef.current?.addMarkersFromArray({
                        markersArray: newBusMarkers,
                        routeId: 'TrackingNearbyBus',
                        forceUpdate: undefined,
                    });
                }

                busesRef.current = updatedBuses;
            }, UPDATE_DEBOUNCE_DELAY);
        },
        [mapRef],
    );

    return {
        updateNearbyBusPositions,
    };
};
