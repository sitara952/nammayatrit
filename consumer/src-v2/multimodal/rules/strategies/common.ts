import { ProcessedLegInfo, Stop, StopType, latLong, TimeEntry, LatLongStopInfo } from '../../types/journeyTracking';
import { isLocationOnPath, isPointInBoundingBox, getBoundingBox, isPointInPolygon } from '../../utils/locationUtils';
import { calculateDistance } from '../../utils/PublicTransportUtils';
import { calculateTravelTimeFromStops, getPreviousLegOrder } from '../../utils/journeyTrackingUtils';
import { LocationWithTimestamp } from '../../hooks/useRiderLocation';
import { StrategyContext, VerificationResult } from './types';
import { isUndefined } from 'lodash';

const NEARBY_THRESHOLD_METERS = 100;
const PROXIMITY_THRESHOLD_METERS = 500;
const TIME_TOLERANCE_SECONDS = 60;
const MAX_LOCATION_AGE_SECONDS = 120; // 2 minutes
const ACCEPTABLE_ACCURACY_METERS = 200; // 200 meters
export const STATION_DWELL_TIME = 15; // 15 seconds dwell time per station

// Enhanced constants for better train identification
// const SPEED_CONSISTENCY_WEIGHT = 0.3;
// const LOCATION_ACCURACY_WEIGHT = 0.25;
// const TIME_ALIGNMENT_WEIGHT = 0.25;
// const VEHICLE_DATA_WEIGHT = 0.2;
// const MIN_CONFIDENCE_THRESHOLD = 0.6;
// const MOVEMENT_ANALYSIS_WINDOW = 5; // Number of location points to analyze
// const MAX_REASONABLE_SPEED_MPS = 25; // 90 km/h max reasonable speed for metro/subway
// const MIN_REASONABLE_SPEED_MPS = 5; // 18 km/h min reasonable speed for metro/subway
// const DEPARTURE_TIME_BUFFER_SECONDS = 120; // 2 minutes buffer for departure time consideration

// Underground/weak signal handling constants
const UNDERGROUND_ACCURACY_THRESHOLD = 1000; // meters - considered unreliable
// const UNDERGROUND_TIME_WEIGHT_BOOST = 0.5; // Boost time-based confidence when location is unreliable
// const MAX_UNDERGROUND_TIME_MINUTES = 30; // Maximum reasonable underground time for metro
const STALE_LOCATION_THRESHOLD = 180; // 3 minutes - location considered stale

// Network delay handling constants
const NETWORK_DELAY_BUFFER_SECONDS = 120; // 2 minutes buffer for network delays
// const DELAYED_CHECKIN_CONFIDENCE_PENALTY = 0.9; // Slight penalty for delayed check-ins

// Location validation constants
const MAX_DISTANCE_FROM_ROUTE_METERS = 2000; // 2km - maximum reasonable distance from route
const MAX_DISTANCE_FROM_ANY_STOP_METERS = 1000; // 1km - maximum distance from any route stop
// const FALSE_POSITIVE_PENALTY = 0.5; // Heavy penalty for likely false positives

// some hardcoded assumptions
const MAX_STATIONS_TRAVEL_TIME_SECONDS = 5 * 60; // 5 minutes

// interface MovementAnalysis {
//     averageSpeed: number;
//     speedConsistency: number;
//     directionConsistency: number;
//     isMoving: boolean;
// }

interface ClosestStopResult {
    closestDistance: number;
    polylinePoint: LatLongStopInfo | undefined;
    lastCrossedStop: Stop | undefined;
    nextStop: Stop | undefined;
    lastCrossedStopPolylineIndex: number;
    closestRoutePoint: LatLongStopInfo | undefined;
}

export const getPossibleCheckInStations = (location: LocationWithTimestamp, stations: StopType): StopType => {
    const STALE_THRESHOLD = 60 * 1000; // 1 minute in milliseconds
    const MIN_ACCURACY = 50; // minimum accuracy in meters to consider
    const DEFAULT_RADIUS = 200; // default search radius in meters

    // Calculate search radius based on accuracy
    // If accuracy is poor, we use a larger search radius proportional to the accuracy
    const searchRadius = location.accuracy ? Math.max(location.accuracy, MIN_ACCURACY) : DEFAULT_RADIUS;

    // Apply time decay factor - increase search radius for stale data
    const timeSinceUpdate = Date.now() - location.timestamp;
    const timeDecayFactor = Math.min(timeSinceUpdate / STALE_THRESHOLD, 1);
    const adjustedRadius = searchRadius * (1 + timeDecayFactor);

    const possibleStations = stations.filter(station => {
        if (!station.lat || !station.lon) return false;
        const distance = calculateDistance(location.lat, location.lon, station.lat, station.lon);
        return distance <= adjustedRadius;
    });

    return possibleStations;
};

export const isLocationDataReliable = (location: LocationWithTimestamp | undefined): boolean => {
    if (!location) {
        return false;
    }
    const locationAge = (new Date().getTime() - location.timestamp) / 1000;
    return locationAge < MAX_LOCATION_AGE_SECONDS && location.accuracy < ACCEPTABLE_ACCURACY_METERS;
};

export const isLocationDataSuperReliable = (location: LocationWithTimestamp | undefined): boolean => {
    if (!location) {
        return false;
    }
    const locationAge = (new Date().getTime() - location.timestamp) / 1000;
    return locationAge < 30 && location.accuracy < 50;
};

export const getMostRecentSuperReliableLocation = (
    locationHistory: LocationWithTimestamp[],
    secAgo: number,
): LocationWithTimestamp | undefined => {
    const now = Date.now();
    const recentSuperReliableLocations = locationHistory
        .filter(loc => isLocationDataSuperReliable(loc) && now - loc.timestamp < secAgo * 1000)
        .sort((a, b) => b.timestamp - a.timestamp);

    return recentSuperReliableLocations[0];
};

/**
 * Determines if the user is likely underground or in a weak signal environment
 */
export const isLikelyUnderground = (
    location: LocationWithTimestamp | undefined,
    locationHistory: LocationWithTimestamp[] | undefined,
): boolean => {
    if (!location) {
        return true; // No location data suggests underground/signal issues
    }

    // Check current location reliability
    const locationAge = (new Date().getTime() - location.timestamp) / 1000;
    const isLocationStale = locationAge > STALE_LOCATION_THRESHOLD;
    const isLocationInaccurate = location.accuracy > UNDERGROUND_ACCURACY_THRESHOLD;

    // If current location is very stale or very inaccurate, likely underground
    if (isLocationStale || isLocationInaccurate) {
        return true;
    }

    // Check location history for pattern of degrading signal
    if (locationHistory && locationHistory.length >= 3) {
        const recentLocations = locationHistory.slice(-3);
        const accuracyTrend = recentLocations.map(loc => loc.accuracy);

        // Check if accuracy is consistently getting worse (signal degrading)
        const isDegradingSignal =
            accuracyTrend.every((acc, index) => index === 0 || acc >= (accuracyTrend[index - 1] ?? 0)) &&
            (accuracyTrend[accuracyTrend.length - 1] ?? 0) > 300;

        // Check if we have very few recent reliable locations
        const reliableRecentLocations = recentLocations.filter(
            loc =>
                loc.accuracy < ACCEPTABLE_ACCURACY_METERS &&
                (new Date().getTime() - loc.timestamp) / 1000 < MAX_LOCATION_AGE_SECONDS,
        );

        if (isDegradingSignal || reliableRecentLocations.length <= 1) {
            return true;
        }
    }

    return false;
};

export const isNearOrigin = (leg: ProcessedLegInfo): boolean => {
    const { riderLocation, staticInfo } = leg;
    return staticInfo.origin.geoJson
        ? isPointInPolygon(riderLocation, staticInfo.origin.geoJson.coordinates)
        : calculateDistance(
              riderLocation.lat,
              riderLocation.lon,
              staticInfo.origin.latLong.lat,
              staticInfo.origin.latLong.lon,
          ) < NEARBY_THRESHOLD_METERS;
};

export const isFarFromDestination = (leg: ProcessedLegInfo): boolean => {
    return !isNearDestination(leg);
};

export const isNearDestination = (leg: ProcessedLegInfo): boolean => {
    const { riderLocation, staticInfo } = leg;
    return staticInfo.destination.geoJson
        ? isPointInPolygon(riderLocation, staticInfo.destination.geoJson.coordinates)
        : calculateDistance(
              riderLocation.lat,
              riderLocation.lon,
              staticInfo.destination.latLong.lat,
              staticInfo.destination.latLong.lon,
          ) < NEARBY_THRESHOLD_METERS;
};

export const isFarFromOriginProximity = (leg: ProcessedLegInfo): boolean => {
    const { riderLocation, staticInfo } = leg;
    return (
        calculateDistance(
            riderLocation.lat,
            riderLocation.lon,
            staticInfo.origin.latLong.lat,
            staticInfo.origin.latLong.lon,
        ) > PROXIMITY_THRESHOLD_METERS
    );
};

export const inNearDestinationProximity = (leg: ProcessedLegInfo): boolean => {
    const { riderLocation, staticInfo } = leg;
    return (
        calculateDistance(
            riderLocation.lat,
            riderLocation.lon,
            staticInfo.destination.latLong.lat,
            staticInfo.destination.latLong.lon,
        ) < PROXIMITY_THRESHOLD_METERS
    );
};

export const findClosestStop = (
    location: latLong,
    polylineWithStops: LatLongStopInfo[],
): ClosestStopResult | undefined => {
    if (!polylineWithStops || polylineWithStops.length === 0) {
        return undefined;
    }

    const result: ClosestStopResult = {
        closestDistance: Infinity,
        polylinePoint: undefined,
        lastCrossedStop: undefined,
        nextStop: undefined,
        lastCrossedStopPolylineIndex: 0,
        closestRoutePoint: undefined,
    };
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < polylineWithStops.length; i++) {
        const polylinePoint = polylineWithStops[i];

        if (polylinePoint) {
            const distance = calculateDistance(location.lat, location.lon, polylinePoint.lat, polylinePoint.lon);

            if (distance <= result.closestDistance) {
                /* eslint-disable functional/immutable-data */
                result.closestDistance = distance;
                result.polylinePoint = polylinePoint;
                result.lastCrossedStop = isUndefined(polylinePoint.stopInfo?.stopCode)
                    ? result.lastCrossedStop
                    : polylinePoint.stopInfo;
                result.lastCrossedStopPolylineIndex = isUndefined(polylinePoint.stopInfo?.stopCode)
                    ? result.lastCrossedStopPolylineIndex
                    : i;
                result.closestRoutePoint = polylinePoint;
                /* eslint-enable functional/immutable-data */
            }
        }
    }

    // eslint-disable-next-line functional/immutable-data
    result.nextStop = polylineWithStops
        .slice(result.lastCrossedStopPolylineIndex + 1, polylineWithStops.length)
        .find(stop => stop.stopInfo?.stopCode)?.stopInfo;

    return result;
};

/**
 * Validates if the user's location is reasonable for the given route and stops
 */
const validateLocationForRoute = (
    userLocation: LocationWithTimestamp,
    routeWaypoints: LatLongStopInfo[],
    closestStop: ClosestStopResult,
    isUnderground: boolean,
): {
    isValid: boolean;
    distanceFromRoute: number;
    distanceFromUpcomingStop: number;
    distanceFromLastCrossedStop: number;
    validationScore: number;
} => {
    // Find distance to nearest stop
    const distanceFromUpcomingStop =
        closestStop.nextStop && closestStop.nextStop.lat && closestStop.nextStop.lon
            ? calculateDistance(userLocation.lat, userLocation.lon, closestStop.nextStop.lat, closestStop.nextStop.lon)
            : Infinity;

    const distanceFromLastCrossedStop =
        closestStop.lastCrossedStop && closestStop.lastCrossedStop.lat && closestStop.lastCrossedStop.lon
            ? calculateDistance(
                  userLocation.lat,
                  userLocation.lon,
                  closestStop.lastCrossedStop.lat,
                  closestStop.lastCrossedStop.lon,
              )
            : Infinity;

    // Find distance to route (simplified - distance to nearest waypoint)
    const distanceFromRoute =
        routeWaypoints.length > 0
            ? Math.min(
                  ...routeWaypoints.map(wp => calculateDistance(userLocation.lat, userLocation.lon, wp.lat, wp.lon)),
              )
            : Infinity;

    // For underground scenarios, be more lenient with location validation
    const maxStopDistance = isUnderground ? MAX_DISTANCE_FROM_ANY_STOP_METERS * 2 : MAX_DISTANCE_FROM_ANY_STOP_METERS;
    const maxLastCrossedStopDistance = isUnderground
        ? MAX_DISTANCE_FROM_ANY_STOP_METERS * 2
        : MAX_DISTANCE_FROM_ANY_STOP_METERS;
    const maxRouteDistance = isUnderground ? MAX_DISTANCE_FROM_ROUTE_METERS * 1.5 : MAX_DISTANCE_FROM_ROUTE_METERS;

    // Location is valid if within reasonable distance of either stops or route
    const isNearStops = distanceFromUpcomingStop < maxStopDistance;
    const isNearLastCrossedStop = distanceFromLastCrossedStop < maxLastCrossedStopDistance;
    const isNearRoute = distanceFromRoute < maxRouteDistance;
    const isValid = isNearStops || isNearRoute || isNearLastCrossedStop;

    // Calculate validation score (0-1, higher is better)
    const stopScore = Math.max(0, 1 - distanceFromUpcomingStop / maxStopDistance);
    const routeScore = Math.max(0, 1 - distanceFromRoute / maxRouteDistance);
    const lastCrossedStopScore = Math.max(0, 1 - distanceFromLastCrossedStop / maxLastCrossedStopDistance);
    const validationScore = Math.max(stopScore, routeScore, lastCrossedStopScore);

    return {
        isValid,
        distanceFromRoute,
        distanceFromUpcomingStop,
        distanceFromLastCrossedStop,
        validationScore,
    };
};

const getLastKnownGoodLocation = (
    locationHistory: LocationWithTimestamp[] | undefined,
): LocationWithTimestamp | undefined => {
    const bestLocation: { timestamp: number | undefined; location: LocationWithTimestamp | undefined } = {
        timestamp: undefined,
        location: undefined,
    };
    for (const location of locationHistory ?? []) {
        if (isLocationDataReliable(location)) {
            if ((bestLocation.timestamp && location.timestamp > bestLocation.timestamp) || !bestLocation.timestamp) {
                /* eslint-disable functional/immutable-data */
                bestLocation.timestamp = location.timestamp;
                bestLocation.location = location;
                /* eslint-enable functional/immutable-data */
            }
        }
    }
    return bestLocation.location;
};
/**
 * Enhanced train identification with multi-factor analysis and confidence scoring
 */

const getCandidateDepartureTimes = (
    timetable: TimeEntry[] | undefined,
    confirmationTime: number,
    scheduleStartBuffer: number,
): number[] => {
    if (!timetable) {
        return [];
    }

    const bufferStartTime = confirmationTime - scheduleStartBuffer;
    const bufferEndTime = confirmationTime;

    const candidateDepartureTimes = timetable
        .map((t: TimeEntry) => t.time)
        .filter((time: number) => time >= bufferStartTime && time <= bufferEndTime)
        .sort((a: number, b: number) => {
            // Prioritize past departures, but include near-future ones
            const aIsPast = a <= confirmationTime;
            const bIsPast = b <= confirmationTime;

            if (aIsPast && bIsPast) {
                return b - a; // Most recent past departure first
            } else if (!aIsPast && !bIsPast) {
                return a - b; // Earliest future departure first
            } else {
                return aIsPast ? -1 : 1; // Past departures before future ones
            }
        });
    return candidateDepartureTimes;
};

const getValidScheduleAccordingToUserLocation = (
    candidateDepartureTimes: number[],
    filteredRouteWaypoints: LatLongStopInfo[],
    lastKnownGoodLocation: LocationWithTimestamp,
    closestStop: ClosestStopResult,
): number | undefined => {
    const userRoutePoint = closestStop.closestRoutePoint;
    const routePointInfoForUserPoint = filteredRouteWaypoints.find(
        wp => wp.lat === userRoutePoint?.lat && wp.lon === userRoutePoint?.lon,
    );
    const scheduleTimeInSecondsToUserPoint = routePointInfoForUserPoint?.timeFromStart ?? 0;
    const tripsReachingUserPointAtTimestamps = candidateDepartureTimes.map(departureTime => {
        return {
            departureTime: departureTime,
            timeToUserStop: departureTime + scheduleTimeInSecondsToUserPoint * 1000,
        };
    });
    const diffFromEachTripToUserPoint = tripsReachingUserPointAtTimestamps.map(trip => {
        return {
            diff: Math.abs(trip.timeToUserStop - (lastKnownGoodLocation.timestamp ?? 0)),
            departureTime: trip.departureTime,
        };
    });
    const minDiff = Math.min(...diffFromEachTripToUserPoint.map(trip => trip.diff));
    if (minDiff >= STATION_DWELL_TIME * 1000) {
        return lastKnownGoodLocation.timestamp - scheduleTimeInSecondsToUserPoint * 1000;
    }
    return diffFromEachTripToUserPoint.find(trip => trip.diff === minDiff)?.departureTime;
};

export const identifyTrain = (
    lastKnownLocation: LocationWithTimestamp | undefined,
    leg: ProcessedLegInfo,
    confirmationTime: number,
    locationHistory: LocationWithTimestamp[] | undefined,
): number | undefined => {
    const { staticInfo } = leg;
    const { timetable, onRouteStops, filteredRouteWaypoints } = staticInfo;

    if (!timetable) {
        return undefined;
    }

    const lastKnownGoodLocation = getLastKnownGoodLocation((locationHistory || []).concat(lastKnownLocation ?? []));

    if (lastKnownGoodLocation) {
        const closestStop = findClosestStop(lastKnownGoodLocation, filteredRouteWaypoints);
        if (closestStop) {
            const locationValidation = validateLocationForRoute(
                lastKnownGoodLocation,
                filteredRouteWaypoints,
                closestStop,
                isLikelyUnderground(leg.riderLocation, locationHistory),
            );
            const numOfStopsCrossed =
                onRouteStops.findIndex(stop => stop.stopCode === closestStop.lastCrossedStop?.stopCode) + 1;
            const scheduleStartBuffer =
                (numOfStopsCrossed * (MAX_STATIONS_TRAVEL_TIME_SECONDS + STATION_DWELL_TIME) +
                    NETWORK_DELAY_BUFFER_SECONDS) *
                1000;

            if (locationValidation.isValid) {
                const candidateDepartureTimes = getCandidateDepartureTimes(
                    timetable,
                    confirmationTime,
                    scheduleStartBuffer,
                );
                const validSchedule = getValidScheduleAccordingToUserLocation(
                    candidateDepartureTimes,
                    filteredRouteWaypoints,
                    lastKnownGoodLocation,
                    closestStop,
                );
                if (validSchedule) {
                    return validSchedule;
                } else {
                    console.warn('[identifyTrain] No valid schedule found according to user location', {
                        candidateDepartureTimes,
                        filteredRouteWaypoints,
                        lastKnownGoodLocation,
                        closestStop,
                    });
                    return undefined;
                }
            }
        }
    } else {
        console.warn('[identifyTrain] No last known good location found', {
            locationHistory,
            lastKnownLocation,
        });
        return undefined;
    }
    return undefined; // not able to auto detect metro.
};

export const identifyTrainFromStation = (
    currentStopCode: string,
    leg: ProcessedLegInfo,
    confirmationTime: number,
): number => {
    const { staticInfo } = leg;
    const { timetable, onRouteStops } = staticInfo;

    if (!timetable) {
        return confirmationTime;
    }

    const candidateDepartureTimes = timetable
        .map((t: TimeEntry) => t.time)
        .filter((time: number) => time < confirmationTime + 60000) // 1 minute buffer
        .sort((a: number, b: number) => b - a);

    const fallbackConfirmationTime =
        candidateDepartureTimes.length > 0 ? (candidateDepartureTimes[0] ?? confirmationTime) : confirmationTime;

    // Find travel time from origin to current station
    const expectedTravelTime = calculateTravelTimeFromStops(
        staticInfo.origin.stopCode,
        currentStopCode,
        onRouteStops,
        true,
    );

    if (!expectedTravelTime) {
        return fallbackConfirmationTime;
    }

    // Find the departure time that matches with current time and travel time
    for (const departureTime of candidateDepartureTimes) {
        const darkTime = (confirmationTime - departureTime) / 1000; // in seconds
        if (Math.abs(darkTime - expectedTravelTime) < TIME_TOLERANCE_SECONDS) {
            return departureTime;
        }
    }

    return fallbackConfirmationTime;
};

export const verifyInsideVehicle = (context: StrategyContext): VerificationResult => {
    const { leg, locationHistory, isFirstIncompleteLeg } = context;
    const { riderLocation, staticInfo } = leg;

    // if we are very sure about the user to be on the path then return the confirmed state
    // TODO: Check if polyline from both side are accurate
    if (isLocationOnPath(riderLocation, staticInfo.filteredRouteWaypoints, 200, locationHistory, true)) {
        // Only allow confirming INVEHICLE for the first incomplete leg.
        // Prevents future legs from confirming when user is still on a previous leg (e.g., No Auto check-in when walking under metro line).
        if (!isFirstIncompleteLeg) {
            return { status: 'POSSIBLE' };
        }
        return { status: 'CONFIRMED' };
    }

    // if user is not in the bounding box of the path then return the impossibility of this state.
    // TODO: Have some buffer area for bounding boxes as well
    const mostRecentSuperReliableLocation = getMostRecentSuperReliableLocation(locationHistory, 60);
    if (
        mostRecentSuperReliableLocation &&
        !isPointInBoundingBox(mostRecentSuperReliableLocation, getBoundingBox(staticInfo.filteredRouteWaypoints))
    ) {
        return { status: 'IMPOSSIBLE' };
    }

    return { status: 'POSSIBLE' };
};

export const verifyWaitingAtOrigin = (context: StrategyContext): VerificationResult => {
    const { leg, locationHistory } = context;
    const { riderLocation } = leg;

    // TODO: Have some buffer area for station special zone
    if (isLocationDataReliable(riderLocation) && isNearOrigin(leg)) return { status: 'CONFIRMED' };

    const mostRecentSuperReliableLocation = getMostRecentSuperReliableLocation(locationHistory, 60);
    if (
        mostRecentSuperReliableLocation &&
        isFarFromOriginProximity({ ...leg, riderLocation: mostRecentSuperReliableLocation })
    ) {
        if (leg.isFirstLeg && leg.transitMode === 'BUS') {
            return { status: 'POSSIBLE' };
        }
        return { status: 'IMPOSSIBLE' };
    }

    return { status: 'POSSIBLE' };
};

export const verifyWalkOrTaxi = (context: StrategyContext): VerificationResult => {
    const { leg, legs } = context;
    const { riderLocation, staticInfo } = leg;

    // CONSERVATIVE STEP (reliable location check): means user has came out of the previous leg, this will make the transition from exit station screen to walk sreen
    const previousLeg = getPreviousLegOrder(legs, leg.staticInfo.legOrder);
    const isPreviousCompleted =
        !isUndefined(previousLeg) &&
        isFarFromDestination(previousLeg) && // not near previous leg destination (means not inside the previous leg exit station)
        previousLeg.vehicleState !== 'RIDESTARTED'; // if previous leg is still in started that means users hasn't exit the metro he must not be walking
    const isCurrentHappening = isPointInBoundingBox(riderLocation, getBoundingBox(staticInfo.filteredRouteWaypoints)); // user must be on the path

    if (
        isLocationDataSuperReliable(riderLocation) && // as it is conservative step so location should be super reliable
        isPreviousCompleted &&
        isCurrentHappening
    ) {
        if (leg.isLastLeg) return { status: 'POSSIBLE' }; //For last mile, if not RIDE STARTED then keep it POSSIBLE.
        return { status: 'CONFIRMED' };
    }
    // NO IMPOSSIBLE CASE, ALWAYS HAVE THE POSSIBILITY OF THE WALK

    // Always keep the possibilty of this leg until next leg is getting confirmed
    return { status: 'POSSIBLE' };
};
