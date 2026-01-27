import { useRef, useState, useEffect } from 'react';
import { LatLng } from 'react-native-maps';
import { MapRef } from '@/typescript/Maps/MapComponent';
import { markerData } from '@/typescript/Maps/MapType';
import {
    findNearestPointOnRoute,
    calculateVehicleRotation,
    NearestPointResult,
} from '@/src-v2/helpers/location/utils/SnaptoWaypoint';

export interface StopData {
    id: string;
    name: string;
    coordinate: LatLng;
}

export interface VehicleData {
    id: string;
    coordinate: LatLng;
    rotation?: number;
    timestamp: number | undefined;
}

export interface VehicleRouteData {
    id: string;
    name: string;
    waypoints: LatLng[];
    stops: StopData[];
}

/**
 * Hook to handle vehicle tracking functionality
 * @param mapRef - Reference to the map component
 * @param routeId - Unique ID for the vehicle route
 * @param routeData - Data for the vehicle route including waypoints and stops
 * @param vehiclePinIconType - Icon type for vehicle pins
 */
export const useVehicleTracking = (
    mapRef: React.RefObject<MapRef | null>,
    routeId: string | undefined,
    routeData: VehicleRouteData,
    vehiclePinIconType: string | undefined,
    onVehicleClick: ((markerId: string) => void) | undefined,
) => {
    const [initialized, setInitialized] = useState(false);

    const [vehicles, setVehicles] = useState<Map<string, VehicleData>>(new Map());

    const polylineId = useRef(`${routeId}_polyline`);
    const stopsIds = useRef<string[]>([]);
    const vehicleMarkersIds = useRef<string[]>([]);

    const snappedVehicles = useRef<Record<string, NearestPointResult>>({});

    /**
     * Initialize the route, stops on the map
     */
    const initialize = () => {
        if (!mapRef.current || routeData.waypoints.length === 0 || initialized) return;

        // Create the route polyline
        if (routeData.waypoints.length > 1) {
            mapRef.current.addPolyline({
                id: polylineId.current,
                coordinates: routeData.waypoints,
                visible: true,
                strokeColor: '#FFAA00',
                strokeColors: undefined,
                strokeWidth: 6,
                extendPath: undefined,
                lineDashPattern: undefined,
            });
        }

        // Add stop markers
        const stopsMarkers = routeData.stops.map(stop => {
            const stopId = `${routeId}_stop_${stop.id}`;
            stopsIds.current.push(stopId);

            const marker: markerData = {
                id: stopId,
                coordinate: stop.coordinate,
                zIndex: 3,
                anchor: { x: 0.5, y: 0.5 },
                rotationEnabled: false,
                rotation: 0,
                children: null,
                style: {},
                title: '',
                description: '',
                visible: true,
                markerKey: stopId,
                pinIconType: 'stopDot',
                vehicleVariant: undefined,
                multimodalVariant: undefined,
                ref: undefined,
                onClick: undefined,
                calloutText: undefined,
                showEditIcon: false,
                calloutOnPress: undefined,
                markerOnPress: undefined,
                showCallout: undefined,
                displayCalloutOnPress: undefined,
                busStopEtaCallout: undefined,
                primaryEtaMinutes: undefined,
                secondaryEtaMinutes: undefined,
            };

            return marker;
        });

        if (stopsMarkers.length > 0) {
            mapRef.current?.addMarkersFromArray({
                markersArray: stopsMarkers,
                routeId,
                forceUpdate: undefined,
            });
        }

        setInitialized(true);
    };

    /**
     * Recenter the map on the route waypoints
     */
    const recenter = () => {
        if (!mapRef.current || !initialized) return;

        mapRef.current.addMapPadding({
            top: 70,
            bottom: 60,
            left: 0,
            right: 0,
        });

        if (routeData.waypoints.length > 1) {
            mapRef.current?.fitToCoordinates({
                coordinates: routeData.waypoints,
                duration: 600,
            });
        }
    };

    /**
     * Update vehicle positions on the map with animation
     * @param newVehiclesData - Array of updated vehicle data
     */
    const updateVehiclePositions = (newVehiclesData: VehicleData[]) => {
        if (!mapRef.current || !initialized) return;

        const existingVehicles = new Map(vehicles);
        const updatedVehicles = new Map<string, VehicleData>();
        const newBusMarkers: markerData[] = [];
        snappedVehicles.current = {};

        newVehiclesData.forEach(vehicle => {
            const markerId = `${routeId}_vehicle_${vehicle.id}`;
            // eslint-disable-next-line functional/immutable-data
            updatedVehicles.set(vehicle.id, vehicle);

            const snappedVehicle = findNearestPointOnRoute(vehicle.coordinate, routeData.waypoints);
            snappedVehicles.current[vehicle.id] = snappedVehicle;
            const rotation = vehicle.rotation || calculateVehicleRotation(snappedVehicle, routeData.waypoints);

            if (existingVehicles.has(vehicle.id)) {
                const existingVehicle = existingVehicles.get(vehicle.id);
                const shouldMoveMarker =
                    !existingVehicle?.timestamp || !vehicle.timestamp || vehicle.timestamp > existingVehicle?.timestamp;

                if (shouldMoveMarker) {
                    mapRef.current?.moveMarker({
                        markerId: markerId,
                        newPosition: vehicle.coordinate,
                        animation: true,
                        animationDuration: 1000,
                        rotation: rotation,
                        rotationDuration: undefined,
                    });
                }
            } else {
                vehicleMarkersIds.current.push(markerId);
                const newBusMarker: markerData = {
                    id: markerId,
                    coordinate: vehicle.coordinate,
                    zIndex: 4,
                    anchor: { x: 0.5, y: 0.5 },
                    rotationEnabled: false,
                    rotation: rotation,
                    children: null,
                    style: {},
                    title: '',
                    description: '',
                    visible: true,
                    markerKey: markerId,
                    pinIconType: 'multimodal',
                    multimodalVariant: vehiclePinIconType,
                    vehicleVariant: undefined,
                    showEditIcon: false,
                    onClick: undefined,
                    markerOnPress: onVehicleClick,
                    ref: undefined,
                    calloutText: undefined,
                    calloutOnPress: undefined,
                    showCallout: undefined,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                };
                // eslint-disable-next-line functional/immutable-data
                newBusMarkers.push(newBusMarker);
            }
        });

        existingVehicles.forEach((_, vehicleId) => {
            if (!updatedVehicles.has(vehicleId)) {
                const markerId = `${routeId}_vehicle_${vehicleId}`;
                mapRef.current?.removeMarker(markerId);
                vehicleMarkersIds.current = vehicleMarkersIds.current.filter(id => id !== markerId);
            }
        });

        if (newBusMarkers.length > 0) {
            mapRef.current?.addMarkersFromArray({
                markersArray: newBusMarkers,
                routeId,
                forceUpdate: undefined,
            });
        }

        setVehicles(updatedVehicles);
    };

    /**
     * Clean up all markers and polylines
     */
    const cleanup = () => {
        if (!mapRef.current) return;

        vehicleMarkersIds.current.forEach(markerId => {
            mapRef.current?.removeMarker(markerId);
        });

        stopsIds.current.forEach(stopId => {
            mapRef.current?.removeMarker(stopId);
        });

        mapRef.current.hidePolyline(polylineId.current);

        vehicleMarkersIds.current = [];
        stopsIds.current = [];
        setVehicles(new Map());
        setInitialized(false);
    };

    useEffect(() => {
        if (mapRef.current && initialized) {
            setTimeout(() => {
                recenter();
            }, 100);
        }
    }, [initialized]);

    useEffect(() => {
        if (mapRef.current) {
            initialize();
        }
    }, [mapRef.current, routeData.waypoints]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    return {
        initialized,
        updateVehiclePositions,
        cleanup,
        recenter,
        snappedVehicles,
    };
};
