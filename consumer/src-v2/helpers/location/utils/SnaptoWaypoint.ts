/* eslint-disable functional/no-let */
/* eslint-disable functional/immutable-data */
import { LatLng } from 'react-native-maps';

type WaypointWithIndex = {
    index: number;
    coordinates: LatLng;
};

export type NearestPointResult = {
    point: LatLng;
    distance: number;
    segmentIndex: number;
    segmentProgress: number;
};

// Cache configuration
const resultCache = new Map<string, NearestPointResult>();
const MAX_CACHE_SIZE = 20;

// Constants for optimization
const EARTH_RADIUS_KM = 6371; // Earth radius in kilometers
const RAD_CONVERSION = Math.PI / 180;
const EARLY_EXIT_THRESHOLD_KM = 0.05; // 50 meters - good enough match to exit early
const SEGMENT_BATCH_SIZE = 50; // Process this many segments before checking if we have a good match

/**
 * Calculate distance between two points in kilometers using Haversine formula
 * Includes fast-path optimization for very nearby points
 */
const calculateDistance = (point1: LatLng, point2: LatLng): number => {
    const latDiff = Math.abs(point1.latitude - point2.latitude);
    const lonDiff = Math.abs(point1.longitude - point2.longitude);

    // Fast approximation for very nearby points using equirectangular projection
    if (latDiff < 0.01 && lonDiff < 0.01) {
        const x =
            (point2.longitude - point1.longitude) *
            Math.cos((point1.latitude + point2.latitude) * 0.5 * RAD_CONVERSION);
        const y = point2.latitude - point1.latitude;
        return Math.sqrt(x * x + y * y) * EARTH_RADIUS_KM * RAD_CONVERSION;
    }

    // Full Haversine formula for better accuracy with more distant points
    const lat1 = point1.latitude * RAD_CONVERSION;
    const lon1 = point1.longitude * RAD_CONVERSION;
    const lat2 = point2.latitude * RAD_CONVERSION;
    const lon2 = point2.longitude * RAD_CONVERSION;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
};

/**
 * Calculate vector dot product for 2D vectors
 */
const dotProduct = (vec1: [number, number], vec2: [number, number]): number => vec1[0] * vec2[0] + vec1[1] * vec2[1];

/**
 * Find the nearest point on a line segment to a given point
 */
const findNearestPointOnLineSegment = (
    point: LatLng,
    lineStart: LatLng,
    lineEnd: LatLng,
): { point: LatLng; distance: number; segmentProgress: number } => {
    // Convert to simple x,y for vector math (flat approximation)
    const lineVector: [number, number] = [
        lineEnd.longitude - lineStart.longitude,
        lineEnd.latitude - lineStart.latitude,
    ];

    const pointVector: [number, number] = [point.longitude - lineStart.longitude, point.latitude - lineStart.latitude];

    // Calculate the squared length of the line segment
    const lineSquaredLength = lineVector[0] * lineVector[0] + lineVector[1] * lineVector[1];

    // If the line segment is actually a point
    if (lineSquaredLength === 0) {
        return {
            point: lineStart,
            distance: calculateDistance(point, lineStart),
            segmentProgress: 0,
        };
    }

    // Calculate the projection parameter segmentProgress and clamp to [0,1]
    const segmentProgress = Math.max(0, Math.min(1, dotProduct(pointVector, lineVector) / lineSquaredLength));

    // Calculate the projected point
    const projectedPoint: LatLng = {
        longitude: lineStart.longitude + segmentProgress * lineVector[0],
        latitude: lineStart.latitude + segmentProgress * lineVector[1],
    };

    return {
        point: projectedPoint,
        distance: calculateDistance(point, projectedPoint),
        segmentProgress,
    };
};

/**
 * Create a spatial grid to optimize searching through waypoints
 * Groups waypoints into cells for faster nearest-neighbor searches
 */
const createSpatialGrid = (waypoints: LatLng[], gridSize: number = 0.01): Map<string, number[]> => {
    return waypoints.reduce((grid, point, index) => {
        if (!point) return grid;

        // Create grid cell key by truncating coordinates
        const cellX = Math.floor(point.longitude / gridSize);
        const cellY = Math.floor(point.latitude / gridSize);
        const key = `${cellX}:${cellY}`;

        // Add waypoint index to this cell using immutable approach
        const indices = grid.get(key) || [];
        return new Map(grid).set(key, [...indices, index]);
    }, new Map<string, number[]>());
};

/**
 * Get nearby waypoint indices using the spatial grid
 */
const getNearbyWaypointIndices = (
    point: LatLng,
    grid: Map<string, number[]>,
    gridSize: number = 0.01,
    neighborhoodSize: number = 1,
): number[] => {
    const cellX = Math.floor(point.longitude / gridSize);
    const cellY = Math.floor(point.latitude / gridSize);

    // Check the current cell and neighboring cells using reduce for immutability
    return Array.from({ length: 2 * neighborhoodSize + 1 }, (_, i) => i - neighborhoodSize).flatMap(i =>
        Array.from({ length: 2 * neighborhoodSize + 1 }, (_, j) => j - neighborhoodSize).flatMap(j => {
            const key = `${cellX + i}:${cellY + j}`;
            return grid.get(key) || [];
        }),
    );
};

/**
 * Generate a cache key for nearest point calculations
 */
const getCacheKey = (location: LatLng, waypoints: LatLng[]): string => {
    if (!waypoints.length) return '';

    // Use only the first and last waypoint in the key to detect route changes
    // while keeping reasonable cache hits for similar locations
    const firstWp = waypoints[0];
    const lastWp = waypoints[waypoints.length - 1];

    // Include only 5 decimal places for lat/lng to increase cache hits for very similar locations
    return [
        location.latitude.toFixed(5),
        location.longitude.toFixed(5),
        firstWp?.latitude?.toFixed(5) || '0',
        firstWp?.longitude?.toFixed(5) || '0',
        lastWp?.latitude?.toFixed(5) || '0',
        lastWp?.longitude?.toFixed(5) || '0',
        waypoints.length.toString(), // Include waypoint count to detect major route changes
    ].join(':');
};

/**
 * Cache a result while managing cache size
 */
const cacheResult = (key: string, result: NearestPointResult): void => {
    // Add new entry to cache
    resultCache.set(key, result);

    // Prune cache if needed
    if (resultCache.size > MAX_CACHE_SIZE) {
        const firstKey = resultCache.keys().next().value;
        if (firstKey) {
            resultCache.delete(firstKey);
        }
    }
};

/**
 * Find the nearest point on a LineString to a given point
 */
export const findNearestPointOnRoute = (location: LatLng, waypoints: LatLng[] | undefined): NearestPointResult => {
    // Handle empty waypoint array
    if (!waypoints?.length) {
        return {
            point: location,
            distance: 0,
            segmentIndex: 0,
            segmentProgress: 0,
        };
    }

    // Check cache first
    const cacheKey = getCacheKey(location, waypoints);
    const cachedResult = resultCache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    // For a single waypoint, return that point
    if (waypoints.length === 1) {
        const firstWaypoint = waypoints[0];
        if (firstWaypoint) {
            const result = {
                point: {
                    latitude: firstWaypoint.latitude,
                    longitude: firstWaypoint.longitude,
                },
                distance: calculateDistance(location, firstWaypoint),
                segmentIndex: 0,
                segmentProgress: 0,
            };
            cacheResult(cacheKey, result);
            return result;
        }
    }

    // Initial values for nearest point search
    const initialState = {
        minDistance: Infinity,
        nearestPoint: waypoints[0] || location,
        nearestSegmentIndex: 0,
        nearestSegmentProgress: 0,
    };

    // For small routes, use simple iteration
    if (waypoints.length < 100) {
        const result = findNearestPointSmallRoute(location, waypoints, initialState);
        cacheResult(cacheKey, result);
        return result;
    }

    // For large routes, use spatial partitioning
    const result = findNearestPointLargeRoute(location, waypoints, initialState);
    cacheResult(cacheKey, result);
    return result;
};

/**
 * Find nearest point for small routes (<100 waypoints) using direct iteration
 */
const findNearestPointSmallRoute = (
    location: LatLng,
    waypoints: LatLng[],
    initialState: {
        minDistance: number;
        nearestPoint: LatLng;
        nearestSegmentIndex: number;
        nearestSegmentProgress: number;
    },
): NearestPointResult => {
    let { minDistance, nearestPoint, nearestSegmentIndex, nearestSegmentProgress } = initialState;

    // Iterate through each line segment
    for (let i = 0; i < waypoints.length - 1; i++) {
        const segmentStart = waypoints[i];
        const segmentEnd = waypoints[i + 1];

        if (!segmentStart || !segmentEnd) continue;

        const result = findNearestPointOnLineSegment(location, segmentStart, segmentEnd);

        if (result.distance < minDistance) {
            minDistance = result.distance;
            nearestPoint = result.point;
            nearestSegmentIndex = i;
            nearestSegmentProgress = result.segmentProgress;

            // Early termination if we found a point very close to location
            if (minDistance < EARLY_EXIT_THRESHOLD_KM) {
                break;
            }
        }
    }

    return {
        point: nearestPoint,
        distance: minDistance,
        segmentIndex: nearestSegmentIndex,
        segmentProgress: nearestSegmentProgress,
    };
};

/**
 * Find nearest point for large routes (≥100 waypoints) using spatial partitioning
 */
const findNearestPointLargeRoute = (
    location: LatLng,
    waypoints: LatLng[],
    initialState: {
        minDistance: number;
        nearestPoint: LatLng;
        nearestSegmentIndex: number;
        nearestSegmentProgress: number;
    },
): NearestPointResult => {
    let { minDistance, nearestPoint, nearestSegmentIndex, nearestSegmentProgress } = initialState;

    // Step 1: Create a spatial grid of waypoints
    const grid = createSpatialGrid(waypoints);

    // Step 2: Get indices of waypoints in nearby grid cells
    const nearbyIndices = getNearbyWaypointIndices(location, grid);

    // Step 3: Check segments with at least one endpoint in nearby cells
    const processedSegments = new Set<number>();

    // First check nearby segments
    for (const index of nearbyIndices) {
        // Check segment starting at this waypoint
        if (index < waypoints.length - 1 && !processedSegments.has(index)) {
            const segmentStart = waypoints[index];
            const segmentEnd = waypoints[index + 1];

            if (!segmentStart || !segmentEnd) continue;

            processedSegments.add(index);
            const result = findNearestPointOnLineSegment(location, segmentStart, segmentEnd);

            if (result.distance < minDistance) {
                minDistance = result.distance;
                nearestPoint = result.point;
                nearestSegmentIndex = index;
                nearestSegmentProgress = result.segmentProgress;

                // Early termination if we found a point very close to location
                if (minDistance < EARLY_EXIT_THRESHOLD_KM) {
                    return {
                        point: nearestPoint,
                        distance: minDistance,
                        segmentIndex: nearestSegmentIndex,
                        segmentProgress: nearestSegmentProgress,
                    };
                }
            }
        }

        // Check segment ending at this waypoint
        if (index > 0 && !processedSegments.has(index - 1)) {
            const segmentStart = waypoints[index - 1];
            const segmentEnd = waypoints[index];

            if (!segmentStart || !segmentEnd) continue;

            processedSegments.add(index - 1);
            const result = findNearestPointOnLineSegment(location, segmentStart, segmentEnd);

            if (result.distance < minDistance) {
                minDistance = result.distance;
                nearestPoint = result.point;
                nearestSegmentIndex = index - 1;
                nearestSegmentProgress = result.segmentProgress;

                // Early termination if we found a point very close to location
                if (minDistance < EARLY_EXIT_THRESHOLD_KM) {
                    return {
                        point: nearestPoint,
                        distance: minDistance,
                        segmentIndex: nearestSegmentIndex,
                        segmentProgress: nearestSegmentProgress,
                    };
                }
            }
        }
    }

    // Step 4: If we haven't found a good match, check remaining segments in batches
    if (minDistance > EARLY_EXIT_THRESHOLD_KM) {
        for (let i = 0; i < waypoints.length - 1; i += SEGMENT_BATCH_SIZE) {
            const end = Math.min(i + SEGMENT_BATCH_SIZE, waypoints.length - 1);
            let foundInBatch = false;

            for (let j = i; j < end; j++) {
                // Skip segments we've already checked
                if (processedSegments.has(j)) continue;

                const segmentStart = waypoints[j];
                const segmentEnd = waypoints[j + 1];

                if (!segmentStart || !segmentEnd) continue;

                const result = findNearestPointOnLineSegment(location, segmentStart, segmentEnd);

                if (result.distance < minDistance) {
                    minDistance = result.distance;
                    nearestPoint = result.point;
                    nearestSegmentIndex = j;
                    nearestSegmentProgress = result.segmentProgress;

                    if (minDistance < EARLY_EXIT_THRESHOLD_KM) {
                        foundInBatch = true;
                        break;
                    }
                }
            }

            // Check if we have a good enough match after each batch
            if (foundInBatch) {
                break;
            }
        }
    }

    return {
        point: nearestPoint,
        distance: minDistance,
        segmentIndex: nearestSegmentIndex,
        segmentProgress: nearestSegmentProgress,
    };
};

/**
 * Find the nearest waypoint (actual point in the waypoints array) to a given location
 */
export const findNearestWaypoint = (location: LatLng, waypoints: LatLng[] | undefined): WaypointWithIndex | null => {
    if (!waypoints?.length) {
        return null;
    }

    // For small arrays, use direct iteration
    if (waypoints.length < 100) {
        return findNearestWaypointSmallArray(location, waypoints);
    }

    // For larger arrays, use spatial partitioning
    return findNearestWaypointLargeArray(location, waypoints);
};

/**
 * Find nearest waypoint for small arrays using direct iteration
 */
const findNearestWaypointSmallArray = (location: LatLng, waypoints: LatLng[]): WaypointWithIndex | null => {
    let minDistance = Infinity;
    let nearestIndex = -1;

    for (let i = 0; i < waypoints.length; i++) {
        const waypoint = waypoints[i];
        if (!waypoint) continue;

        const dist = calculateDistance(location, waypoint);

        if (dist < minDistance) {
            minDistance = dist;
            nearestIndex = i;

            // Early termination if we found a waypoint very close to location
            if (minDistance < EARLY_EXIT_THRESHOLD_KM) {
                break;
            }
        }
    }

    if (nearestIndex >= 0) {
        const nearestWaypoint = waypoints[nearestIndex];
        if (nearestWaypoint) {
            return {
                index: nearestIndex,
                coordinates: {
                    latitude: nearestWaypoint.latitude,
                    longitude: nearestWaypoint.longitude,
                },
            };
        }
    }

    return null;
};

/**
 * Find nearest waypoint for large arrays using spatial partitioning
 */
const findNearestWaypointLargeArray = (location: LatLng, waypoints: LatLng[]): WaypointWithIndex | null => {
    const grid = createSpatialGrid(waypoints);
    const nearbyIndices = getNearbyWaypointIndices(location, grid);

    let minDistance = Infinity;
    let nearestIndex = -1;

    // First check nearby waypoints
    for (const index of nearbyIndices) {
        const waypoint = waypoints[index];
        if (!waypoint) continue;

        const dist = calculateDistance(location, waypoint);

        if (dist < minDistance) {
            minDistance = dist;
            nearestIndex = index;

            // Early termination if we found a waypoint very close to location
            if (minDistance < EARLY_EXIT_THRESHOLD_KM) {
                break;
            }
        }
    }

    // If we found a good match in nearby cells, return it
    if (nearestIndex >= 0 && minDistance < EARLY_EXIT_THRESHOLD_KM) {
        const nearestWaypoint = waypoints[nearestIndex];
        if (nearestWaypoint) {
            return {
                index: nearestIndex,
                coordinates: {
                    latitude: nearestWaypoint.latitude,
                    longitude: nearestWaypoint.longitude,
                },
            };
        }
    }

    // If no good match in nearby cells, check remaining waypoints in batches
    for (let i = 0; i < waypoints.length; i += SEGMENT_BATCH_SIZE) {
        const end = Math.min(i + SEGMENT_BATCH_SIZE, waypoints.length);

        for (let j = i; j < end; j++) {
            // Skip indices we've already checked
            if (nearbyIndices.includes(j)) continue;

            const waypoint = waypoints[j];
            if (!waypoint) continue;

            const dist = calculateDistance(location, waypoint);

            if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = j;
            }
        }

        // Check if we have a good enough match after each batch
        if (minDistance < EARLY_EXIT_THRESHOLD_KM) {
            break;
        }
    }

    // Return the nearest waypoint found
    if (nearestIndex >= 0) {
        const nearestWaypoint = waypoints[nearestIndex];
        if (nearestWaypoint) {
            return {
                index: nearestIndex,
                coordinates: {
                    latitude: nearestWaypoint.latitude,
                    longitude: nearestWaypoint.longitude,
                },
            };
        }
    }

    return null;
};

/**
 * Calculate the bearing/rotation angle in degrees between two points
 * @param point1 Starting point
 * @param point2 Ending point
 * @returns Bearing in degrees (0-360, where 0 is North)
 */
const calculateBearing = (point1: LatLng, point2: LatLng): number => {
    const lat1 = point1.latitude * RAD_CONVERSION;
    const lat2 = point2.latitude * RAD_CONVERSION;
    const dLon = (point2.longitude - point1.longitude) * RAD_CONVERSION;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    // Get bearing in radians and convert to degrees
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;

    // Normalize to 0-360
    return (bearing + 360) % 360;
};

/**
 * Calculate the rotation angle for a vehicle marker based on its position on a route
 * @param result The result from findNearestPointOnRoute
 * @param waypoints The array of waypoints that form the route
 * @returns Rotation angle in degrees
 */
export const calculateVehicleRotation = (result: NearestPointResult, waypoints: LatLng[]): number => {
    if (!waypoints?.length || waypoints.length < 2) {
        return 0;
    }

    const { segmentIndex, segmentProgress } = result;

    // If we're at the start of a segment and not the first segment, use previous segment for better transitions
    if (segmentProgress < 0.05 && segmentIndex > 0) {
        const point1 = waypoints[segmentIndex - 1];
        const point2 = waypoints[segmentIndex];
        if (point1 && point2) {
            return calculateBearing(point1, point2);
        }
    }

    // If we're at the end of a segment and not the last segment, use next segment for better transitions
    if (segmentProgress > 0.95 && segmentIndex < waypoints.length - 2) {
        const point1 = waypoints[segmentIndex + 1];
        const point2 = waypoints[segmentIndex + 2];
        if (point1 && point2) {
            return calculateBearing(point1, point2);
        }
    }

    // Calculate bearing based on current segment
    if (segmentIndex < waypoints.length - 1) {
        const point1 = waypoints[segmentIndex];
        const point2 = waypoints[segmentIndex + 1];
        if (point1 && point2) {
            return calculateBearing(point1, point2);
        }
    }

    // Fallback for last waypoint
    if (segmentIndex > 0) {
        const point1 = waypoints[segmentIndex - 1];
        const point2 = waypoints[segmentIndex];
        if (point1 && point2) {
            return calculateBearing(point1, point2);
        }
    }

    return 0;
};
