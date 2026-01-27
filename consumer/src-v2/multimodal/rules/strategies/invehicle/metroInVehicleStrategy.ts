import { IJourneyStrategy, StrategyContext, VerificationResult } from '../types';
import { round } from 'lodash';
import { ConfirmedBoardingData, ProcessedLegInfo, Stop, VehicleState } from '@/src-v2/multimodal/types/journeyTracking';
import {
    calculateFullJourneyTime,
    calculateTravelTime,
    calculateTravelTimeFromStops,
} from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import {
    findClosestStop,
    identifyTrain,
    isLocationDataSuperReliable,
    STATION_DWELL_TIME,
    verifyInsideVehicle,
} from '../common';
import { setConfirmedBoardingDataInCache } from '@/src-v2/multimodal/utils/cache';
import { calculateDistance } from '@/src-v2/multimodal/utils/PublicTransportUtils';
import { logger } from '@/src-v2/systems/logger';

const RIDECLOSETODESTINATION_THRESHOLD_SECONDS = 30;
const ARRIVEDATSTATIONPLATFORM_THRESHOLD_SECONDS = 30;
const ARRIVAL_BUFFER_SECONDS = 15;

export class MetroInVehicleStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        const { leg } = context;
        const { staticInfo, realTimeInfo } = leg;
        if (realTimeInfo.confirmedBoardingData) {
            const expectedTravelTime = calculateFullJourneyTime(staticInfo.onRouteStops);
            const expectedArrivalTime =
                realTimeInfo.confirmedBoardingData.confimationTimestamp + expectedTravelTime * 1000;
            if (new Date().getTime() <= expectedArrivalTime) {
                return { status: 'CONFIRMED' };
            }
            return { status: 'POSSIBLE' };
        }

        return verifyInsideVehicle(context);
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const { staticInfo, riderLocation, realTimeInfo } = leg;
        const { confirmedBoardingData: detectedConfirmedData } = realTimeInfo;

        // eslint-disable-next-line functional/no-let
        let confimationTimestamp =
            detectedConfirmedData?.confimationTimestamp ??
            identifyTrain(riderLocation, leg, new Date().getTime(), context.locationHistory);

        if (!confimationTimestamp) {
            return leg;
        }
        const elapsedTimeSeconds = (new Date().getTime() - confimationTimestamp) / 1000;

        // eslint-disable-next-line functional/no-let
        let accumulatedTime = 0;
        // eslint-disable-next-line functional/no-let
        let timeBasedStop: Stop | undefined = staticInfo.onRouteStops[0];

        // eslint-disable-next-line functional/no-let
        for (let i = 0; i < staticInfo.onRouteStops.length - 1; i++) {
            const currStop = staticInfo.onRouteStops[i];
            if (!currStop) continue;
            const stopArrivalTime = accumulatedTime + currStop.timeFromPrev - (i === 0 ? 0 : ARRIVAL_BUFFER_SECONDS);
            accumulatedTime += currStop.timeFromPrev + (i === 0 ? 0 : STATION_DWELL_TIME);
            if (elapsedTimeSeconds < stopArrivalTime) {
                timeBasedStop = currStop;
                break;
            }
        }
        if (elapsedTimeSeconds > accumulatedTime) {
            timeBasedStop = staticInfo.onRouteStops[staticInfo.onRouteStops.length - 1];
        }

        // eslint-disable-next-line functional/no-let
        let currentStop: Stop | undefined = timeBasedStop;
        const isLocationDataSuperReliable0 = isLocationDataSuperReliable(riderLocation);
        // eslint-disable-next-line functional/no-let
        let confirmedBoardingData: ConfirmedBoardingData | undefined = detectedConfirmedData;
        if (isLocationDataSuperReliable0) {
            const locationBasedStop = findClosestStop(riderLocation, staticInfo.filteredRouteWaypoints);
            if (locationBasedStop && timeBasedStop) {
                const timeBasedStopIndex = staticInfo.onRouteStops.findIndex(
                    s => s.stopCode === timeBasedStop?.stopCode,
                );
                const locationBasedStopIndex = staticInfo.onRouteStops.findIndex(
                    s => s.stopCode === locationBasedStop?.lastCrossedStop?.stopCode,
                );

                // Choose next stop as display currentStop when within ~150m of it
                const upcomingStop = locationBasedStop.nextStop;
                const isNearUpcomingStop =
                    upcomingStop && upcomingStop.lat && upcomingStop.lon
                        ? calculateDistance(riderLocation.lat, riderLocation.lon, upcomingStop.lat, upcomingStop.lon) <=
                          150
                        : false;

                currentStop = isNearUpcomingStop ? upcomingStop : locationBasedStop.lastCrossedStop;
                if (locationBasedStop.lastCrossedStop && locationBasedStopIndex < timeBasedStopIndex - 1) {
                    // if location based stop is 2 stops before time based stop, we can update the confirmed boarding time
                    const isFinalDestination =
                        locationBasedStop.lastCrossedStop?.stopCode === staticInfo.destination.stopCode;
                    const scheduledTravelTime = calculateTravelTimeFromStops(
                        staticInfo.origin.stopCode,
                        locationBasedStop.lastCrossedStop?.stopCode,
                        staticInfo.onRouteStops,
                        !isFinalDestination, // true if not final destination, false if at final destination
                    );
                    if (scheduledTravelTime) {
                        const now = new Date().getTime();
                        confimationTimestamp = now - scheduledTravelTime * 1000;
                        confirmedBoardingData = {
                            confimationTimestamp,
                            lastCrossedStopCode: locationBasedStop.lastCrossedStop?.stopCode,
                            detectedWithSuperReliableLocation: true,
                        };
                    }
                }
            }

            // when UI already consumed a stop which is 1 stop ahead of above location-based stop, don't regress.
            const previousDisplayedStopIndex = leg.realTimeInfo.currentStop
                ? staticInfo.onRouteStops.findIndex(s => s.stopCode === leg.realTimeInfo.currentStop?.stopCode)
                : -1;
            const newStopIndex = currentStop
                ? staticInfo.onRouteStops.findIndex(s => s.stopCode === currentStop?.stopCode)
                : -1;

            if (previousDisplayedStopIndex >= 0 && newStopIndex >= 0 && previousDisplayedStopIndex - newStopIndex === 1)
                currentStop = leg.realTimeInfo.currentStop;
        }

        const lastCrossedStopIndex = staticInfo.onRouteStops.findIndex(
            s => s.stopCode === detectedConfirmedData?.lastCrossedStopCode,
        );

        const currentStopIndex = staticInfo.onRouteStops.findIndex(s => s.stopCode === currentStop?.stopCode);

        if (detectedConfirmedData?.detectedWithSuperReliableLocation && lastCrossedStopIndex > currentStopIndex) {
            currentStop = staticInfo.onRouteStops[lastCrossedStopIndex];
        }

        logger.logDebug(
            `Journey Id: ${context.journeyId || 'No Journey Id'}, DEBUG_METRO_INVEHICLE_STRATEGY_UPDATE: ${JSON.stringify(
                {
                    currentStop,
                    riderLocation,
                    confirmedBoardingData,
                    isLocationDataSuperReliable: isLocationDataSuperReliable0,
                },
            )}`,
            'MultimodalTracking',
        );

        // Persist true last crossed stop in cache to avoid overwriting with current stop in near upcoming stop scenario
        const closestStop = isLocationDataSuperReliable0
            ? findClosestStop(riderLocation, staticInfo.filteredRouteWaypoints)
            : undefined;

        const lastCrossedStopCode = closestStop?.lastCrossedStop?.stopCode ?? currentStop?.stopCode;

        setConfirmedBoardingDataInCache(context.journeyId, leg.staticInfo.legOrder, {
            confimationTimestamp: confimationTimestamp,
            lastCrossedStopCode: lastCrossedStopCode,
            detectedWithSuperReliableLocation: confirmedBoardingData?.detectedWithSuperReliableLocation ?? false,
        });

        const remainingStops = currentStop
            ? staticInfo.onRouteStops.length -
              1 -
              staticInfo.onRouteStops.findIndex(s => s.stopCode === currentStop?.stopCode)
            : 0;

        const journeyTime = calculateFullJourneyTime(staticInfo.onRouteStops);
        const boardingTimestamp = confirmedBoardingData?.confimationTimestamp ?? confimationTimestamp;
        const expectedArrivalTime = boardingTimestamp + journeyTime * 1000;
        const destinationEta = Math.max(0, round((expectedArrivalTime - new Date().getTime()) / 1000 / 60));

        if (destinationEta === 0) {
            currentStop = staticInfo.onRouteStops[staticInfo.onRouteStops.length - 1];
        }

        const vehicleState = this.determineVehicleState(
            leg,
            currentStop,
            destinationEta,
            confirmedBoardingData?.confimationTimestamp ?? confimationTimestamp,
        );

        return {
            ...leg,
            userState: 'INVEHICLE',
            vehicleState,
            insideSpecialZone: leg.insideSpecialZone,
            realTimeInfo: {
                ...leg.realTimeInfo,
                currentStop,
                remainingStops,
                confirmedBoardingData,
                destinationStopETAInMinutes: destinationEta,
            },
        };
    }

    private determineVehicleState(
        leg: StrategyContext['leg'],
        currentStop: Stop | undefined,
        _destinationEta: number,
        confirmedBoardingTime: number,
    ): VehicleState {
        const destinationStopCode = leg.staticInfo.destination.stopCode;
        const preDestinationStopCode = leg.staticInfo.preDestination.stopCode;

        const { distance } = calculateTravelTime(leg.riderLocation, leg.staticInfo.destination.latLong, [
            { mode: 'METRO', changeoverPoint: leg.staticInfo.destination.latLong },
        ]);

        if (currentStop?.stopCode === destinationStopCode) {
            if (distance <= 200 && isLocationDataSuperReliable(leg.riderLocation)) {
                // if current stop is destination as per time table and we are within 200 meters of destination, we are at destination
                return 'ARRIVEDATSTATIONPLATFORM';
            }
            if (!isLocationDataSuperReliable(leg.riderLocation)) {
                const totalJourneyTime = calculateFullJourneyTime(leg.staticInfo.onRouteStops); // seconds
                const estimatedArrivalTime = confirmedBoardingTime + totalJourneyTime * 1000;
                const currentTime = new Date().getTime();
                const timeAtDestination = (currentTime - estimatedArrivalTime) / 1000;
                if (timeAtDestination >= ARRIVEDATSTATIONPLATFORM_THRESHOLD_SECONDS) {
                    return 'ARRIVEDATSTATIONPLATFORM';
                }
            }
            return 'RIDECLOSETODESTINATION';
        }

        if (
            currentStop?.stopCode === preDestinationStopCode &&
            isLocationDataSuperReliable(leg.riderLocation) &&
            !leg.insideSpecialZone
        ) {
            const distanceFromCurrentLocationToDestination = calculateDistance(
                leg.riderLocation.lat,
                leg.riderLocation.lon,
                leg.staticInfo.destination.latLong.lat,
                leg.staticInfo.destination.latLong.lon,
            );
            if (distanceFromCurrentLocationToDestination < 100) {
                return 'ARRIVEDATSTATIONPLATFORM';
            } else if (distanceFromCurrentLocationToDestination < 300) {
                return 'RIDECLOSETODESTINATION';
            } else {
                return 'RIDESTARTED';
            }
        }
        if (currentStop?.stopCode === preDestinationStopCode && !leg.insideSpecialZone) {
            const travelTimeToPreDestination = calculateTravelTimeFromStops(
                leg.staticInfo.origin.stopCode,
                preDestinationStopCode,
                leg.staticInfo.onRouteStops,
                true, // isIdentifyTrainCall
            );
            if (travelTimeToPreDestination !== undefined) {
                const estimatedArrivalAtPreDestination = confirmedBoardingTime + travelTimeToPreDestination * 1000;
                const currentTime = new Date().getTime();
                const timeAtPreDestinationStop = currentTime - estimatedArrivalAtPreDestination;
                if (timeAtPreDestinationStop >= RIDECLOSETODESTINATION_THRESHOLD_SECONDS * 1000) {
                    return 'RIDECLOSETODESTINATION';
                }
            }
        }
        return 'RIDESTARTED';
    }
}
