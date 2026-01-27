import React, { useContext, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { MapContext } from '../Maps/MapContext';
import { MapRef } from '../Maps/MapComponent';
import { computeHeading, calculateStraightLineDistance } from '../utils/common';
import {
    TrackedEntity,
    UseLiveTrackingProps,
    PathConfig,
    StaticMarker,
    UseLiveTrackingReturn,
    TrackFromUserToConfig,
} from '../tracking/trackingTypes';
import { NativeModules, Platform } from 'react-native';
import { LatLng } from 'react-native-maps';
import { useTripRoutePostMutation } from '../../api/integrations/rtk/TripRoutePost';
import { getBestPossibleLocation } from '../utils/location';

// Interface for retained entities with timestamp information
interface RetainedEntity {
    entity: TrackedEntity;
    lastSeenAt: Date;
    isRetained: boolean;
}

const { MapUtils } = NativeModules;

const COORD_ON_PATH_THRESHOLD_IN_M = 50; // Snap if within 50 meters
const SMOOTH_ANIMATION_SEGMENT_DURATION = 300; // Duration per path segment in milliseconds
const MIN_MOVEMENT_THRESHOLD = 5; // Minimum movement in meters to trigger animation
const INTERPOLATION_POINTS = 3; // Number of intermediate points for smooth curves
// const POSITION_CHANGE_THRESHOLD = 0.00001; // ~1 meter threshold for position changes (unused for now)
const ROTATION_CHANGE_THRESHOLD = 5; // 5 degrees threshold for rotation changes
const RETAINED_ENTITY_TTL = 180000; // 3 minutes TTL for retained entities
const MIN_LOCATION_CHANGE_THRESHOLD = 15; // Minimum movement in meters to trigger route update
const FALLBACK_UPDATE_INTERVAL = 120000; // 2 minute fallback interval for periodic updates

/**
 * Feature flag to enable/disable smooth path animation
 *
 * When TRUE (default):
 * - Vehicles smoothly follow path segments through L-turns and curves
 * - More realistic movement but uses more resources
 * - Vehicles animate through intermediate waypoints
 *
 * When FALSE:
 * - Reverts to original direct movement behavior
 * - Vehicles jump directly between positions (faster)
 * - Lower resource usage, simpler animation
 */
const ENABLE_SMOOTH_PATH_ANIMATION = true;
import {
    createDummyVehicleData,
    dummyBusStops,
    dummyWaypoints,
    DUMMY_CONFIG,
    resetJourneyTracking,
} from '../tracking/simulation/busSimulation';
import { markerData } from '../Maps/MapType';

// Helper function to calculate distance between two points
const calculateDistance = (point1: LatLng, point2: LatLng): number => {
    return calculateStraightLineDistance(point1.latitude, point1.longitude, point2.latitude, point2.longitude);
};

// Entity fingerprinting for efficient change detection
interface EntityFingerprint {
    id: string;
    lat: number;
    lng: number;
    rotation?: number;
    pathId: string;
    timestamp: number;
}

// Create fingerprint for change detection
const createEntityFingerprint = (entity: TrackedEntity): EntityFingerprint => ({
    id: entity.id,
    lat: Math.round(entity.location.latitude * 100000) / 100000, // Round to ~1m precision
    lng: Math.round(entity.location.longitude * 100000) / 100000,
    rotation: entity.style.rotation
        ? Math.round(entity.style.rotation / ROTATION_CHANGE_THRESHOLD) * ROTATION_CHANGE_THRESHOLD
        : undefined,
    pathId: entity.pathId,
    timestamp: Date.now(),
});

// Compare entity fingerprints to detect meaningful changes
const hasEntityChanged = (prev: EntityFingerprint | undefined, current: EntityFingerprint): boolean => {
    if (!prev) return true;

    return (
        prev.lat !== current.lat ||
        prev.lng !== current.lng ||
        prev.rotation !== current.rotation ||
        prev.pathId !== current.pathId
    );
};

// Check if entity should be retained (exclude blur markers)
const shouldRetainEntity = (entity: TrackedEntity): boolean => {
    return !entity.style.blur;
};

// Clean up expired retained entities and remove their markers from map
const cleanupExpiredRetainedEntities = (
    retainedEntities: Map<string, RetainedEntity>,
    mapRef: React.RefObject<MapRef | null>,
    addedMarkersRef: React.MutableRefObject<Set<string>>,
): Map<string, RetainedEntity> => {
    const now = Date.now();
    const entries = Array.from(retainedEntities.entries());

    // Collect expired entity IDs using filter and map
    const expiredEntityIds = entries
        .filter(([_, retainedEntity]) => {
            const age = now - retainedEntity.lastSeenAt.getTime();
            return age >= RETAINED_ENTITY_TTL;
        })
        .map(([entityId]) => entityId);

    // Filter valid entries
    const validEntries = entries.filter(([_, retainedEntity]) => {
        const age = now - retainedEntity.lastSeenAt.getTime();
        return age < RETAINED_ENTITY_TTL;
    });

    // Remove expired markers from map
    expiredEntityIds.forEach(entityId => {
        mapRef.current?.removeMarker(entityId);
        addedMarkersRef.current.delete(entityId);
    });

    return new Map(validEntries);
};

// Helper function to interpolate between two points for smooth curves
const interpolatePoints = (start: LatLng, end: LatLng, numPoints: number = INTERPOLATION_POINTS): LatLng[] => {
    return Array.from({ length: numPoints }, (_, index) => {
        const ratio = (index + 1) / (numPoints + 1);
        const lat = start.latitude + (end.latitude - start.latitude) * ratio;
        const lng = start.longitude + (end.longitude - start.longitude) * ratio;
        return { latitude: lat, longitude: lng };
    });
};

// Helper function to check if movement is significant enough to animate
const isSignificantMovement = (prevLocation: LatLng, currentLocation: LatLng): boolean => {
    const distance = calculateDistance(prevLocation, currentLocation);
    return distance >= MIN_MOVEMENT_THRESHOLD;
};

// Enhanced function to create smooth path with interpolation for curves
const createSmoothPath = (path: PathConfig, fromIndex: number, toIndex: number, finalLocation: LatLng): LatLng[] => {
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);

    // Get base waypoints from path
    const baseWaypoints = Array.from(
        { length: endIndex - startIndex + 1 },
        (_, index) => path.coordinates[startIndex + index],
    ).filter((coordinate): coordinate is LatLng => coordinate !== undefined);

    // Replace last waypoint with final location
    const pathWaypoints = baseWaypoints.length > 0 ? [...baseWaypoints.slice(0, -1), finalLocation] : [finalLocation];

    // Add interpolation points for smoother curves
    return pathWaypoints.reduce<LatLng[]>((smoothWaypoints, waypoint, index) => {
        const newWaypoints = [...smoothWaypoints, waypoint];

        // Add interpolation points between waypoints (except for the last one)
        if (index < pathWaypoints.length - 1) {
            const nextWaypoint = pathWaypoints[index + 1];
            if (nextWaypoint) {
                const distance = calculateDistance(waypoint, nextWaypoint);
                // Only add interpolation for longer segments to avoid over-smoothing
                if (distance > 50) {
                    // 50 meters threshold
                    const interpolated = interpolatePoints(waypoint, nextWaypoint, 2);
                    return [...newWaypoints, ...interpolated];
                }
            }
        }

        return newWaypoints;
    }, []);
};

// Helper function to create straight line path between two points
const createStraightLinePath = (start: LatLng, end: LatLng): LatLng[] => {
    const distance = calculateStraightLineDistance(start.latitude, start.longitude, end.latitude, end.longitude);

    // Skip adding polyline if distance is more than 2000m
    if (distance > 2000) {
        return [];
    }

    return [start, end];
};

// Helper function to normalize trackFromUserTo config
const normalizeTrackFromUserToConfig = (trackFromUserTo: TrackFromUserToConfig): TrackFromUserToConfig => {
    // Check if it's the extended config by looking for additional properties
    if ('updateInterval' in trackFromUserTo || 'routingMode' in trackFromUserTo) {
        const config = trackFromUserTo;
        return {
            latitude: config.latitude,
            longitude: config.longitude,
            updateInterval: config.updateInterval ?? 5, // default 5 seconds
            routingMode: config.routingMode ?? 'api', // default to API mode
            enableUpdate: config.enableUpdate ?? true, // default to true
        };
    }

    // It's the simple format, convert to extended config with defaults
    return {
        latitude: trackFromUserTo.latitude,
        longitude: trackFromUserTo.longitude,
        updateInterval: 10, // default 5 seconds
        routingMode: 'api', // default to API mode
        enableUpdate: true, // default to true
    };
};

// Utility function to format timestamp as "time ago" string
const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return `Updated ${diffSeconds}s ago`;
    if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
    return `Updated ${diffHours}h ago`;
};

// Helper function to generate callout text for entities
const generateCalloutText = (entity: TrackedEntity, isRetained: boolean, lastSeenAt: Date): string => {
    if (isRetained) {
        const timeAgo = formatTimeAgo(lastSeenAt);
        return `${timeAgo}`;
    }
    return entity.captionText;
};

// Helper function to calculate smart rotation for vehicles
const calculateSmartRotation = (
    _entity: TrackedEntity,
    prevEntity: TrackedEntity | undefined,
    path: PathConfig,
    segmentIndex: number,
    snappedLocation: LatLng,
    initialSegmentIndex: number,
): number | undefined => {
    const isOffRoute = initialSegmentIndex === -1 && segmentIndex === 0;

    if (isOffRoute) {
        // For off-route vehicles, calculate rotation based on actual movement
        const prevLat = prevEntity?.location?.latitude;
        const prevLon = prevEntity?.location?.longitude;
        const currLat = snappedLocation.latitude;
        const currLon = snappedLocation.longitude;

        if (
            typeof prevLat === 'number' &&
            typeof prevLon === 'number' &&
            typeof currLat === 'number' &&
            typeof currLon === 'number' &&
            (prevLat !== currLat || prevLon !== currLon)
        ) {
            const movementRotation = computeHeading(
                { latitude: prevLat, longitude: prevLon },
                { latitude: currLat, longitude: currLon },
            );
            return movementRotation;
        } else {
            // No movement detected, return undefined to keep current rotation
            return undefined;
        }
    } else if (segmentIndex < path.coordinates.length - 1) {
        // For on-path vehicles, use path direction
        const currentPoint = path.coordinates[segmentIndex];
        const nextPoint = path.coordinates[segmentIndex + 1];
        if (currentPoint && nextPoint) {
            const pathRotation = computeHeading(currentPoint, nextPoint);
            return pathRotation;
        }
    }

    return undefined;
};

// Helper function to calculate segment index and snapped location
const calculateSegmentAndLocation = async (
    entity: TrackedEntity,
    path: PathConfig,
    initialSegmentIndex: number,
): Promise<{ segmentIndex: number; snappedLocation: LatLng }> => {
    if (initialSegmentIndex !== -1) {
        return { segmentIndex: initialSegmentIndex, snappedLocation: entity.location };
    }

    const snapResult = await MapUtils.getClosestPointOnPath(entity.location, path.coordinates);

    if (snapResult.distance <= COORD_ON_PATH_THRESHOLD_IN_M && snapResult.segmentIndex !== -1 && snapResult.location) {
        return { segmentIndex: snapResult.segmentIndex, snappedLocation: snapResult.location };
    } else {
        // Vehicle is off-route, use its actual location instead of returning
        return { segmentIndex: 0, snappedLocation: entity.location }; // Use first segment for polyline operations
    }
};

// Helper function to calculate rotation from movement
const calculateMovementRotation = (prevEntity: TrackedEntity | undefined, snappedLocation: LatLng): number | null => {
    if (!prevEntity?.location) {
        return null;
    }

    const prevLat = prevEntity.location.latitude;
    const prevLon = prevEntity.location.longitude;
    const currLat = snappedLocation.latitude;
    const currLon = snappedLocation.longitude;

    if (typeof prevLat === 'number' && typeof prevLon === 'number' && (prevLat !== currLat || prevLon !== currLon)) {
        return computeHeading({ latitude: prevLat, longitude: prevLon }, { latitude: currLat, longitude: currLon });
    }
    return null;
};

// Helper function to calculate rotation from path direction
const calculatePathRotation = (path: PathConfig, segmentIndex: number): number | null => {
    if (segmentIndex >= path.coordinates.length - 1) {
        return null;
    }

    const currentPoint = path.coordinates[segmentIndex];
    const nextPoint = path.coordinates[segmentIndex + 1];
    if (currentPoint && nextPoint) {
        return computeHeading(currentPoint, nextPoint);
    }
    return null;
};

// Helper function to calculate initial rotation for new entities
const calculateInitialRotation = (
    entity: TrackedEntity,
    prevEntity: TrackedEntity | undefined,
    path: PathConfig,
    segmentIndex: number,
    snappedLocation: LatLng,
    initialSegmentIndex: number,
): number => {
    const isOffRoute = initialSegmentIndex === -1 && segmentIndex === 0;

    if (isOffRoute) {
        // For off-route vehicles, try to use movement from previous position if available
        const movementRotation = calculateMovementRotation(prevEntity, snappedLocation);
        if (movementRotation !== null) {
            return movementRotation;
        }

        // Fallback: use nearest path segment direction
        const nearestSegment = Math.min(segmentIndex, path.coordinates.length - 2);
        const pathRotation = calculatePathRotation(path, nearestSegment);
        if (pathRotation !== null) {
            return pathRotation;
        }
    } else {
        // For on-path vehicles, use path direction
        const pathRotation = calculatePathRotation(path, segmentIndex);
        if (pathRotation !== null) {
            return pathRotation;
        }
    }

    return entity.style.rotation ?? 0;
};

// Batched update system for better performance (reserved for future use)
// const batchMarkerUpdates = (updates: Map<string, () => void>) => {
//     if (updates.size === 0) return;
//
//     requestAnimationFrame(() => {
//         updates.forEach((updateFn, entityId) => {
//             try {
//                 updateFn();
//             } catch (error) {
//                 console.warn(`Failed to update marker ${entityId}:`, error);
//             }
//         });
//         updates.clear();
//     });
// };

// Helper function to create marker configuration
const _createMarkerConfig = (
    entity: TrackedEntity,
    snappedLocation: LatLng,
    rotation: number | undefined,
    isRetained: boolean,
    lastSeenAt: Date,
) => ({
    id: entity.id,
    coordinate: snappedLocation,
    iconType: entity.style.iconType,
    anchor: entity.style.anchor ?? { x: 0.5, y: 0.5 },
    rotation: rotation ?? entity.style.rotation ?? 0,
    zIndex: 100,
    rotateEnabled: true,
    children: null,
    style: {},
    // title: generateCalloutText(entity, isRetained, lastSeenAt),
    title: isRetained && !entity.style.blur ? generateCalloutText(entity, isRetained, lastSeenAt) : undefined,
    onClick: undefined,
    showEditIcon: false,
    vehicleVariant: undefined,
    multimodalVariant: entity.style.multimodalVariant,
    markerOnPress: entity.onClick,
});

const createMarkerData = (
    entity: TrackedEntity,
    snappedLocation: LatLng,
    rotation: number | undefined,
    isRetained: boolean,
    lastSeenAt: Date,
): markerData => ({
    id: entity.id,
    coordinate: snappedLocation,
    children: null,
    zIndex: 100,
    anchor: entity.style.anchor ?? { x: 0.5, y: 0.5 },
    rotation: rotation ?? entity.style.rotation ?? 0,
    rotationEnabled: true,
    visible: true,
    title: isRetained && !entity.style.blur ? generateCalloutText(entity, isRetained, lastSeenAt) : entity.captionText,
    description: '',
    style: {},
    ref: undefined,
    markerKey: entity.id,
    pinIconType: entity.style.iconType,
    multimodalVariant: entity.style.multimodalVariant,
    showEditIcon: false,
    onClick: undefined,
    calloutText: undefined,
    calloutOnPress: undefined,
    vehicleVariant: undefined,
    markerOnPress: entity.onClick,
    showCallout: entity.showCallout,
    busStopEtaCallout: entity.busStopEtaCallout,
    displayCalloutOnPress: entity.displayCalloutOnPress,
    primaryEtaMinutes: entity.primaryEtaMinutes,
    secondaryEtaMinutes: entity.secondaryEtaMinutes,
});

// Helper function for enhanced smooth animation
const performEnhancedAnimation = async (
    entityId: string,
    smoothWaypoints: LatLng[],
    animationDuration: number,
    activeAnimationsRef: React.MutableRefObject<Set<string>>,
    mapRef: React.RefObject<MapRef | null>,
): Promise<void> => {
    if (!mapRef.current || activeAnimationsRef.current.has(entityId)) {
        return;
    }

    activeAnimationsRef.current.add(entityId);

    try {
        // Calculate dynamic duration based on total distance
        const totalDistance = smoothWaypoints.reduce((acc, waypoint, index) => {
            if (index === 0) return acc;
            const prevWaypoint = smoothWaypoints[index - 1];
            if (prevWaypoint) {
                return acc + calculateDistance(prevWaypoint, waypoint);
            }
            return acc;
        }, 0);

        const baseDuration = Math.min(animationDuration, Math.max(500, totalDistance * 10)); // 10ms per meter
        const segmentDuration = baseDuration / smoothWaypoints.length;

        // Animate through each smooth waypoint
        for (const [index, waypoint] of smoothWaypoints.slice(1).entries()) {
            if (!activeAnimationsRef.current.has(entityId)) {
                break; // Animation was cancelled
            }

            const prevWaypoint = smoothWaypoints[index];
            if (!prevWaypoint) continue;

            // Calculate rotation for this segment
            const rotation = computeHeading(prevWaypoint, waypoint);

            // Move marker to next waypoint
            await new Promise<void>(resolve => {
                mapRef.current?.moveMarker({
                    markerId: entityId,
                    newPosition: waypoint,
                    animation: true,
                    animationDuration: segmentDuration,
                    rotation: rotation,
                    rotationDuration: undefined,
                });

                setTimeout(resolve, segmentDuration);
            });
        }
    } catch (error) {
        console.error('Error in enhanced smooth animation:', error);
    } finally {
        activeAnimationsRef.current.delete(entityId);
    }
};

// Helper function to handle existing entity updates
const handleExistingEntityUpdate = async (params: {
    entity: TrackedEntity;
    prevEntity: TrackedEntity | undefined;
    path: PathConfig;
    segmentIndex: number;
    snappedLocation: LatLng;
    initialSegmentIndex: number;
    animationDuration: number;
    activeAnimationsRef: React.MutableRefObject<Set<string>>;
    addedMarkersRef: React.MutableRefObject<Set<string>>;
    mapRef: React.RefObject<MapRef | null>;
    animateAlongPath: (
        entityId: string,
        path: PathConfig,
        fromSegmentIndex: number,
        toSegmentIndex: number,
        finalLocation: LatLng,
    ) => Promise<void>;
}): Promise<markerData | undefined> => {
    const {
        entity,
        prevEntity,
        path,
        segmentIndex,
        snappedLocation,
        initialSegmentIndex,
        animationDuration,
        activeAnimationsRef,
        addedMarkersRef,
        mapRef,
        animateAlongPath,
    } = params;
    // Cancel any ongoing animation for this entity to prevent conflicts
    if (ENABLE_SMOOTH_PATH_ANIMATION && activeAnimationsRef.current.has(entity.id)) {
        activeAnimationsRef.current.delete(entity.id);
    }

    const prevSegmentIndex = prevEntity
        ? path.coordinates.findIndex(
              p => p.latitude === prevEntity.location.latitude && p.longitude === prevEntity.location.longitude,
          )
        : -1;

    // Check if movement is significant enough to animate and if both entities are on path
    const hasSignificantMovement = prevEntity ? isSignificantMovement(prevEntity.location, snappedLocation) : true;

    // NEW IMPROVED LOGIC: Use smooth path animation for ANY segment movement on path
    const shouldFollowPath =
        ENABLE_SMOOTH_PATH_ANIMATION &&
        prevSegmentIndex !== -1 &&
        segmentIndex !== -1 &&
        hasSignificantMovement &&
        (prevSegmentIndex !== segmentIndex || Math.abs(segmentIndex - prevSegmentIndex) >= 1);

    if (shouldFollowPath) {
        // Use enhanced smooth path animation with interpolation
        const smoothWaypoints = createSmoothPath(path, prevSegmentIndex, segmentIndex, snappedLocation);

        // Animate through smooth waypoints for better L-shaped road handling
        if (smoothWaypoints.length > 1) {
            // Use the enhanced animation with smooth waypoints
            performEnhancedAnimation(entity.id, smoothWaypoints, animationDuration, activeAnimationsRef, mapRef);
        } else {
            // Fallback to original path animation for single segment
            animateAlongPath(entity.id, path, prevSegmentIndex, segmentIndex, snappedLocation);
        }
    } else {
        return handleDirectMovement({
            entity,
            prevEntity,
            path,
            segmentIndex,
            snappedLocation,
            initialSegmentIndex,
            hasSignificantMovement,
            animationDuration,
            addedMarkersRef,
            mapRef,
        });
    }
    return undefined;
};

// Helper function to handle direct marker movement
const handleDirectMovement = (params: {
    entity: TrackedEntity;
    prevEntity: TrackedEntity | undefined;
    path: PathConfig;
    segmentIndex: number;
    snappedLocation: LatLng;
    initialSegmentIndex: number;
    hasSignificantMovement: boolean;
    animationDuration: number;
    addedMarkersRef: React.MutableRefObject<Set<string>>;
    mapRef: React.RefObject<MapRef | null>;
}): markerData | undefined => {
    const {
        entity,
        prevEntity,
        path,
        segmentIndex,
        snappedLocation,
        initialSegmentIndex,
        hasSignificantMovement,
        animationDuration,
        addedMarkersRef,
        mapRef,
    } = params;
    // Direct movement for off-path scenarios, insignificant movement, or when feature is disabled
    const smartRotation = calculateSmartRotation(
        entity,
        prevEntity,
        path,
        segmentIndex,
        snappedLocation,
        initialSegmentIndex,
    );

    // Ensure marker exists before trying to move it
    if (addedMarkersRef.current.has(entity.id)) {
        // Use shorter animation duration for direct movement to make it feel more responsive
        const directAnimationDuration = hasSignificantMovement
            ? Math.min(animationDuration / 2, 800)
            : animationDuration;

        mapRef.current?.moveMarker({
            markerId: entity.id,
            newPosition: snappedLocation,
            animation: true,
            animationDuration: directAnimationDuration,
            rotation: smartRotation,
            rotationDuration: undefined,
        });
    } else {
        // Marker doesn't exist, add it first
        console.warn(`Marker ${entity.id} not found, adding it first`);
        const markerData = createMarkerData(entity, snappedLocation, smartRotation, false, new Date());
        addedMarkersRef.current.add(entity.id);
        return markerData;
    }
    return undefined;
};

const useLiveTracking = ({
    paths: livePaths,
    trackedEntities: liveTrackedEntities,
    staticMarkers: liveStaticMarkers,
    animationDuration = 1800,
    trackFromUserTo,
    autoFocus,
    trackingType,
    performAutoFocusOnlyOnInit = false,
}: UseLiveTrackingProps): UseLiveTrackingReturn => {
    const [isAutoFocusPaused, setIsAutoFocusPaused] = useState(false);
    const [tripRoutePost] = useTripRoutePostMutation();
    const [userPath, setUserPath] = React.useState<PathConfig[] | null>(null);
    const [userLocationMarker, setUserLocationMarker] = React.useState<StaticMarker | null>(null);
    const [simulationIndex, setSimulationIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const userLocationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const previousUserLocationRef = useRef<LatLng | null>(null);
    const lastFullUpdateRef = useRef<number>(0);
    const [isMapReady, setIsMapReady] = useState(false);
    const retainedStaticMarkerIds = useRef<Set<string>>(new Set());
    const hasAutoFocusedRef = useRef<boolean>(false);

    // Simulation logic
    useEffect(() => {
        if (trackingType !== 'simulate-bus') {
            return;
        }

        resetJourneyTracking();

        intervalRef.current = setInterval(() => {
            setSimulationIndex(prevIndex => prevIndex + 1);
        }, DUMMY_CONFIG.ANIMATION_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [trackingType]);

    const simulatedData = useMemo(() => {
        if (trackingType !== 'simulate-bus') {
            return null;
        }

        const vehicleData = createDummyVehicleData(simulationIndex);
        const waypoints = dummyWaypoints.map(wp => ({ latitude: wp.lat, longitude: wp.lon }));

        const paths: PathConfig[] = [
            {
                id: 'simulated-route',
                coordinates: waypoints,
                style: {
                    strokeColor: '#FFAA00',
                    strokeWidth: 6,
                },
            },
        ];

        const staticMarkers: StaticMarker[] = dummyBusStops.map(stop => ({
            id: `stop_${stop.stopCode}`,
            location: { latitude: stop.lat, longitude: stop.lon },
            style: {
                iconType: 'multimodal' as const,
                multimodalVariant: 'BusStop',
            },
            title: stop.stopName,
            stopName: undefined,
            stopCode: undefined,
            showCallout: undefined,
            displayCalloutOnPress: undefined,
            busStopEtaCallout: undefined,
            primaryEtaMinutes: undefined,
            secondaryEtaMinutes: undefined,
        }));

        const trackedEntities: TrackedEntity[] = vehicleData.vehicleTrackingInfo.map(bus => ({
            id: `vehicle_${bus.vehicleId}`,
            pathId: 'simulated-route',
            captionText: 'Simulated Bus',
            location: {
                latitude: bus.vehicleInfo.latitude,
                longitude: bus.vehicleInfo.longitude,
            },
            style: {
                iconType: 'multimodal' as const,
                multimodalVariant: 'Bus',
                anchor: { x: 0.5, y: 0.5 },
                rotation: bus.vehicleInfo.rotation,
            },
            showCallout: undefined,
            displayCalloutOnPress: undefined,
            busStopEtaCallout: undefined,
            primaryEtaMinutes: undefined,
            secondaryEtaMinutes: undefined,
        }));

        return { paths, staticMarkers, trackedEntities };
    }, [trackingType, simulationIndex]);

    const paths = useMemo(() => {
        return trackingType === 'simulate-bus' ? simulatedData?.paths || [] : livePaths || [];
    }, [trackingType, simulatedData, livePaths]);

    const staticMarkers = useMemo(() => {
        return trackingType === 'simulate-bus' ? simulatedData?.staticMarkers || [] : liveStaticMarkers || [];
    }, [trackingType, simulatedData, liveStaticMarkers]);

    const trackedEntities = useMemo(() => {
        return trackingType === 'simulate-bus' ? simulatedData?.trackedEntities || [] : liveTrackedEntities || [];
    }, [trackingType, simulatedData, liveTrackedEntities]);

    const { mapRef } = useContext(MapContext);

    const previousEntitiesRef = useRef<Map<string, TrackedEntity>>(new Map());
    const addedMarkersRef = useRef<Set<string>>(new Set()); // Track which markers have been actually added
    const activeAnimationsRef = useRef<Set<string>>(new Set()); // Track ongoing animations to prevent conflicts
    const previousStaticMarkersRef = useRef<StaticMarker[]>([]);

    // Performance optimization refs
    const entityFingerprintsRef = useRef<Map<string, EntityFingerprint>>(new Map());
    const lastCleanupTimeRef = useRef<number>(0);

    // Retained entities for timestamp tracking
    const retainedEntitiesRef = useRef<Map<string, RetainedEntity>>(new Map());
    const timestampUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (mapRef.current) {
            setIsMapReady(true);
        }
    }, []);

    // Enhanced trackFromUserTo effect with periodic location updates and routing modes
    useEffect(() => {
        if (!trackFromUserTo) {
            // Clear any existing intervals and paths when trackFromUserTo is removed
            if (userLocationIntervalRef.current) {
                clearInterval(userLocationIntervalRef.current);
                userLocationIntervalRef.current = null;
            }
            setUserPath(null);
            setUserLocationMarker(null);
            return;
        }

        const config = normalizeTrackFromUserToConfig(trackFromUserTo);

        const updateUserLocationAndRoute = async (forceFullUpdate = false) => {
            try {
                const userLocation = await getBestPossibleLocation();
                const currentLocation: LatLng = {
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                };

                // Always update user location marker for visual freshness
                setUserLocationMarker({
                    id: 'user-location',
                    location: currentLocation,
                    style: {
                        iconType: 'you',
                    },
                    stopName: undefined,
                    stopCode: undefined,
                    showCallout: undefined,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                });

                // Check if we should update the route based on location change
                const shouldUpdateRoute = (() => {
                    // Force update if explicitly requested
                    if (forceFullUpdate) return true;

                    // Update on first run (no previous location)
                    if (!previousUserLocationRef.current) return true;

                    // Check if user has moved significantly
                    const distanceMoved = calculateDistance(previousUserLocationRef.current, currentLocation);
                    if (distanceMoved >= MIN_LOCATION_CHANGE_THRESHOLD) return true;

                    // Fallback: update periodically even if user hasn't moved much (for GPS drift)
                    const timeSinceLastUpdate = Date.now() - lastFullUpdateRef.current;
                    if (timeSinceLastUpdate >= FALLBACK_UPDATE_INTERVAL) return true;

                    return false;
                })();

                // Update previous location reference
                previousUserLocationRef.current = currentLocation;

                // Skip route update if user hasn't moved significantly
                if (!shouldUpdateRoute) {
                    return;
                }

                // Update timestamp for fallback tracking
                lastFullUpdateRef.current = Date.now();

                // eslint-disable-next-line functional/no-let
                let coordinates: LatLng[];

                if (config.routingMode === 'straight-line') {
                    // Create straight line path
                    coordinates = createStraightLinePath(currentLocation, {
                        latitude: config.latitude,
                        longitude: config.longitude,
                    });
                } else {
                    // Use API routing (default behavior)
                    const result = await tripRoutePost({
                        body: {
                            calcPoints: true,
                            mode: 'FOOT',
                            waypoints: [
                                { lat: currentLocation.latitude, lon: currentLocation.longitude },
                                { lat: config.latitude, lon: config.longitude },
                            ],
                        },
                    }).unwrap();

                    if (result?.length > 0) {
                        const route = result[0];
                        if (route?.points) {
                            coordinates = route.points.map((wp: { lat: number; lon: number }) => ({
                                latitude: wp.lat,
                                longitude: wp.lon,
                            }));
                        } else {
                            // Fallback to straight line if API doesn't return points
                            coordinates = createStraightLinePath(currentLocation, {
                                latitude: config.latitude,
                                longitude: config.longitude,
                            });
                        }
                    } else {
                        // Fallback to straight line if API call fails
                        coordinates = createStraightLinePath(currentLocation, {
                            latitude: config.latitude,
                            longitude: config.longitude,
                        });
                    }
                }

                // Create path polylines
                // const userPathSolid = {
                //     id: 'user-to-source-solid',
                //     coordinates,
                //     style: {
                //         strokeColor: '#5FB9FF',
                //         strokeWidth: 8,
                //     },
                // };
                const userPathDotted = {
                    id: 'user-to-source-dotted',
                    coordinates,
                    style: {
                        strokeColor: '#0080FF',
                        strokeWidth: 5,
                        lineDashPattern: Platform.OS === 'android' ? [1, 40] : [10, 10, 10, 10],
                    },
                };
                setUserPath([userPathDotted]);
            } catch (error) {
                console.error('Error updating user location and route:', error);

                // Fallback: create straight line path with last known user location
                if (userLocationMarker) {
                    const coordinates = createStraightLinePath(userLocationMarker.location, {
                        latitude: config.latitude,
                        longitude: config.longitude,
                    });

                    const userPathSolid = {
                        id: 'user-to-source-solid',
                        coordinates,
                        style: {
                            strokeColor: '#5FB9FF',
                            strokeWidth: 8,
                        },
                    };
                    const userPathDotted = {
                        id: 'user-to-source-dotted',
                        coordinates,
                        style: {
                            strokeColor: '#0080FF',
                            strokeWidth: 5,
                            lineDashPattern: [1, 30],
                        },
                    };
                    setUserPath([userPathSolid, userPathDotted]);
                }
            }
        };

        // Initial update
        updateUserLocationAndRoute();

        // Set up periodic updates with combined fallback logic
        if (config.enableUpdate) {
            userLocationIntervalRef.current = setInterval(
                () => {
                    // Check if it's time for a fallback update
                    const timeSinceLastFullUpdate = Date.now() - lastFullUpdateRef.current;
                    const shouldForceUpdate = timeSinceLastFullUpdate >= FALLBACK_UPDATE_INTERVAL;

                    updateUserLocationAndRoute(shouldForceUpdate);
                },
                (config.updateInterval ?? 5) * 1000,
            ); // Convert seconds to milliseconds
        }

        // Cleanup function
        return () => {
            if (userLocationIntervalRef.current) {
                clearInterval(userLocationIntervalRef.current);
                userLocationIntervalRef.current = null;
            }
        };
    }, [trackFromUserTo]);

    const allPaths = useMemo(() => {
        if (userPath) {
            return [...paths, ...userPath];
        }
        return paths;
    }, [paths, userPath]);

    const allStaticMarkers = useMemo(() => {
        if (userLocationMarker) {
            return [...staticMarkers, userLocationMarker];
        }
        return staticMarkers;
    }, [staticMarkers, userLocationMarker]);

    // Create stable references for hook dependencies with smart comparison
    const staticMarkersString = useMemo(() => {
        // Create a more efficient hash instead of full JSON.stringify
        return allStaticMarkers.map(m => `${m.id}-${m.location.latitude}-${m.location.longitude}`).join('|');
    }, [allStaticMarkers]);

    // Create stable references for hook dependencies with smart comparison
    const staticMarkersStringEta = useMemo(() => {
        return allStaticMarkers.map(m => `${m.primaryEtaMinutes}-${m.secondaryEtaMinutes}`).join('|');
    }, [allStaticMarkers]);

    const trackedEntitiesHash = useMemo(() => {
        // Create entity hash based on meaningful properties only
        return trackedEntities
            .map(
                e =>
                    `${e.id}-${Math.round(e.location.latitude * 100000)}-${Math.round(e.location.longitude * 100000)}-${e.pathId}`,
            )
            .sort((a, b) => a.localeCompare(b))
            .join('|');
    }, [trackedEntities]);

    const autoFocusString = useMemo(() => JSON.stringify(autoFocus), [autoFocus]);

    const allPathsHash = useMemo(() => {
        // Create path hash based on meaningful properties
        return allPaths.map(p => `${p.id}-${p.coordinates.length}-${p.style.strokeColor}`).join('|');
    }, [allPaths]);

    useEffect(() => {
        retainedEntitiesRef.current.clear();
        entityFingerprintsRef.current.clear();
    }, [allPathsHash]);

    useEffect(() => {
        timestampUpdateIntervalRef.current = setInterval(() => {
            if (!mapRef.current || !isMapReady) return;
            retainedEntitiesRef.current.forEach((retainedEntity, entityId) => {
                if (retainedEntity.isRetained && addedMarkersRef.current.has(entityId)) {
                    const newCalloutText = generateCalloutText(retainedEntity.entity, true, retainedEntity.lastSeenAt);
                    mapRef.current?.updateCalloutText(entityId, newCalloutText);
                }
            });
        }, 5000);

        return () => {
            if (timestampUpdateIntervalRef.current) {
                clearInterval(timestampUpdateIntervalRef.current);
                timestampUpdateIntervalRef.current = null;
            }
        };
    }, [isMapReady, allPaths]);

    // Function to animate vehicle along path segments for smooth movement
    // This function is only used when ENABLE_SMOOTH_PATH_ANIMATION is true
    const animateAlongPath = useCallback(
        async (
            entityId: string,
            path: PathConfig,
            fromSegmentIndex: number,
            toSegmentIndex: number,
            finalLocation: LatLng,
        ) => {
            if (!mapRef.current || activeAnimationsRef.current.has(entityId)) {
                return;
            }

            activeAnimationsRef.current.add(entityId);

            try {
                const startIndex = Math.min(fromSegmentIndex, toSegmentIndex);
                const endIndex = Math.max(fromSegmentIndex, toSegmentIndex);

                // Create array of intermediate waypoints along the path using immutable operations
                const intermediateWaypoints = Array.from(
                    { length: endIndex - startIndex + 1 },
                    (_, index) => path.coordinates[startIndex + index],
                ).filter((coordinate): coordinate is LatLng => coordinate !== undefined);

                // Ensure final location is included by creating a new array
                const finalWaypoints =
                    intermediateWaypoints.length > 0
                        ? [...intermediateWaypoints.slice(0, -1), finalLocation]
                        : [finalLocation];

                // Animate through each waypoint sequentially
                for (const waypoint of finalWaypoints.slice(1).map((wp, idx) => ({ waypoint: wp, index: idx + 1 }))) {
                    const { waypoint: currentWaypoint, index } = waypoint;
                    if (!activeAnimationsRef.current.has(entityId)) {
                        break; // Animation was cancelled
                    }

                    const prevWaypoint = finalWaypoints[index - 1];

                    // Ensure both waypoints exist before calculating rotation
                    if (!currentWaypoint || !prevWaypoint) {
                        continue;
                    }

                    // Calculate rotation for this segment
                    const rotation = computeHeading(prevWaypoint, currentWaypoint);

                    // Calculate duration based on distance (more realistic timing)
                    const segmentDuration = Math.min(
                        SMOOTH_ANIMATION_SEGMENT_DURATION,
                        animationDuration / finalWaypoints.length,
                    );

                    // Move marker to next waypoint
                    await new Promise<void>(resolve => {
                        mapRef.current?.moveMarker({
                            markerId: entityId,
                            newPosition: currentWaypoint,
                            animation: true,
                            animationDuration: segmentDuration,
                            rotation: rotation,
                            rotationDuration: undefined,
                        });

                        // Wait for animation to complete
                        setTimeout(resolve, segmentDuration);
                    });
                }
            } catch (error) {
                console.error('Error in animateAlongPath:', error);
            } finally {
                activeAnimationsRef.current.delete(entityId);
            }
        },
        [mapRef, animationDuration],
    );

    // Extract auto focus logic into a reusable function
    const performAutoFocus = useCallback(
        (forceUpdate = false) => {
            if (!isMapReady || !mapRef.current || !autoFocus) {
                return;
            }

            if (isAutoFocusPaused && !forceUpdate) {
                return;
            }
            if (performAutoFocusOnlyOnInit) {
                if (hasAutoFocusedRef.current && !forceUpdate) {
                    return;
                }
            }

            const baseFocusCoordinates: LatLng[] = [];
            const userCoordinates =
                trackFromUserTo && userLocationMarker ? [userLocationMarker.location, trackFromUserTo] : [];
            const autoFocusCoordinates = autoFocus?.coordinates || [];
            const entityCoordinates = autoFocus?.entityIds
                ? trackedEntities.filter(e => autoFocus.entityIds?.includes(e.id)).map(e => e.location)
                : [];
            const pathCoordinates = autoFocus?.pathIds
                ? allPaths.filter(p => autoFocus.pathIds?.includes(p.id)).flatMap(p => p.coordinates)
                : [];
            const focusCoordinates = [
                ...baseFocusCoordinates,
                ...userCoordinates,
                ...autoFocusCoordinates,
                ...entityCoordinates,
                ...pathCoordinates,
            ];
            if (focusCoordinates.length > 0) {
                setTimeout(() => {
                    mapRef.current?.addMapPadding({
                        top: 70,
                        bottom: 60,
                        left: 40,
                        right: 40,
                    });
                    mapRef.current?.fitToCoordinatesSerialized({ coordinates: focusCoordinates, duration: 1000 });
                    if (performAutoFocusOnlyOnInit) {
                        hasAutoFocusedRef.current = true;
                    }
                }, 200);
            }
        },
        [
            isMapReady,
            mapRef,
            autoFocus,
            isAutoFocusPaused,
            trackFromUserTo,
            userLocationMarker,
            trackedEntities,
            allPaths,
        ],
    );

    // Auto focus effect - triggers when tracked entities change or when initial focus is needed
    useEffect(() => {
        if (autoFocus && !isAutoFocusPaused && isMapReady) {
            // Check if there are any focusable coordinates available
            const hasStaticCoordinates = autoFocus.coordinates && autoFocus.coordinates.length > 0;
            const hasPathCoordinates = autoFocus.pathIds && autoFocus.pathIds.length > 0 && allPaths.length > 0;
            const hasTrackedEntities = trackedEntities.length > 0;
            const hasPathsWithCoordinates = allPaths.some(path => path.coordinates && path.coordinates.length > 0);
            const hasPaths = allPaths.length > 0;
            const hasPathIds = autoFocus.pathIds != undefined;
            const dataIsReady =
                hasStaticCoordinates &&
                hasTrackedEntities &&
                (hasPaths ? hasPathsWithCoordinates : true) &&
                (hasPathIds ? hasPathCoordinates : true);
            const shouldPerformAutoFocus = performAutoFocusOnlyOnInit
                ? !hasAutoFocusedRef.current && dataIsReady
                : dataIsReady;
            if (shouldPerformAutoFocus) {
                performAutoFocus(true);
            }
        }
    }, [
        autoFocusString,
        isAutoFocusPaused,
        isMapReady,
        trackedEntitiesHash,
        allPathsHash,
        trackFromUserTo,
        userLocationMarker,
    ]);

    // Effect for drawing static elements (runs only when paths/markers change and map is ready)
    useEffect(() => {
        if (!isMapReady || !mapRef.current) {
            return;
        }
        retainedStaticMarkerIds.current = new Set();
        const currentStaticMarkersIds = new Set(allStaticMarkers.map(v => v.id));
        const previousStaticMarkerIds = new Set(previousStaticMarkersRef.current.map(marker => marker.id));
        previousStaticMarkerIds.forEach(markerId => {
            if (!currentStaticMarkersIds.has(markerId)) mapRef.current?.removeMarker(markerId);
            else retainedStaticMarkerIds.current?.add(markerId);
        });

        // Add polylines
        allPaths.forEach(async path => {
            if (path.highlightUntil) {
                const snapResult = await MapUtils.getClosestPointOnPath(path.highlightUntil, path.coordinates);
                if (snapResult.segmentIndex !== -1) {
                    const highlightedCoords = path.coordinates.slice(0, snapResult.segmentIndex + 1);
                    const greyedOutCoords = path.coordinates.slice(snapResult.segmentIndex);

                    mapRef.current?.addPolyline({
                        id: path.id,
                        coordinates: highlightedCoords,
                        strokeColor: path.style.strokeColor ?? '#000000',
                        strokeWidth: path.style.strokeWidth ?? 3,
                        lineDashPattern: path.style.lineDashPattern,
                        visible: true,
                        strokeColors: undefined,
                        extendPath: undefined,
                    });
                    mapRef.current?.addPolyline({
                        id: `${path.id}-greyed`,
                        coordinates: greyedOutCoords,
                        strokeColor: '#AAA9A8',
                        strokeWidth: path.style.strokeWidth ?? 3,
                        lineDashPattern: path.style.lineDashPattern,
                        visible: true,
                        strokeColors: undefined,
                        extendPath: undefined,
                    });
                }
            } else {
                mapRef.current?.addPolyline({
                    id: path.id,
                    coordinates: path.coordinates,
                    strokeColor: path.style.strokeColor ?? '#000000',
                    strokeWidth: path.style.strokeWidth ?? 3,
                    lineDashPattern: path.style.lineDashPattern,
                    visible: true,
                    strokeColors: undefined,
                    extendPath: undefined,
                });
            }
        });

        // Add static markers without delay to avoid timing conflicts
        const newStaticMarkers: markerData[] = allStaticMarkers
            .filter(marker => !retainedStaticMarkerIds.current?.has(marker.id))
            .map((marker, index) => {
                return {
                    id: marker.id,
                    coordinate: marker.location,
                    title: marker.title ?? '',
                    anchor: marker.style.anchor ?? { x: 0.5, y: 0.5 },
                    rotation: marker.style.rotation ?? 0,
                    onClick: marker.onClick,
                    zIndex: marker.id === 'user-location' ? 100101 : index + 1,
                    rotationEnabled: false,
                    children: null,
                    showEditIcon: false,
                    style: {},
                    vehicleVariant: undefined,
                    multimodalVariant: marker.style.multimodalVariant,
                    markerOnPress: undefined,
                    visible: true,
                    description: '',
                    ref: undefined,
                    markerKey: marker.id,
                    pinIconType: marker.style.iconType,
                    calloutText: undefined,
                    calloutOnPress: undefined,
                    showCallout: marker.showCallout,
                    busStopEtaCallout: marker.busStopEtaCallout,
                    displayCalloutOnPress: marker.displayCalloutOnPress,
                    primaryEtaMinutes: marker.primaryEtaMinutes,
                    secondaryEtaMinutes: marker.secondaryEtaMinutes,
                };
            });
        if (newStaticMarkers.length !== 0)
            mapRef.current.addMarkersFromArray({
                markersArray: newStaticMarkers,
                routeId: undefined,
                forceUpdate: true,
            });
        previousStaticMarkersRef.current = allStaticMarkers;
    }, [allPathsHash, staticMarkersString, isMapReady]);

    // Effect for updating dynamic elements with reconciliation (runs only when entities change and map is ready)
    useEffect(() => {
        if (!isMapReady) {
            return;
        }

        if (!mapRef.current) {
            return;
        }

        const currentEntitiesMap = new Map(trackedEntities.map(e => [e.id, e]));
        const currentEntityIds = new Set(trackedEntities.map(e => e.id));

        // Only add non-blur entities to retained entities
        trackedEntities.forEach(entity => {
            if (shouldRetainEntity(entity)) {
                retainedEntitiesRef.current.set(entity.id, {
                    entity,
                    lastSeenAt: new Date(),
                    isRetained: false,
                });
            }
        });

        // Cleanup expired retained entities periodically (every 10 seconds)
        const now = Date.now();
        if (now - lastCleanupTimeRef.current > 10000) {
            retainedEntitiesRef.current = cleanupExpiredRetainedEntities(
                retainedEntitiesRef.current,
                mapRef,
                addedMarkersRef,
            );
            lastCleanupTimeRef.current = now;
        }

        // Mark disappeared entities as retained (immutable update) - only non-blur entities
        const currentRetainedEntitiesArray = Array.from(retainedEntitiesRef.current.entries());
        const updatedRetainedEntitiesArray = currentRetainedEntitiesArray.map(([entityId, retainedEntity]) => {
            if (!currentEntityIds.has(entityId) && shouldRetainEntity(retainedEntity.entity)) {
                return [
                    entityId,
                    {
                        ...retainedEntity,
                        isRetained: true,
                    },
                ] as const;
            }
            return [entityId, retainedEntity] as const;
        });
        retainedEntitiesRef.current = new Map(updatedRetainedEntitiesArray);

        // Create combined entities map (active + retained) - immutable approach
        const activeEntitiesArray: Array<[string, { entity: TrackedEntity; isRetained: boolean; lastSeenAt: Date }]> =
            trackedEntities.map(entity => {
                const retainedData = retainedEntitiesRef.current.get(entity.id);
                return [
                    entity.id,
                    {
                        entity,
                        isRetained: false,
                        lastSeenAt: retainedData?.lastSeenAt ?? new Date(),
                    },
                ];
            });

        const retainedEntitiesArray: Array<[string, { entity: TrackedEntity; isRetained: boolean; lastSeenAt: Date }]> =
            Array.from(retainedEntitiesRef.current.entries())
                .filter(
                    ([entityId, retainedEntity]) =>
                        retainedEntity.isRetained && !trackedEntities.some(e => e.id === entityId),
                )
                .map(([entityId, retainedEntity]) => [entityId, retainedEntity]);

        const allEntitiesToRender = new Map([...activeEntitiesArray, ...retainedEntitiesArray]);

        // Capture previous entities BEFORE processing to avoid race condition
        const previousEntitiesSnapshot = new Map(previousEntitiesRef.current);

        const processEntity = async (
            entity: TrackedEntity,
            isRetained: boolean,
            lastSeenAt: Date,
        ): Promise<markerData | undefined> => {
            const path = allPaths.find(p => p.id === entity.pathId);
            if (!path) {
                return;
            }

            // Smart change detection - skip processing if entity hasn't meaningfully changed
            const currentFingerprint = createEntityFingerprint(entity);
            const previousFingerprint = entityFingerprintsRef.current.get(entity.id);
            const hasChanged = hasEntityChanged(previousFingerprint, currentFingerprint);

            // Update fingerprint
            entityFingerprintsRef.current.set(entity.id, currentFingerprint);

            // Skip expensive processing if entity hasn't changed significantly
            if (!hasChanged && addedMarkersRef.current.has(entity.id) && !isRetained) {
                // Only update callout text if it's a retained entity (timestamp changes)
                return;
            }

            const initialSegmentIndex = path.coordinates.findIndex(
                p => p.latitude === entity.location.latitude && p.longitude === entity.location.longitude,
            );

            const { segmentIndex, snappedLocation } = await calculateSegmentAndLocation(
                entity,
                path,
                initialSegmentIndex,
            );

            const prevEntity = previousEntitiesSnapshot.get(entity.id);
            const markerWasAdded = addedMarkersRef.current.has(entity.id);
            const isNewEntity = !prevEntity || !markerWasAdded;

            if (isNewEntity) {
                // It's a new entity, so add it immediately to avoid timing conflicts
                // Calculate initial rotation - smart approach for both on-path and off-path
                const initialRotation = calculateInitialRotation(
                    entity,
                    prevEntity,
                    path,
                    segmentIndex,
                    snappedLocation,
                    initialSegmentIndex,
                );

                const markerData = createMarkerData(entity, snappedLocation, initialRotation, isRetained, lastSeenAt);
                addedMarkersRef.current.add(entity.id); // Mark this marker as successfully added
                return markerData;
            } else {
                // It's an existing entity, so move it with smooth path following
                return await handleExistingEntityUpdate({
                    entity,
                    prevEntity,
                    path,
                    segmentIndex,
                    snappedLocation,
                    initialSegmentIndex,
                    animationDuration,
                    activeAnimationsRef,
                    addedMarkersRef,
                    mapRef,
                    animateAlongPath,
                });
            }
        };

        // Process all entities (both active and retained)
        // Use Promise.all to process entities concurrently but maintain order
        const entityProcessingPromises = Array.from(allEntitiesToRender.values()).map(entityData =>
            processEntity(entityData.entity, entityData.isRetained, entityData.lastSeenAt),
        );

        // Wait for all entities to be processed

        Promise.all(entityProcessingPromises)
            .then(markers => {
                if (!mapRef) return;
                const finalMarkers = markers.filter(x => x !== undefined);
                if (finalMarkers.length !== 0) {
                    mapRef.current?.addMarkersFromArray({
                        markersArray: finalMarkers,
                        routeId: undefined,
                        forceUpdate: true,
                    });
                }
            })
            .catch(error => {
                console.error('Error processing entities:', error);
            });

        // Remove markers that are no longer in the trackedEntities prop
        const entitiesToRemove = Array.from(previousEntitiesSnapshot.keys()).filter(
            entityId => !currentEntitiesMap.has(entityId),
        );

        if (entitiesToRemove.length > 0) {
            entitiesToRemove.forEach(entityId => {
                // Cancel any ongoing animations for removed entities (only if feature is enabled)
                if (ENABLE_SMOOTH_PATH_ANIMATION) {
                    activeAnimationsRef.current.delete(entityId);
                }
                mapRef.current?.removeMarker(entityId);
                addedMarkersRef.current.delete(entityId); // Remove from tracking
                entityFingerprintsRef.current.delete(entityId); // Clean up fingerprints
            });
        }

        // Update the ref for the next render
        previousEntitiesRef.current = currentEntitiesMap;
    }, [trackedEntitiesHash, animationDuration, allPathsHash, isMapReady]);

    useEffect(() => {
        mapRef.current?.updateMarkersEta(allStaticMarkers);
    }, [staticMarkersStringEta]);

    // Final cleanup on unmount
    useEffect(() => {
        return () => {
            // Cancel all active animations (only if feature is enabled)
            if (ENABLE_SMOOTH_PATH_ANIMATION) {
                activeAnimationsRef.current.clear();
            }

            const allIds = new Set([
                ...allPaths.map(p => p.id),
                ...allPaths.map(p => `${p.id}-elapsed`),
                ...allStaticMarkers.map(m => m.id),
                ...trackedEntities.map(e => e.id),
            ]);
            allIds.forEach(id => {
                mapRef.current?.removeMarker(id);
                mapRef.current?.hidePolyline(id);
            });

            // Clear all performance optimization refs
            addedMarkersRef.current.clear();
            entityFingerprintsRef.current.clear();
            retainedEntitiesRef.current.clear();
        };
    }, []);

    // Return the auto focus function for external use
    return {
        performAutoFocus,
        setIsAutoFocusPaused,
        mapRef,
        userLocationMarker,
    };
};

export default useLiveTracking;
