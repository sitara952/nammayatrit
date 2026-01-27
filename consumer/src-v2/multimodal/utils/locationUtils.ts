import {
    type latLong as LatLongType,
    StopType,
    Stop,
    LatLongStopInfo,
    ProcessedLegInfo,
} from '../types/journeyTracking';
import { LatLng } from 'react-native-maps';
import { calculateDistance } from './PublicTransportUtils';
import { type LocationWithTimestamp } from '../hooks/useRiderLocation';
import { STATION_DWELL_TIME } from '../rules/strategies/common';

const toRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

const debugLog = (_message: string, ..._args: unknown[]) => {
    // console.info(_message, ..._args);
};

/**
 * Calculate bearing between two points in degrees (0-360)
 */
const calculateBearing = (from: LatLongType, to: LatLongType): number => {
    const lat1 = toRadians(from.lat);
    const lat2 = toRadians(to.lat);
    const deltaLon = toRadians(to.lon - from.lon);

    const x = Math.sin(deltaLon) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    const bearing = Math.atan2(x, y);
    return ((bearing * 180) / Math.PI + 360) % 360;
};

/**
 * Calculate the bearing of a path segment
 */
const getSegmentBearing = (start: LatLongType, end: LatLongType): number => {
    return calculateBearing(start, end);
};

/**
 * Calculate the user's movement direction from location history with improved reliability
 */
const getUserMovementDirection = (locationHistory: LocationWithTimestamp[]): number | null => {
    if (locationHistory.length < 3) {
        return null;
    }
    // Use multiple points for more reliable direction calculation
    const current = locationHistory[locationHistory.length - 1];
    const previous = locationHistory[locationHistory.length - 2];
    const beforePrevious = locationHistory[locationHistory.length - 3];

    if (!current || !previous || !beforePrevious) {
        return null;
    }

    // Calculate movement over longer distance for more stable direction
    const totalDistance = calculateDistance(beforePrevious.lat, beforePrevious.lon, current.lat, current.lon);
    const recentDistance = calculateDistance(previous.lat, previous.lon, current.lat, current.lon);

    const MIN_TOTAL_MOVEMENT = 10; // meters
    const MIN_RECENT_MOVEMENT = 3; // meters

    // Ensure we have enough movement for reliable direction
    if (totalDistance < MIN_TOTAL_MOVEMENT || recentDistance < MIN_RECENT_MOVEMENT) {
        debugLog('📍 [DIRECTION] Insufficient movement for direction calculation:', {
            totalDistance: totalDistance.toFixed(2) + 'm',
            recentDistance: recentDistance.toFixed(2) + 'm',
            minTotal: MIN_TOTAL_MOVEMENT + 'm',
            minRecent: MIN_RECENT_MOVEMENT + 'm',
        });
        return null;
    }

    // Calculate bearing from the longer segment for stability
    const longTermBearing = calculateBearing(beforePrevious, current);
    const shortTermBearing = calculateBearing(previous, current);

    // Check if both bearings are consistent (within 30 degrees)
    const bearingDiff = Math.min(
        Math.abs(longTermBearing - shortTermBearing),
        360 - Math.abs(longTermBearing - shortTermBearing),
    );

    if (bearingDiff > 30) {
        debugLog('📍 [DIRECTION] Inconsistent movement direction:', {
            longTermBearing: longTermBearing.toFixed(1) + '°',
            shortTermBearing: shortTermBearing.toFixed(1) + '°',
            difference: bearingDiff.toFixed(1) + '°',
        });
        return null;
    }

    debugLog('📍 [DIRECTION] Reliable movement direction calculated:', {
        bearing: shortTermBearing.toFixed(1) + '°',
        consistency: 'good',
        totalMovement: totalDistance.toFixed(2) + 'm',
    });

    return shortTermBearing;
};

/**
 * Check if user movement direction aligns with path direction
 */
const isMovementAlignedWithPath = (
    userBearing: number,
    segmentBearing: number,
    tolerance: number = 30, // degrees - reduced from 45 for stricter matching
): boolean => {
    // Calculate the absolute difference in bearings
    const diff1 = Math.abs(userBearing - segmentBearing);
    const diff2 = 360 - diff1;
    const minDiff = Math.min(diff1, diff2);

    const isAligned = minDiff <= tolerance;

    debugLog('🧭 [DIRECTION] Direction alignment check:', {
        userBearing: userBearing.toFixed(1) + '°',
        segmentBearing: segmentBearing.toFixed(1) + '°',
        difference: minDiff.toFixed(1) + '°',
        tolerance: tolerance + '°',
        aligned: isAligned,
    });

    return isAligned;
};

/**
 * Enhanced isLocationOnPath function with optional location history for direction detection
 */
export const isLocationOnPath = (
    location: LocationWithTimestamp,
    path: LatLongStopInfo[],
    threshold: number,
    locationHistory: LocationWithTimestamp[] | undefined = undefined,
    strictMode: boolean = false, // New parameter for stricter validation in ambiguous scenarios
): boolean => {
    debugLog('🗺️ [PATH_CHECK] Starting enhanced isLocationOnPath:', {
        userLocation: { lat: location.lat.toFixed(6), lon: location.lon.toFixed(6) },
        pathLength: path.length,
        threshold: threshold + 'm',
        hasHistory: !!locationHistory,
        historyLength: locationHistory?.length || 0,
        strictMode,
    });

    if (path.length < 2) {
        debugLog('❌ [PATH_CHECK] Path too short (< 2 points)');
        return false;
    }

    const boundingBox = getBoundingBox(path);
    if (!isPointInBoundingBox(location, boundingBox)) {
        return false;
    }

    // Get user movement direction if history is available
    const userMovementDirection = locationHistory ? getUserMovementDirection(locationHistory) : null;
    const hasValidMovementDirection = userMovementDirection !== null;

    debugLog('🧭 [PATH_CHECK] User movement analysis:', {
        hasMovementDirection: hasValidMovementDirection,
        movementBearing: userMovementDirection ? userMovementDirection.toFixed(1) + '°' : 'N/A',
    });

    // In strict mode, require movement direction for validation
    if (strictMode && !hasValidMovementDirection) {
        debugLog('❌ [PATH_CHECK] Strict mode: No reliable movement direction, rejecting path match');
        return false;
    }

    // eslint-disable-next-line functional/no-let
    let minDistanceFound = Infinity;
    // eslint-disable-next-line functional/no-let
    let closestSegmentIndex = -1;
    // eslint-disable-next-line functional/no-let
    let bestAlignedSegment = -1;

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];

        if (start && end) {
            const distance = distanceToLine(location, start, end);
            const isWithinThreshold = distance < threshold;

            // Calculate segment bearing for direction analysis
            const segmentBearing = getSegmentBearing(start, end);
            const isDirectionAligned = hasValidMovementDirection
                ? isMovementAlignedWithPath(userMovementDirection, segmentBearing)
                : true; // If no direction info, don't filter by direction

            debugLog(`📏 [PATH_CHECK] Segment ${i}-${i + 1}:`, {
                start: { lat: start.lat.toFixed(6), lon: start.lon.toFixed(6) },
                end: { lat: end.lat.toFixed(6), lon: end.lon.toFixed(6) },
                distanceToLine: distance.toFixed(2) + 'm',
                withinThreshold: isWithinThreshold,
                segmentBearing: segmentBearing.toFixed(1) + '°',
                directionAligned: hasValidMovementDirection ? isDirectionAligned : 'N/A',
            });

            if (distance < minDistanceFound) {
                minDistanceFound = distance;
                closestSegmentIndex = i;
            }

            // If we have movement direction, prioritize aligned segments
            if (isWithinThreshold) {
                // In strict mode, avoid matching segments too close to path start (potential junction confusion)
                if (strictMode && i < 2 && path.length > 5) {
                    debugLog(
                        `⚠️ [PATH_CHECK] Strict mode: Skipping segment ${i}-${i + 1} too close to path start ` +
                            `(potential junction confusion)`,
                    );
                    continue;
                }

                if (hasValidMovementDirection) {
                    if (isDirectionAligned) {
                        // In strict mode, require tighter distance threshold for first few segments
                        const strictThreshold = strictMode && i < 3 ? threshold * 0.5 : threshold;
                        if (distance < strictThreshold) {
                            debugLog(
                                `✅ [PATH_CHECK] FOUND with direction alignment! User is on segment ${i}-${i + 1} ` +
                                    `(distance: ${distance.toFixed(2)}m < ${strictThreshold}m, direction aligned)`,
                            );

                            return true;
                        } else if (strictMode) {
                            debugLog(
                                `⚠️ [PATH_CHECK] Strict mode: Direction aligned but distance too large ` +
                                    `(${distance.toFixed(2)}m >= ${strictThreshold}m)`,
                            );
                        }
                    } else {
                        // Track the best aligned segment for fallback
                        if (bestAlignedSegment === -1) {
                            bestAlignedSegment = i;
                        }
                        debugLog(
                            `⚠️ [PATH_CHECK] On path but direction misaligned on segment ${i}-${i + 1} ` +
                                `(distance: ${distance.toFixed(2)}m)`,
                        );
                    }
                } else {
                    // No direction info, use traditional distance-only approach (but not in strict mode)
                    if (!strictMode) {
                        debugLog(
                            `✅ [PATH_CHECK] FOUND! User is on segment ${i}-${i + 1} (distance: ${distance.toFixed(2)}m < ${threshold}m)`,
                        );

                        return true;
                    } else {
                        debugLog(`⚠️ [PATH_CHECK] Strict mode: No direction info, cannot validate path match`);
                    }
                }
            }
        }
    }

    // If we have movement direction but found no aligned segments,
    // be more strict about returning false
    if (hasValidMovementDirection && bestAlignedSegment === -1) {
        debugLog(
            `❌ [PATH_CHECK] User NOT on path with direction consideration. ` +
                `Closest distance: ${minDistanceFound.toFixed(2)}m at segment ${closestSegmentIndex} ` +
                `but direction not aligned (threshold: ${threshold}m)`,
        );

        return false;
    }

    // Fallback: if no direction info or no aligned segments found,
    // use traditional distance-only check for closest segment (but not in strict mode)
    if (!strictMode && !hasValidMovementDirection && minDistanceFound < threshold) {
        debugLog(
            `✅ [PATH_CHECK] FOUND (fallback)! User is on segment ${closestSegmentIndex} ` +
                `(distance: ${minDistanceFound.toFixed(2)}m < ${threshold}m, no direction info)`,
        );

        return true;
    }

    debugLog(
        `❌ [PATH_CHECK] User NOT on path. ` +
            `Closest distance: ${minDistanceFound.toFixed(2)}m at segment ${closestSegmentIndex} ` +
            `(threshold: ${threshold}m)${hasValidMovementDirection ? ', direction considered' : ''}${strictMode ? ', strict mode' : ''}`,
    );

    return false;
};

const distanceToLine = (point: LatLongType, start: LatLongType, end: LatLongType): number => {
    debugLog('📐 [DISTANCE_CALC] Starting distanceToLine calculation:', {
        point: { lat: point.lat.toFixed(6), lon: point.lon.toFixed(6) },
        lineStart: { lat: start.lat.toFixed(6), lon: start.lon.toFixed(6) },
        lineEnd: { lat: end.lat.toFixed(6), lon: end.lon.toFixed(6) },
    });

    // Calculate distances to both endpoints
    const distanceToStart = calculateDistance(point.lat, point.lon, start.lat, start.lon);
    const distanceToEnd = calculateDistance(point.lat, point.lon, end.lat, end.lon);
    const segmentLength = calculateDistance(start.lat, start.lon, end.lat, end.lon);

    debugLog('📏 [DISTANCE_CALC] Basic distances:', {
        'point->start': distanceToStart.toFixed(2) + 'm',
        'point->end': distanceToEnd.toFixed(2) + 'm',
        segmentLength: segmentLength.toFixed(2) + 'm',
    });

    // If segment is too short, return distance to start point
    if (segmentLength < 1) {
        debugLog('⚠️ [DISTANCE_CALC] Segment too short, using distance to start');
        return distanceToStart;
    }

    // Calculate the projection using dot product approach
    // Convert to local coordinate system (meters)
    const R = 6371e3; // Earth radius in meters
    const lat1 = toRadians(start.lat);
    const lon1 = toRadians(start.lon);
    const lat2 = toRadians(end.lat);
    const lon2 = toRadians(end.lon);
    const lat3 = toRadians(point.lat);
    const lon3 = toRadians(point.lon);

    // Vector from start to end (line segment vector)
    const dx = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2) * R;
    const dy = (lat2 - lat1) * R;

    // Vector from start to point
    const px = (lon3 - lon1) * Math.cos((lat1 + lat3) / 2) * R;
    const py = (lat3 - lat1) * R;

    debugLog('🔢 [DISTANCE_CALC] Vector calculations:', {
        segment_dx: dx.toFixed(2) + 'm',
        segment_dy: dy.toFixed(2) + 'm',
        point_px: px.toFixed(2) + 'm',
        point_py: py.toFixed(2) + 'm',
    });

    // Calculate the projection parameter t
    const dotProduct = px * dx + py * dy;
    const segmentLengthSquared = dx * dx + dy * dy;
    const t = dotProduct / segmentLengthSquared;

    debugLog('🧮 [DISTANCE_CALC] Projection calculation:', {
        dotProduct: dotProduct.toFixed(2),
        segmentLengthSquared: segmentLengthSquared.toFixed(2),
        t: t.toFixed(6),
    });

    const result =
        t < 0
            ? {
                  distance: distanceToStart,
                  explanation: 'Point projects before segment start - using distance to start point',
              }
            : t > 1
              ? {
                    distance: distanceToEnd,
                    explanation: 'Point projects after segment end - using distance to end point',
                }
              : {
                    distance: Math.sqrt((px - t * dx) ** 2 + (py - t * dy) ** 2),
                    explanation: 'Point projects onto segment - using perpendicular distance',
                };

    debugLog('✅ [DISTANCE_CALC] Final result:', {
        distance: result.distance.toFixed(2) + 'm',
        explanation: result.explanation,
        projectionParameter: t.toFixed(6),
    });

    return result.distance;
};

export const findNextStop = (
    riderLocation: LatLongType,
    stops: StopType,
): { currentStop: Stop | undefined; remainingStops: number } => {
    debugLog('🚏 [STOP_FINDER] Starting findNextStop:', {
        riderLocation,
        numStops: stops.length,
    });

    if (stops.length < 2) {
        debugLog('⚠️ [STOP_FINDER] Not enough stops, returning first stop');
        return { currentStop: stops[0], remainingStops: 0 };
    }

    // First check if rider is inside any station polygon
    debugLog('🔍 [STOP_FINDER] Checking if rider is inside any station polygon...');
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        if (stop?.parsedGeoJson?.coordinates) {
            if (isPointInPolygon(riderLocation, stop?.parsedGeoJson?.coordinates)) {
                debugLog('✅ [STOP_FINDER] Rider found inside station polygon:', {
                    stopIndex: i,
                    remainingStops: stops.length - (i + 1),
                });
                return {
                    currentStop: stop,
                    remainingStops: stops.length - (i + 1),
                };
            }
        }
    }

    // If not in any station, find closest segment
    debugLog('🛤️ [STOP_FINDER] Not in any station, finding closest segment...');
    // eslint-disable-next-line functional/no-let
    let closestSegmentIndex = -1;
    // eslint-disable-next-line functional/no-let
    let minDistance = Infinity;

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];

        if (start && end && start.lat && start.lon && end.lat && end.lon) {
            const distance = distanceToLine(
                riderLocation,
                { lat: start.lat, lon: start.lon },
                { lat: end.lat, lon: end.lon },
            );
            debugLog('📏 [STOP_FINDER] Checking segment distance:', {
                segmentIndex: i,
                distance: distance.toFixed(2) + 'm',
            });
            if (distance < minDistance) {
                minDistance = distance;
                closestSegmentIndex = i;
            }
        }
    }

    if (closestSegmentIndex === -1) {
        debugLog('❌ [STOP_FINDER] No valid segments found');
        return { currentStop: undefined, remainingStops: 0 };
    }

    const start = stops[closestSegmentIndex];
    const end = stops[closestSegmentIndex + 1];

    if (start && end && start.lat && start.lon && end.lat && end.lon) {
        const distanceToStart = calculateDistance(riderLocation.lat, riderLocation.lon, start.lat, start.lon);
        const distanceToEnd = calculateDistance(riderLocation.lat, riderLocation.lon, end.lat, end.lon);

        debugLog('🔢 [STOP_FINDER] Comparing distances:', {
            closestSegmentIndex,
            distanceToStart: distanceToStart.toFixed(2) + 'm',
            distanceToEnd: distanceToEnd.toFixed(2) + 'm',
        });

        if (distanceToEnd < distanceToStart) {
            debugLog('✅ [STOP_FINDER] Closer to end, using start stop');
            return { currentStop: start, remainingStops: stops.length - (closestSegmentIndex + 1) };
        } else {
            debugLog('✅ [STOP_FINDER] Closer to start, using start stop');
            return { currentStop: start, remainingStops: stops.length - (closestSegmentIndex + 1) };
        }
    }

    debugLog('❌ [STOP_FINDER] Invalid segment coordinates');
    return { currentStop: undefined, remainingStops: 0 };
};

export const findNearestPointOnRoute = (
    targetLocation: LatLng | null,
    routeCoordinates: LatLng[],
    maxDistanceMeters: number,
): LatLng | null => {
    if (!targetLocation || routeCoordinates.length === 0) {
        return targetLocation;
    }

    const result = routeCoordinates.reduce<{ nearestPoint: LatLng | null; minDistance: number }>(
        (acc, routePoint) => {
            const distance = calculateDistance(
                targetLocation.latitude,
                targetLocation.longitude,
                routePoint.latitude,
                routePoint.longitude,
            );

            if (distance < acc.minDistance) {
                return { nearestPoint: routePoint, minDistance: distance };
            }
            return acc;
        },
        { nearestPoint: null, minDistance: Infinity },
    );

    if (result.nearestPoint && result.minDistance <= maxDistanceMeters) {
        return { ...result.nearestPoint };
    }

    return targetLocation;
};

export const findIndexForLatLng = (location: LatLng | null, coordinates: LatLng[]): number => {
    if (!location) return -1;
    return coordinates.findIndex(
        coord => coord.latitude === location.latitude && coord.longitude === location.longitude,
    );
};

export const filterExtraWaypoints = (
    waypoints: LatLongType[],
    origin: LatLongType,
    destination: LatLongType,
    onRouteStops: StopType,
): LatLongStopInfo[] => {
    const routeWaypoints = waypoints.map(wp => ({
        latitude: wp.lat,
        longitude: wp.lon,
    }));

    const source = {
        latitude: origin.lat,
        longitude: origin.lon,
    };
    const sourceOnRoute = findNearestPointOnRoute(source, routeWaypoints, 200);
    // eslint-disable-next-line functional/no-let
    let sourceIndex = findIndexForLatLng(sourceOnRoute, routeWaypoints);
    const destinationT = {
        latitude: destination.lat,
        longitude: destination.lon,
    };
    const destinationOnRoute = findNearestPointOnRoute(destinationT, routeWaypoints, 200);
    // eslint-disable-next-line functional/no-let
    let destinationIndex = findIndexForLatLng(destinationOnRoute, routeWaypoints);

    const waypointsInOrder = sourceIndex > destinationIndex ? [...waypoints].reverse() : waypoints;
    if (sourceIndex > destinationIndex) {
        sourceIndex = waypointsInOrder.length - 1 - sourceIndex;
        destinationIndex = waypointsInOrder.length - 1 - destinationIndex;
    }

    const filteredRouteWaypoints = waypointsInOrder.slice(sourceIndex, destinationIndex + 1);
    if (filteredRouteWaypoints.length === 0) {
        return [
            { stopInfo: undefined, timeFromStart: undefined, ...origin },
            { stopInfo: undefined, timeFromStart: undefined, ...destination },
        ];
    }

    const filteredRouteWaypointsLatLng = filteredRouteWaypoints.map(wp => ({
        latitude: wp.lat,
        longitude: wp.lon,
    }));

    /* eslint-disable functional/no-let */
    const filteredRouteWaypointsWithStopInfo: LatLongStopInfo[] = [];
    let startFromIndex = 0;
    let timeToNextStop = undefined; // NOTE: for the first leg it will remain undefined, we will populate from next leg.
    let cumulativeTimeToStop = 0;
    /* eslint-disable functional/no-let */
    for (const stop of onRouteStops) {
        if (stop.lat && stop.lon) {
            const point = findNearestPointOnRoute(
                { latitude: stop.lat, longitude: stop.lon },
                filteredRouteWaypointsLatLng.slice(startFromIndex),
                200,
            );
            const pointIndex = findIndexForLatLng(point, filteredRouteWaypointsLatLng.slice(startFromIndex));
            if (pointIndex >= 0 && point) {
                const polylinePointsInBetween = pointIndex + 1;
                if (timeToNextStop && polylinePointsInBetween > 0) {
                    const timeForEachIntermediatePoint = timeToNextStop / polylinePointsInBetween;
                    let count = 1;
                    for (const point of filteredRouteWaypoints.slice(
                        startFromIndex,
                        startFromIndex + polylinePointsInBetween,
                    )) {
                        /* eslint-disable functional/immutable-data */
                        filteredRouteWaypointsWithStopInfo.push({
                            lat: point.lat,
                            lon: point.lon,
                            timeFromStart: cumulativeTimeToStop + timeForEachIntermediatePoint * count,
                            stopInfo: undefined,
                        });
                        count += 1;
                    }
                    cumulativeTimeToStop += timeToNextStop + STATION_DWELL_TIME;
                }
                filteredRouteWaypointsWithStopInfo.push({
                    lat: point.latitude,
                    lon: point.longitude,
                    stopInfo: stop,
                    timeFromStart: undefined,
                });
                startFromIndex += pointIndex + 1;
                timeToNextStop = stop.timeFromPrev;
            }
        }
    }

    const mappedWaypoints: LatLongStopInfo[] = filteredRouteWaypointsLatLng.reduce(
        (acc: LatLongStopInfo[], wp) => [
            ...acc,
            {
                lat: wp.latitude,
                lon: wp.longitude,
                stopInfo: undefined,
                timeFromStart: undefined,
            },
        ],
        [],
    );

    return filteredRouteWaypointsWithStopInfo.length > 0 ? filteredRouteWaypointsWithStopInfo : mappedWaypoints;
};

/**
 * Check if a point is inside a polygon using Ray Casting algorithm
 */
export const isPointInPolygon = (point: LatLongType, polygon: LatLongType[]): boolean => {
    let inside = false;
    const { lat, lon } = point;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i]?.lat,
            yi = polygon[i]?.lon;
        const xj = polygon[j]?.lat,
            yj = polygon[j]?.lon;
        if (!xi || !yi || !xj || !yj) {
            continue;
        }
        const intersect = yi > lon !== yj > lon && lat < ((xj - xi) * (lon - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
    }

    return inside;
};

export const getBoundingBox = (path: LatLongType[]) => {
    const lats = path.map(p => p.lat);
    const lons = path.map(p => p.lon);
    return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLon: Math.min(...lons),
        maxLon: Math.max(...lons),
    };
};

export const isPointInBoundingBox = (
    point: LocationWithTimestamp,
    boundingBox: { minLat: number; maxLat: number; minLon: number; maxLon: number },
) => {
    // If accuracy is too high, be more conservative with bounding box check
    const bufferDistance = point.accuracy > 50 ? point.accuracy : 50;
    const buffer = bufferDistance ? bufferDistance / 111111 : 0; // Convert accuracy from meters to degrees
    return (
        point.lat >= boundingBox.minLat - buffer &&
        point.lat <= boundingBox.maxLat + buffer &&
        point.lon >= boundingBox.minLon - buffer &&
        point.lon <= boundingBox.maxLon + buffer
    );
};

/**
 * Predict which leg the rider is likely on based on their current location
 */
export const predictCurrentLegByInaccurateLocation = (
    currentLocation: LocationWithTimestamp | undefined,
    allLegs: ProcessedLegInfo[],
    currentLegOrder: string | undefined,
): ProcessedLegInfo | undefined => {
    if (!currentLocation || allLegs.length === 0) {
        return undefined;
    }

    if (currentLocation.accuracy > 1000) {
        if (currentLegOrder) {
            const currentLeg = allLegs.find(leg => leg.staticInfo.legOrder === currentLegOrder);
            if (currentLeg?.transitMode === 'METRO' && currentLeg?.userState === 'INVEHICLE') {
                return currentLeg;
            }
        }
        return undefined;
    }

    const userLocation = { lat: currentLocation.lat, lon: currentLocation.lon };
    const accuracyRadius = currentLocation.accuracy + 50; // Add 50m buffer

    // Check each incomplete leg and store distance analysis
    const legsWithAnalysis = allLegs
        .map(leg => {
            if (leg.vehicleState === 'RIDEREACHEDDESTINATION') {
                return null; // Skip completed legs
            }

            const candidatePoints = leg.staticInfo.filteredRouteWaypoints ?? [
                leg.staticInfo.origin.latLong,
                leg.staticInfo.destination.latLong,
            ];

            // Find minimum distance and count points within radius
            const distanceAnalysis = candidatePoints.reduce(
                (acc, point) => {
                    const distance = calculateDistance(userLocation.lat, userLocation.lon, point.lat, point.lon);
                    return {
                        minDistance: distance < acc.minDistance ? distance : acc.minDistance,
                        pointsWithinRadius: acc.pointsWithinRadius + (distance <= accuracyRadius ? 1 : 0),
                    };
                },
                { minDistance: Infinity, pointsWithinRadius: 0 },
            );

            return { leg, distanceAnalysis };
        })
        .filter(item => item !== null);

    // Filter eligible legs based on distance analysis
    const eligibleLegs = legsWithAnalysis.filter(
        ({ distanceAnalysis }) => distanceAnalysis.minDistance <= accuracyRadius,
    );

    if (eligibleLegs.length === 0) {
        return undefined;
    }

    if (eligibleLegs.length === 1 && eligibleLegs[0]) {
        return eligibleLegs[0].leg;
    }

    // Multiple eligible legs - prioritize by points within radius, then current leg
    const legsWithValidPointsCount = eligibleLegs.map(({ leg, distanceAnalysis }) => ({
        leg,
        pointsWithinRadius: distanceAnalysis.pointsWithinRadius,
    }));

    // Sort by points within radius (descending), then by current leg priority
    const sortedLegs = [...legsWithValidPointsCount].sort((a, b) => {
        if (a.pointsWithinRadius !== b.pointsWithinRadius) {
            return b.pointsWithinRadius - a.pointsWithinRadius; // More points first
        }
        // If same points, prioritize current leg
        if (currentLegOrder) {
            const aIsCurrent = a.leg.staticInfo.legOrder === currentLegOrder;
            const bIsCurrent = b.leg.staticInfo.legOrder === currentLegOrder;
            if (aIsCurrent && !bIsCurrent) return -1;
            if (!aIsCurrent && bIsCurrent) return 1;
        }
        return 0;
    });

    const bestLeg = sortedLegs[0];
    if (bestLeg) return bestLeg.leg;

    return undefined;
};
