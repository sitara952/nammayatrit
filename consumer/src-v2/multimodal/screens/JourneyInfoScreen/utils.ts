import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { type journeyLeg } from '@/readOnly/api/types/JourneyLeg.gen';
import { createLegOrder, extractCategories } from '../../utils/journeyTrackingUtils';
import { TimeEntry } from '../NewLiveJourney/screens/TransitTracking/TransitTimetable';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType';
import { MapRef } from '@/typescript/Maps/MapComponent';
import { strings } from 'config-types';
import { mapModeToTransitType } from '../../components/PublicTransportCard/types';
import { getRouteCodeForTransit } from '@/typescript/utils/MultiModal';
import { transportRoute } from '@/readOnly/api/types/PublicTransportData.gen';
import { TransitSummaryType } from './components/TransitSummary';
import { convertDistance } from '@/src-v2/utils/common';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import {
    MultimodalTravelMode_multimodalTravelMode,
    TrackingStatus_trackingStatus,
} from '@/readOnly/api/types/Enums.gen';
import {
    calculateTotalPriceFromCategories,
    getDefaultCategory,
    LegCategorySelections,
} from '../../components/JourneyPayment/Types';
import { calculateTotalFareForLeg } from '../../components/JourneyPayment/journeyPaymentUtils';
import { StaticMarker } from '@/typescript/tracking/trackingTypes';

export const AUTO_PICKUP_TIME_SECONDS = 4 * 60; // 4 minutes in seconds

export const timeInReadableFormat = (totalSeconds: number, userLanguageStrings: strings): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60) + (totalSeconds % 60 >= 40 ? 1 : 0);

    // Construct the time string
    const timeParts = [
        hours > 0 ? `${hours} ${hours > 1 ? userLanguageStrings.Hours : userLanguageStrings.Hour}` : '',
        minutes > 0 ? `${minutes} ${minutes > 1 ? userLanguageStrings.Minutes : userLanguageStrings.Minute}` : '',
    ].filter(Boolean);

    return timeParts.length > 0 ? timeParts.join(' ') : userLanguageStrings.ZeroMinutes;
};

type AvailableSlots = {
    nextSameDayTimeInSeconds: number;
    nextSameDaySlot: string[] | null;
    earliestNextDayTimeInSeconds: number;
    earliestNextDaySlot: string[] | null;
};

/**
 * Finds the next available time from the current time and converts it to 12-hour format.
 * @param scheduleTimes - Array of time slots, each containing start and end times in 24-hour format (HH:MM:SS)
 * @returns Array containing the next available start and end times in 12-hour format [start (hh:mm AM/PM), end (hh:mm AM/PM)]
 *          or null if no available times
 */

export function findNextAvailableTime(scheduleTimes: string[][]): string[] | null {
    if (!Array.isArray(scheduleTimes) || scheduleTimes.length === 0) {
        return null;
    }

    const now = new Date();

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();

    const currentTimeInSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

    const result = scheduleTimes.reduce<AvailableSlots>(
        (acc, timeSlot) => {
            if (
                !Array.isArray(timeSlot) ||
                timeSlot.length < 2 ||
                typeof timeSlot[0] !== 'string' ||
                typeof timeSlot[1] !== 'string'
            ) {
                return acc;
            }

            const startTime = timeSlot[0];

            const startTimeParts = startTime.split(':');
            if (startTimeParts.length < 2) {
                return acc;
            }

            const startHours = startTimeParts[0] || '0';
            const startMinutes = startTimeParts[1] || '0';
            const startSeconds = startTimeParts[2] || '00';

            const startHoursNum = parseInt(startHours, 10);
            const startMinutesNum = parseInt(startMinutes, 10);
            const startSecondsNum = parseInt(startSeconds, 10);

            if (isNaN(startHoursNum) || isNaN(startMinutesNum) || isNaN(startSecondsNum)) {
                return acc;
            }

            const startTimeInSeconds = startHoursNum * 3600 + startMinutesNum * 60 + startSecondsNum;

            if (startTimeInSeconds > currentTimeInSeconds && startTimeInSeconds < acc.nextSameDayTimeInSeconds) {
                return {
                    ...acc,
                    nextSameDayTimeInSeconds: startTimeInSeconds,
                    nextSameDaySlot: timeSlot,
                };
            } else if (
                startTimeInSeconds < currentTimeInSeconds &&
                startTimeInSeconds < acc.earliestNextDayTimeInSeconds
            ) {
                return {
                    ...acc,
                    earliestNextDayTimeInSeconds: startTimeInSeconds,
                    earliestNextDaySlot: timeSlot,
                };
            }

            return acc;
        },
        {
            nextSameDayTimeInSeconds: Infinity,
            nextSameDaySlot: null,
            earliestNextDayTimeInSeconds: Infinity,
            earliestNextDaySlot: null,
        },
    );

    const resultSlot = result.nextSameDaySlot || result.earliestNextDaySlot;

    if (!resultSlot) {
        return null;
    }

    const startTime12Hour = convertTo12HourFormat(resultSlot[0]);
    const endTime12Hour = convertTo12HourFormat(resultSlot[1]);

    return [startTime12Hour, endTime12Hour];
}

/**
 * Converts time from 24-hour format to 12-hour format.
 * @param time - Time in 24-hour format (HH:MM:SS)
 * @returns Time in 12-hour format (hh:mm AM/PM)
 */
function convertTo12HourFormat(time: string | undefined): string {
    if (!time) {
        return '';
    }

    const parts = time.split(':');
    if (parts.length < 2) {
        return '';
    }

    const hoursStr = parts[0] || '0';
    const minutesStr = parts[1] || '00';

    const hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, '0');

    if (isNaN(hours)) {
        return '';
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    return `${hours12}:${minutes} ${period}`;
}

export const formatArrivalTime = (minutes: number, userLanguageStrings: strings) => {
    if (minutes === 0) {
        return userLanguageStrings.Now;
    }
    if (minutes > 59) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}${hrs > 1 ? userLanguageStrings.Hours : userLanguageStrings.Hour}${mins > 0 ? ` ${mins}${userLanguageStrings.Minute}` : ''}`;
    }
    return `${minutes} ${userLanguageStrings.Minute}`;
};

// Utility function to calculate end time from start time and legs
export const calculateEndTime = (startTime: string | undefined, legs: legInfo[] | undefined): string | undefined => {
    if (!startTime || !legs || legs.length === 0) return undefined;

    try {
        // Calculate total duration from legs (duration is now pre-processed at source)
        const totalDuration = legs.reduce((total, leg) => total + (leg.estimatedDuration || 0), 0);

        const startDate = new Date(startTime);
        const endDate = new Date(startDate.getTime() + totalDuration * 1000); // duration is in seconds
        return endDate.toISOString();
    } catch (error) {
        console.error('Error calculating end time:', error);
        return undefined;
    }
};

export const getMaxStepperValue = (
    hasSubwayLeg: boolean,
    currentAdult: number,
    currentChildren: number,
    isForAdult: boolean,
    appName: string,
): number => {
    if (hasSubwayLeg) {
        if (isForAdult) {
            return Math.max(0, 4 - currentChildren);
        } else {
            return Math.max(0, 4 - currentAdult);
        }
    }
    return appName === 'nammaYatri' ? 6 : 5;
};

// Legacy validation - kept for backward compatibility
export const validateTicketCount = (hasSubwayLeg: boolean, totalTicketCount: number): boolean => {
    if (hasSubwayLeg) {
        return totalTicketCount <= 4;
    }
    return true;
};

// Dynamic validation with hardcoded max values (Option B)
// Max tickets: Subway = 4, Others = 5 (can be made configurable later)
export const validateTotalTicketCount = (totalCount: number, maxTickets: number | undefined): boolean => {
    const maxAllowed = maxTickets !== undefined ? maxTickets : 6; // Default max
    return totalCount <= maxAllowed;
};

// Get max tickets based on leg type (hardcoded for now)
export const getMaxTicketsForLeg = (hasSubwayLeg: boolean): number => {
    return hasSubwayLeg ? 4 : 5;
};

/**
 * Calculate total journey duration with consistent rounding
 * Converts each leg duration to minutes, rounds down, then converts back to seconds
 * This ensures consistency between total time and individual leg times
 * @param journeyLegs Array of v2 journey legs
 * @returns Total duration in seconds with consistent rounding
 */
export const calculateTotalJourneyDurationWithConsistentRounding = (
    journeyLegs: journeyLeg[],
    isETATimeAdded: boolean,
): number => {
    // eslint-disable-next-line functional/no-let
    let totalTimeMs = new Date().getTime();
    const totalMinutes = journeyLegs.reduce((total, leg, index) => {
        // eslint-disable-next-line functional/no-let
        let legDuration = leg.duration || 0;
        if (leg.journeyMode === 'Taxi' && index === 0) {
            legDuration += isETATimeAdded ? AUTO_PICKUP_TIME_SECONDS : 0;
        }
        const legMinutes = Math.round(legDuration / 60);
        totalTimeMs = new Date(totalTimeMs + legMinutes * 60 * 1000).getTime();
        return total + legMinutes;
    }, 0);

    // Convert total minutes back to seconds
    return totalMinutes * 60;
};

/**
 * Calculate cumulative time from first leg start time up to a specific leg
 * @param legs Array of all journey legs
 * @param targetLegIndex Index of the leg to calculate time up to (exclusive)
 * @returns Time in milliseconds from first leg start to target leg
 */
export const calculateCumulativeTimeUpToLeg = (
    legs: legInfo[],
    targetLegIndex: number,
    isETATimeAdded: boolean,
): number => {
    //eslint-disable-next-line functional/no-let
    let cumulativeTimeMs = new Date().getTime();
    //eslint-disable-next-line functional/no-let
    for (let i = 0; i < targetLegIndex; i++) {
        const leg = legs[i];
        if (leg?.estimatedDuration) {
            cumulativeTimeMs +=
                Math.floor(leg.estimatedDuration / 60) * 60000 +
                (isETATimeAdded && leg.travelMode === 'Taxi' ? AUTO_PICKUP_TIME_SECONDS : 0);
        }
    }
    return cumulativeTimeMs;
};

export const calculateMetroTimeInSeconds = (
    targetTime: number, // Target time in milliseconds
    currentLeg: legInfo | undefined, // Current metro leg
    legTimetables: Record<string, TimeEntry[]> | undefined, // All leg timetables (optional for now)
    isETATimeAdded: boolean,
): number => {
    if (legTimetables && currentLeg && isETATimeAdded) {
        const timetableKey = createLegOrder(currentLeg);
        const metroTimetable = legTimetables[timetableKey] || [];
        if (metroTimetable && metroTimetable.length > 0) {
            const nextMetroTime = metroTimetable.find(entry => entry.time > targetTime);

            if (nextMetroTime) {
                const waitTimeMs = nextMetroTime.time - targetTime;
                const waitTimeSeconds = Math.max(0, Math.floor(waitTimeMs / 1000));
                const travelDurationSeconds = currentLeg.estimatedDuration || 0;
                if (waitTimeSeconds > 0) {
                    return waitTimeSeconds + travelDurationSeconds;
                }
                return travelDurationSeconds;
            }
        }
    }
    return currentLeg?.estimatedDuration || 0;
};

/**
 * Calculate and return both updated legs and total duration with consistent rounding for legInfo format
 * Updates each leg's estimatedDuration with corrected values and calculates total journey duration
 * This ensures consistency between total time and individual leg times
 * @param legs Array of journey legs (legInfo format)
 * @returns Object containing updated legs array and total duration in seconds
 */
export const calculateAndUpdateLegsWithConsistentRounding = (
    legs: legInfo[],
    legTimetables: Record<string, TimeEntry[]> | undefined,
    isETATimeAdded: boolean,
): {
    updatedLegs: legInfo[];
    totalDuration: number;
} => {
    // eslint-disable-next-line functional/no-let
    let totalDuration = 0;
    const updatedLegs = legs.map((leg, index) => {
        const baseDuration = leg.estimatedDuration || 0;
        const legDuration = (() => {
            if (leg.travelMode === 'Taxi' && index === 0) {
                // Add pickup time buffer for first taxi leg
                return baseDuration + (isETATimeAdded ? AUTO_PICKUP_TIME_SECONDS : 0);
            } else if (leg.travelMode === 'Metro' && index > 0) {
                const cumulativeTimeMs = calculateCumulativeTimeUpToLeg(legs, index, isETATimeAdded);
                if (cumulativeTimeMs > 0) {
                    return calculateMetroTimeInSeconds(cumulativeTimeMs, leg, legTimetables, isETATimeAdded);
                }
                return leg.estimatedDuration || 0;
            } else {
                return baseDuration;
            }
        })();
        const legMinutes = Math.floor(legDuration / 60);
        const correctedDuration = legMinutes * 60;
        totalDuration += correctedDuration;
        return {
            ...leg,
            estimatedDuration: correctedDuration,
        };
    });

    return {
        updatedLegs,
        totalDuration,
    };
};
export const extractDistrictOfferCode = (districtOffer: string[] | undefined): string | null => {
    if (!districtOffer) return null;
    if (districtOffer[0] && districtOffer[0] === 'Valid' && districtOffer[1] && districtOffer[1].length > 0) {
        return districtOffer[1];
    }
    return null;
};

export const recenterMap = (
    journeyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>,
    mapRef: React.RefObject<MapRef | null>,
    bottomPad: number,
    userLocationCoords: StaticMarker | null,
) => {
    // Extract coordinates from all routes in journeyMapData
    if (!journeyMapData) return;
    const coords = Object.values(journeyMapData)
        .flatMap(routeData => {
            // Handle both single route and array of routes
            if (Array.isArray(routeData)) {
                return routeData.flatMap(route => route?.coordinates || []);
            }
            return routeData?.coordinates || [];
        })
        .filter(coord => coord && coord.latitude && coord.longitude);

    const allCoordinates = userLocationCoords
        ? [
              ...coords,
              {
                  latitude: userLocationCoords.location.latitude,
                  longitude: userLocationCoords.location.longitude,
              },
          ]
        : coords;

    if (allCoordinates.length > 0) {
        mapRef.current?.addMapPadding({
            top: 60,
            bottom: bottomPad,
            left: undefined,
            right: undefined,
        });
        // First fit to coordinates with proper parameter structure
        mapRef.current?.fitToCoordinatesSerialized({
            coordinates: allCoordinates,
            duration: 600,
        });
    }
};

export const hasUserBoardedTaxi = (trackingStatus: TrackingStatus_trackingStatus | undefined): boolean => {
    if (!trackingStatus) return false;

    const boardedStatuses: TrackingStatus_trackingStatus[] = ['Ongoing', 'Finishing', 'ExitingStation', 'Finished'];

    return boardedStatuses.includes(trackingStatus);
};

export const formatNumber = (num: number): number => {
    return Math.round(num);
};

export const buildJourneySegments = (
    legs: legInfo[] | undefined,
    legCategorySelections: LegCategorySelections | undefined,
    getRouteByCode: (routeCode: string) => transportRoute | undefined,
    fromJourneyInfoScreen: boolean,
): TransitSummaryType[] => {
    return (
        legs?.map((item: legInfo) => {
            const { cost, costWithQuantity } = (() => {
                if (legCategorySelections) {
                    const legCategorySelection = legCategorySelections.find(l => l.legOrder === item.order);
                    if (legCategorySelection) {
                        const cost =
                            getDefaultCategory(legCategorySelection.categories, 'MALE')?.categoryOfferedPrice?.amount ??
                            0;
                        const costWithQuantity = calculateTotalFareForLeg(
                            legCategorySelection.categories,
                            legCategorySelection.selections,
                        );
                        return { cost, costWithQuantity };
                    }
                } else {
                    const categories = extractCategories(item);
                    const cost = getDefaultCategory(categories, 'MALE')?.categoryOfferedPrice?.amount ?? 0;
                    const costWithQuantity = calculateTotalPriceFromCategories(categories);
                    return { cost, costWithQuantity };
                }
                return {
                    cost: item.estimatedMinFare?.amount ?? 0,
                    costWithQuantity: item.estimatedMinFare?.amount ?? 0,
                };
            })();
            return {
                type: mapModeToTransitType(
                    item.travelMode,
                    item.legExtraInfo.TAG === 'Taxi' ? item.legExtraInfo._0.serviceTierName : undefined,
                ),
                cost: formatNumber(cost || 0),
                costWithQuantity: formatNumber(costWithQuantity || 0),
                distance: item.estimatedDistance ?? null,
                routeCode: ['Bus', 'Subway'].includes(item.legExtraInfo.TAG)
                    ? (getRouteCodeForTransit(item, getRouteByCode) ?? null)
                    : null,
                busStopsCount:
                    item.legExtraInfo.TAG === 'Bus' ? item.legExtraInfo._0?.alternateShortNames.length : undefined,
                time: item.estimatedDuration,
                legOrder: item.order,
                metroLineColor:
                    item.legExtraInfo.TAG === 'Metro' ? item.legExtraInfo._0?.routeInfo.at(0)?.lineColor : undefined,
                isSkipped:
                    !fromJourneyInfoScreen &&
                    item.legExtraInfo.TAG === 'Taxi' &&
                    (!hasUserBoardedTaxi(item.legExtraInfo._0?.trackingStatus) ||
                        item.legExtraInfo._0?.bookingId == null),
                bookingAllowed: item.bookingAllowed,
                hasApplicablePasses: item.hasApplicablePasses ?? false,
            };
        }) || []
    );
};

export const calculateAutoFare = (totalDistance: number) => {
    return 65 + (totalDistance - 2) * 14;
};

export const computeJourneySavings = (
    journeyResp: journeyInfoResp | undefined,
    journeySegments: TransitSummaryType[],
    journeyCost: number,
): {
    costSaved: number;
    timeSaved: number;
} => {
    const totalDistanceInKm =
        journeyResp?.legs?.reduce((sum, leg) => {
            const distance = leg.estimatedDistance?.value || 0;
            const unit = leg.estimatedDistance?.unit || 'Meter';
            const distanceInKm = convertDistance(distance, unit, 'Kilometer');
            return sum + distanceInKm;
        }, 0) || 0;
    const autoSpeedKmH = 20;
    const directRideFare = totalDistanceInKm > 0 ? Math.max(0, calculateAutoFare(totalDistanceInKm)) : 0;
    const costSaved = directRideFare && journeyCost ? Math.round(directRideFare - journeyCost) : 0;

    const totalJourneyTimeInSec = journeySegments.reduce((sum, leg) => sum + (leg.time || 0), 0);
    const totalJourneyTimeMins = totalJourneyTimeInSec ? totalJourneyTimeInSec / 60 : 0;

    const normalRideTimeMins = totalDistanceInKm > 0 && autoSpeedKmH > 0 ? (totalDistanceInKm / autoSpeedKmH) * 60 : 0;
    const timeSaved =
        normalRideTimeMins && totalJourneyTimeMins ? Math.round(normalRideTimeMins - totalJourneyTimeMins) : 0;

    return {
        costSaved,
        timeSaved,
    };
};

export const getLastStopForMetroLeg = (
    journeyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>,
    legOrder: number,
): string | undefined => {
    const mapData = journeyMapData[legOrder];
    if (mapData && Array.isArray(mapData)) {
        // For Metro, it's typically an array of routes
        return mapData[0]?.lastStop?.name;
    } else if (mapData && !Array.isArray(mapData)) {
        return mapData.lastStop?.name;
    }
    return undefined;
};

export const isTransitLeg = (mode: MultimodalTravelMode_multimodalTravelMode | undefined) =>
    mode !== 'Walk' && mode !== 'Taxi';
