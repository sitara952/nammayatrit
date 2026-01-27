import { TransitMode, type ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { AdditionalBusInfoProps, InStationZoneProps, LiveJourneyDetailViewData, NextLegProps } from './Types';
import { DetailedLiveHeaderProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/DetailedLiveHeader';
import type { DetailedTransitTrackingUIProps } from '@/src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/DetailedTransitTrackingUI';
import type {
    StopMapping,
    TransitTrackingProps,
} from '@/src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/TransitTracking';
import type { MiniTransitInfoProps } from '@/src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/components/MiniTransitInfo';
import type { MultimodalTravelMode_multimodalTravelMode as Enums_MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import type {
    CurrentLegSplitUpProps,
    LegItemData,
} from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/CurrentLegSplitUp';
import type { MiniBusTrackingProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/MiniBusTracking';
import type { RateTransitProps } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/RateTransit';
import { capitalize } from 'lodash';
import { TransitTimetableUIProps } from '../NewLiveJourney/screens/TransitTracking/TransitTimetable';
import * as JourneyActionHandlers from '@/src-v2/multimodal/rules/JourneyActionHandlers';
import { HandlerContext } from '@/src-v2/multimodal/rules/JourneyActionHandlers';
import { getNextLegOrder, getOrder } from '../../utils/journeyTrackingUtils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Linking } from 'react-native';
import { BookAutoToastProps } from '../NewLiveJourney/components/BookAuto/BookAutoToast';
import { NextWalkLegInfoProps } from '../NewLiveJourney/components/NextWalkLegInfo/NextWalkLegInfo';
import { NextPubicLegInfoProps } from '../NewLiveJourney/components/NextPubicLegInfo/NextPubicLegInfo';
import { setJourneyRoute } from '@/typescript/state/client/search';
import { strings } from 'config-types';
import { createRef } from 'react';
import { getUserLanguageStringsForMode } from '../../utils/BusServiceUtils';
import { checkTaxiLeg } from '@/typescript/utils/common';

// --- Utility Functions ---
export const formatTime = (timestampInput: string | number | undefined): string => {
    if (timestampInput === undefined) return '-:--pm';
    const date = typeof timestampInput === 'string' ? new Date(timestampInput) : new Date(timestampInput);
    if (isNaN(date.getTime())) return '-:--pm';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDistance = (distanceInMeters: number, userLanguageStrings: strings): string => {
    if (distanceInMeters >= 1000) {
        return `${(distanceInMeters / 1000).toFixed(1)}${userLanguageStrings.km}`;
    }
    return `${distanceInMeters.toFixed(0)}${userLanguageStrings.m}`;
};

export const getStopString = (mode: TransitMode, userLanguageStrings: strings): string => {
    if (mode === 'BUS') return userLanguageStrings.Stops;
    return userLanguageStrings.station;
};

// --- DetailedLiveHeader Props Builders ---
export const buildDetailedLiveHeaderProps = (
    currentLeg: ProcessedLegInfo,
    title: string,
    info: string,
    isInTransitHeader: boolean,
): DetailedLiveHeaderProps => {
    const remainingStops = currentLeg.realTimeInfo.remainingStops;
    return {
        isInTransitHeader,
        title,
        icon: currentLeg.staticInfo.travelMode,
        info,
        noOfStops: remainingStops ?? (isInTransitHeader ? -1 : 0),
        isLoading: false,
    };
};

export const getRideSkippedPreboardingHeaderContent = (
    currentLeg: ProcessedLegInfo,
    allLegs: ProcessedLegInfo[],
    userLanguageStrings: strings,
): { title: string; info: string } => {
    const toName = currentLeg.staticInfo.destination.stationName ?? 'End';
    const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);

    const title = userLanguageStrings.RideSkippedPleaseReachOffline(toName);
    const info = (() => {
        if (nextLeg) {
            const nextLegOriginStopETAMinutes = Math.max(nextLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0);
            const nextLegTravelModeDisplay =
                nextLeg.staticInfo.travelMode === 'Subway'
                    ? userLanguageStrings.Train
                    : getUserLanguageStringsForMode(nextLeg?.staticInfo.travelMode ?? '', userLanguageStrings);
            return (
                userLanguageStrings.VehicleArrivesAtDestinationIn(
                    nextLegTravelModeDisplay,
                    toName,
                    nextLegOriginStopETAMinutes > 0
                        ? nextLegOriginStopETAMinutes.toString()
                        : userLanguageStrings.NextFew,
                ) +
                ' ' +
                userLanguageStrings.Mins
            );
        }
        return currentLeg.realTimeInfo.destinationStopETAInMinutes
            ? userLanguageStrings.YouWillReachIn(
                  currentLeg.realTimeInfo.destinationStopETAInMinutes === 0
                      ? userLanguageStrings.Now
                      : `${currentLeg.realTimeInfo.destinationStopETAInMinutes} ${userLanguageStrings.Mins}`,
              )
            : userLanguageStrings.BookDirectRideTo(toName);
    })();
    return { title, info };
};

export const getVehicleMissedPreboardingHeaderContent = (
    currentLeg: ProcessedLegInfo,
    userLanguageStrings: strings,
): { title: string; info: string } => {
    const toName = currentLeg.staticInfo.destination.stationName ?? userLanguageStrings.End;
    const currentLegTravelModeDisplay =
        currentLeg.staticInfo.travelMode === 'Subway'
            ? userLanguageStrings.Train
            : getUserLanguageStringsForMode(currentLeg.staticInfo.travelMode ?? '', userLanguageStrings);
    const title = userLanguageStrings.NoVehicleAvailablePleaseReachOffline(
        currentLeg.vehicleIdentifier ?? '',
        currentLegTravelModeDisplay,
        toName,
    );
    const info = userLanguageStrings.CheckTimetableForNextArrival(
        getUserLanguageStringsForMode(currentLegTravelModeDisplay ?? '', userLanguageStrings),
    );
    return { title, info };
};

export const getWalkTaxiPreboardingHeaderContent = (
    currentLeg: ProcessedLegInfo,
    allLegs: ProcessedLegInfo[],
    distanceValue: number | undefined,
    userLanguageStrings: strings,
): { title: string; info: string } => {
    const toName = currentLeg.staticInfo.destination.stationName ?? userLanguageStrings.End;
    const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
    const nextLegOriginStopETAMinutes = nextLeg?.realTimeInfo.originStopETAInMinutes ?? 0;
    const currentLegDestinationStopETAMinutes = currentLeg.realTimeInfo.destinationStopETAInMinutes ?? 0;
    const waitAtNextStop = nextLegOriginStopETAMinutes - currentLegDestinationStopETAMinutes;
    const nextLegTravelModeDisplay =
        nextLeg?.staticInfo.travelMode === 'Subway'
            ? userLanguageStrings.Train
            : getUserLanguageStringsForMode(nextLeg?.staticInfo.travelMode ?? '', userLanguageStrings);

    const nextAvailableTime = nextLeg?.realTimeInfo?.upcomingVehicleArrivals ?? [];
    const distance = distanceValue ?? currentLeg.distanceValue;
    const title = `${capitalize(getUserLanguageStringsForMode(currentLeg.transitMode ?? '', userLanguageStrings))} ${distance ? formatDistance(distance, userLanguageStrings) : ''} ${userLanguageStrings.To} ${toName}`;
    const info =
        waitAtNextStop >= -2 && nextLeg // adding -2 minutes of buffer time to account for the delay in the vehicle reaching the stop
            ? waitAtNextStop > 0
                ? userLanguageStrings.YouWillReachMinsBefore(
                      waitAtNextStop,
                      getUserLanguageStringsForMode(nextLegTravelModeDisplay ?? '', userLanguageStrings),
                  )
                : userLanguageStrings.YouWillReachJustInTimeFor(
                      getUserLanguageStringsForMode(nextLegTravelModeDisplay ?? '', userLanguageStrings),
                  )
            : nextLegTravelModeDisplay
              ? nextAvailableTime.length > 0
                  ? userLanguageStrings.NextVehicleScheduledIn(
                        getUserLanguageStringsForMode(nextLegTravelModeDisplay ?? '', userLanguageStrings),
                        nextAvailableTime[0] ?? 0,
                    )
                  : userLanguageStrings.YouWillMissLastScheduledVehicle(
                        getUserLanguageStringsForMode(nextLegTravelModeDisplay ?? '', userLanguageStrings),
                    )
              : userLanguageStrings.YouWillReachIn(
                    currentLegDestinationStopETAMinutes === 0
                        ? userLanguageStrings.Now
                        : `${currentLegDestinationStopETAMinutes} ${userLanguageStrings.Mins}`,
                );
    return { title, info };
};

export const getBusPreboardingHeaderContent = (
    currentLeg: ProcessedLegInfo,
    userLanguageStrings: strings,
): { title: string; info: string } => {
    const toName = currentLeg.staticInfo.destination.stationName ?? 'End';
    const currentLegOriginStopETAMinutes = Math.max(currentLeg.realTimeInfo.originStopETAInMinutes ?? 0, 0);
    const initialTitle = userLanguageStrings.TakeBusToDestination(currentLeg.vehicleIdentifier ?? '', toName);
    const initialInfo = userLanguageStrings.BusArrivesIn(
        currentLegOriginStopETAMinutes > 0 ? `${currentLegOriginStopETAMinutes}` : userLanguageStrings.NextFew,
    );

    if (currentLeg.vehicleState === 'VEHICLEALMOSTARRIVED') {
        const newTitle = userLanguageStrings.BusIsArrivingToYourStop(currentLeg.vehicleIdentifier ?? '');
        const newInfo = userLanguageStrings.BusArrivesIn(
            currentLegOriginStopETAMinutes > 0 ? `${currentLegOriginStopETAMinutes}` : userLanguageStrings.NextFew,
        );
        return { title: newTitle, info: newInfo };
    } else if (currentLeg.vehicleState === 'VEHICLEARRIVED') {
        const newTitle = userLanguageStrings.BusHasArrivedAtYourStop(currentLeg.vehicleIdentifier ?? '');
        const newInfo = '';
        return { title: newTitle, info: newInfo };
    } else if (currentLeg.vehicleState === 'NOLIVEDATA') {
        const newTitle = userLanguageStrings.TakeBusToDestination(currentLeg.vehicleIdentifier ?? '', toName);
        const newInfo = userLanguageStrings.BusIsScheduledToArriveIn(
            currentLegOriginStopETAMinutes > 0
                ? `${currentLegOriginStopETAMinutes} ${userLanguageStrings.Mins}`
                : userLanguageStrings.NextFew,
        );
        return { title: newTitle, info: newInfo };
    }
    return { title: initialTitle, info: initialInfo };
};

export const getMetroTrainPreboardingHeaderContent = (
    currentLeg: ProcessedLegInfo,
    userLanguageStrings: strings,
): { title: string; info: string } => {
    const toName = currentLeg.staticInfo.destination.stationName ?? 'End';
    const travelModeDisplay =
        currentLeg.staticInfo.travelMode === 'Subway' ? userLanguageStrings.Train : currentLeg.staticInfo.travelMode;
    const platform = currentLeg.platformInfo;
    const currentLegOriginStopETAMinutes = currentLeg.realTimeInfo.originStopETAInMinutes ?? 0;
    const currentLegOriginStopETATime =
        currentLegOriginStopETAMinutes > -2
            ? formatTime(Date.now() + currentLegOriginStopETAMinutes * 60 * 1000)
            : undefined;
    const title = userLanguageStrings.WaitAtPlatformTakeTowards(
        platform ?? '',
        currentLeg.vehicleIdentifier ?? '',
        currentLeg.staticInfo.towardsStation ?? toName,
    );
    const info = currentLegOriginStopETATime
        ? currentLeg.vehicleState === 'NOLIVEDATA'
            ? userLanguageStrings.VehicleScheduledToArriveAt(travelModeDisplay, currentLegOriginStopETATime)
            : userLanguageStrings.VehicleArrivesAt(travelModeDisplay, currentLegOriginStopETATime)
        : userLanguageStrings.NoVehicleAvailable(travelModeDisplay);
    return { title, info };
};

export const getInTransitHeaderContent = (
    currentLeg: ProcessedLegInfo,
    allLegs: ProcessedLegInfo[],
    userLanguageStrings: strings,
): { title: string; info: string } => {
    const toName = currentLeg.staticInfo.destination.stationName ?? 'End';
    const destinationETAMinutes = currentLeg.realTimeInfo.destinationStopETAInMinutes;

    if (currentLeg.vehicleState === 'RIDEREACHEDDESTINATION') {
        return {
            title: userLanguageStrings.ReachedDestinationPlace(toName),
            info: userLanguageStrings.YouHaveReachedYourDestination,
        };
    }

    const nextPTLeg = (() => {
        const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
        if (['METRO', 'SUBWAY', 'BUS'].includes(nextLeg?.transitMode ?? '')) return nextLeg;
        const nextToNextLeg = nextLeg?.staticInfo.legOrder
            ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
            : null;
        if (['METRO', 'SUBWAY', 'BUS'].includes(nextToNextLeg?.transitMode ?? '')) return nextToNextLeg;
        return null;
    })();
    const nextPTLegETA = nextPTLeg
        ? formatTime(Date.now() + (nextPTLeg.realTimeInfo.originStopETAInMinutes ?? 0) * 60 * 1000)
        : '';
    const title = userLanguageStrings.GetDownAt(toName);
    const nextPTDisplayType =
        nextPTLeg?.transitMode === 'SUBWAY'
            ? userLanguageStrings.Train
            : getUserLanguageStringsForMode(nextPTLeg?.transitMode ?? '', userLanguageStrings);
    const info =
        userLanguageStrings.YouWillReachIn(
            destinationETAMinutes === 0
                ? userLanguageStrings.Now
                : destinationETAMinutes?.toString() + userLanguageStrings.Mins,
        ) +
        (nextPTLeg
            ? `. ${userLanguageStrings.TakeNextVehicleAt(nextPTDisplayType?.toLowerCase() ?? '', nextPTLegETA)}`
            : '');
    return { title, info };
};

// --- CurrentLegSplitUp Props Builders ---
export const mapTravelModeToLegItemType = (
    mode: Enums_MultimodalTravelMode_multimodalTravelMode | TransitMode,
): LegItemData['type'] => {
    if (mode === 'Bus' || mode === 'BUS') return 'Bus';
    if (mode === 'Metro' || mode === 'METRO') return 'Metro';
    if (mode === 'Subway' || mode === 'SUBWAY') return 'Subway';
    if (mode === 'Walk' || mode === 'WALK') return 'Walk';
    if (mode === 'Taxi' || checkTaxiLeg(mode)) return 'Taxi';
    return 'Walk'; // Default
};

export const buildWalkTaxiLegSplitUpItems = (
    handlerContext: HandlerContext,
    currentLeg: ProcessedLegInfo,
    allLegs: ProcessedLegInfo[],
    useAutoHyperlink: { text: string; onPress: () => void; isLoading: boolean } | undefined,
): LegItemData[] => {
    const userLanguageStrings = handlerContext.userLanguageStrings;
    const rideDistance = handlerContext.rideDistance;
    const isCurrentLegTaxi = checkTaxiLeg(currentLeg.transitMode);
    const currentLegDestinationStopETAMinutes = currentLeg.realTimeInfo.destinationStopETAInMinutes ?? 0;
    const durationString =
        currentLegDestinationStopETAMinutes > 0
            ? currentLegDestinationStopETAMinutes.toString() + userLanguageStrings.Mins
            : userLanguageStrings.Now;
    const distanceString =
        rideDistance && isCurrentLegTaxi
            ? formatDistance(rideDistance, userLanguageStrings)
            : currentLeg.distanceValue
              ? formatDistance(currentLeg.distanceValue, userLanguageStrings)
              : '';
    const destinationName =
        currentLeg.staticInfo.destination.stationName ??
        `${userLanguageStrings.Next} ${getStopString(currentLeg.transitMode, userLanguageStrings)}`;
    const legType = mapTravelModeToLegItemType(currentLeg.transitMode);

    const walkTaxiItem: LegItemData = {
        type: legType,
        durationInfo: durationString,
        description:
            `${currentLeg.transitMode === 'AUTO' || currentLeg.transitMode === 'TAXI' || currentLeg.transitMode === 'BIKE' ? userLanguageStrings.RideToDestination(distanceString, destinationName) : userLanguageStrings.WalkToDestination(distanceString, destinationName)}`.trim(),
        isMarquee: false,
        hyperlink: useAutoHyperlink,
    };

    const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
    if (nextLeg && ['BUS', 'METRO', 'SUBWAY'].includes(nextLeg.transitMode)) {
        const nextLegOriginStopETAMinutes = nextLeg.realTimeInfo.originStopETAInMinutes ?? 0;
        const nextLegOriginStopETATime = formatTime(Date.now() + nextLegOriginStopETAMinutes * 60 * 1000);
        const waitAtNextStop = nextLegOriginStopETAMinutes - currentLegDestinationStopETAMinutes;
        const waitDescription = nextLeg.platformInfo
            ? nextLeg.transitMode === 'SUBWAY'
                ? userLanguageStrings.WalkToCorrectPlatform
                : userLanguageStrings.PlatformNumber(nextLeg.platformInfo)
            : `${nextLeg.transitMode} ${getStopString(nextLeg.transitMode, userLanguageStrings)}`;

        const waitItem: LegItemData | undefined =
            waitAtNextStop >= -2 // adding -2 minutes of buffer time to account for the delay in the vehicle reaching the stop
                ? {
                      type: 'Wait',
                      durationInfo:
                          waitAtNextStop > 0
                              ? `${waitAtNextStop} ${userLanguageStrings.Mins}`
                              : userLanguageStrings.NoWait,
                      description: waitDescription,
                      isMarquee: false,
                      hyperlink: undefined,
                  }
                : undefined;

        const transitItem: LegItemData = {
            type: mapTravelModeToLegItemType(nextLeg.staticInfo.travelMode),
            durationInfo: nextLegOriginStopETATime,
            description:
                nextLeg.transitMode !== 'SUBWAY'
                    ? userLanguageStrings.TakeVehicle(nextLeg.vehicleIdentifier ?? '')
                    : userLanguageStrings.NextTrain,
            isMarquee: false,
            hyperlink: {
                text: userLanguageStrings.CheckIn,
                onPress: () => JourneyActionHandlers.onPressCheckIn(handlerContext),
                isLoading: false,
            },
        };

        return waitItem ? [walkTaxiItem, waitItem, transitItem] : [walkTaxiItem, transitItem];
    }
    return [walkTaxiItem];
};

export const buildWaitingLegSplitUpItems = (
    currentLeg: ProcessedLegInfo,
    handlerContext: HandlerContext,
): LegItemData[] => {
    const userLanguageStrings = handlerContext.userLanguageStrings;
    const currentLegOriginStopETAMinutes = currentLeg.realTimeInfo.originStopETAInMinutes ?? 0;
    const currentLegOriginStopETATime = formatTime(Date.now() + currentLegOriginStopETAMinutes * 60 * 1000);
    const toName =
        currentLeg.staticInfo.destination.stationName ??
        `${userLanguageStrings.Next} ${getStopString(currentLeg.transitMode, userLanguageStrings)}`;
    const waitDescription = currentLeg.platformInfo
        ? currentLeg.transitMode === 'SUBWAY'
            ? userLanguageStrings.WalkToCorrectPlatform
            : userLanguageStrings.PlatformNumber(currentLeg.platformInfo)
        : `${currentLeg.transitMode} ${getStopString(currentLeg.transitMode, userLanguageStrings)}`;

    const waitItem: LegItemData | undefined =
        currentLegOriginStopETAMinutes > -2 // adding -2 minutes of buffer time to account for the delay in the vehicle reaching the stop
            ? {
                  type: 'Wait',
                  durationInfo:
                      currentLegOriginStopETAMinutes > 0
                          ? `${currentLegOriginStopETAMinutes} ${userLanguageStrings.Mins}`
                          : userLanguageStrings.Now,
                  description: userLanguageStrings.WaitAt(waitDescription),
                  isMarquee: false,
                  hyperlink: undefined,
              }
            : undefined;
    const transitLegDescription =
        currentLeg.transitMode === 'METRO' || currentLeg.transitMode === 'SUBWAY'
            ? userLanguageStrings.ToDestination(toName)
            : userLanguageStrings.TakeVehicle(currentLeg.vehicleIdentifier ?? '');
    const transitItem: LegItemData = {
        type: mapTravelModeToLegItemType(currentLeg.staticInfo.travelMode),
        durationInfo: currentLegOriginStopETATime,
        description: transitLegDescription,
        isMarquee: false,
        hyperlink: {
            text: userLanguageStrings.CheckIn,
            onPress: () => JourneyActionHandlers.onPressCheckIn(handlerContext),
            isLoading: false,
        },
    };
    return waitItem ? [waitItem, transitItem] : [transitItem];
};

export const buildFallbackLegSplitUpItem = (
    currentLeg: ProcessedLegInfo,
    userLanguageStrings: strings,
): LegItemData => {
    const durationString =
        currentLeg.durationInMinutes > 0 ? `${currentLeg.durationInMinutes} ${userLanguageStrings.Min}` : 'Wait';
    const description = currentLeg.staticInfo.destination.stationName
        ? `${currentLeg.displayTransitType} ${userLanguageStrings.To} ${currentLeg.staticInfo.destination.stationName}`
        : userLanguageStrings.CurrentVehicleLeg(currentLeg.displayTransitType);
    return {
        type: mapTravelModeToLegItemType(currentLeg.staticInfo.travelMode),
        durationInfo: durationString,
        description: description,
        isMarquee: false,
        hyperlink: undefined,
    };
};

export const buildCurrentLegSplitUpProps = (
    currentLeg: ProcessedLegInfo,
    legsArray: LegItemData[],
    userLanguageStrings: strings,
): CurrentLegSplitUpProps => {
    return {
        orientation: currentLeg.splitUpOrientation,
        legs: legsArray.length > 0 ? legsArray : [buildFallbackLegSplitUpItem(currentLeg, userLanguageStrings)],
    };
};

// --- MiniBusTracking Props Builder ---
export const buildMiniBusTrackingProps = (
    currentLeg: ProcessedLegInfo,
    onPressTrackMode: () => void,
    destinationStop: string,
    destinationTitle: string,
    currentStopTitle: string,
    destinationTimeOverride: string | undefined,
    nextLegMetroLineColor: string | undefined,
    userLanguageStrings: strings,
): MiniBusTrackingProps => {
    const originStopETAMinutes = currentLeg.realTimeInfo.originStopETAInMinutes ?? 0;
    const originStopETATime = originStopETAMinutes
        ? formatTime(Date.now() + originStopETAMinutes * 60 * 1000)
        : '-:--pm';
    const currentStop = currentLeg.realTimeInfo.currentStop;
    const stopsRemaining = currentLeg.realTimeInfo.remainingStops ?? -1;

    const modeForMiniBus: 'Bus' | 'Metro' | 'Train' = (() => {
        const currentTransitMode: TransitMode = currentLeg.transitMode;
        switch (currentTransitMode) {
            case 'BUS':
                return 'Bus';
            case 'METRO':
                return 'Metro';
            case 'SUBWAY':
                return 'Train';
            default:
                return 'Bus';
        }
    })();

    return {
        mode: modeForMiniBus,
        currentStop:
            currentStop?.name ??
            userLanguageStrings.CurrentStopName(getStopString(currentLeg.transitMode, userLanguageStrings)),
        addTopPadding: true,
        destination: destinationStop,
        destinationTime: destinationTimeOverride ?? originStopETATime,
        noOfStops: stopsRemaining,
        handleOnPressViewDetails: onPressTrackMode,
        destinationTitle: destinationTitle,
        currentStopTitle: currentStopTitle,
        isLoading: false,
        nextLegMetroLineColor: nextLegMetroLineColor,
    };
};

// --- AdditionalBusInfo Props Builder ---
export const buildAdditionalBusInfoProps = (
    currentLeg: ProcessedLegInfo,
    userLanguageStrings: strings,
): AdditionalBusInfoProps => {
    const alternativeRoutes = currentLeg.staticInfo.alternateRoutesNames;
    const nextBusArrivalTime = currentLeg.realTimeInfo.upcomingVehicleArrivals.slice(1).filter(time => time > 0)?.[0];
    return {
        orientation: 'vertical',
        nextBusArrivalTime: nextBusArrivalTime ? `${nextBusArrivalTime} ${userLanguageStrings.Mins}` : 'N/A',
        busList:
            alternativeRoutes?.map(routeName => ({
                routeCode: routeName,
                routeNumber: routeName,
                handleOnPress: () => {
                    /* TODO: Implement if needed */
                },
            })) ?? [],
        handleSkipBus: () => {
            /* TODO: Implement if needed */
        },
        isLoading: false,
    };
};

// --- RateTransit Props Builder ---
export const buildRateTransitProps = (currentLeg: ProcessedLegInfo, userLanguageStrings: strings): RateTransitProps => {
    const travelMode = currentLeg.staticInfo.travelMode;
    const modeForRating: 'Bus' | 'Metro' | 'Train' =
        travelMode === 'Bus' ? 'Bus' : travelMode === 'Metro' ? 'Metro' : travelMode === 'Subway' ? 'Train' : 'Bus';
    return {
        handleOnPressThumbsUp: () => {
            /* TODO: Implement rating */
        },
        handleOnPressThumbsDown: () => {
            /* TODO: Implement rating */
        },
        transitMode: modeForRating,
        destination: currentLeg.staticInfo.destination.stationName ?? userLanguageStrings.Destination,
    };
};

// --- InStationZone / InMetroSuburbanTransit Props Builders ---
export const buildInStationZoneProps = (
    handlerContext: HandlerContext,
    currentLeg: ProcessedLegInfo,
    status: InStationZoneProps['status'],
    callbacks: { onPressTicket: () => void; onPressTrackMode: () => void },
): InStationZoneProps => {
    const userLanguageStrings = handlerContext.userLanguageStrings;
    const stationMode: 'metro' | 'train' = currentLeg.transitMode === 'METRO' ? 'metro' : 'train';
    const stationName = currentLeg.staticInfo.origin.stationName ?? userLanguageStrings.station;

    // Common properties
    const baseProps = {
        mode: stationMode,
        stationName,
        onPressTrackMode: callbacks.onPressTrackMode,
        onShowTicketPress: callbacks.onPressTicket,
    };

    // Return different objects based on status
    switch (status) {
        case 'waiting':
            return {
                status: 'waiting',
                ...baseProps,
            };

        case 'inTransit':
            return {
                status: 'inTransit',
                ...baseProps,
                toStationName: currentLeg.staticInfo.destination.stationName ?? userLanguageStrings.UnknownStation,
                vehicleIdentifier: currentLeg.vehicleIdentifier ?? userLanguageStrings.UnknownVehicle,
            };

        case 'transitOneStopAway': {
            const nextTransitArrivalTime = currentLeg.realTimeInfo.upcomingVehicleArrivals?.[1]
                ? formatTime(Date.now() + (currentLeg.realTimeInfo.upcomingVehicleArrivals?.[1] ?? 0) * 60 * 1000)
                : null;

            return {
                status: 'transitOneStopAway',
                ...baseProps,
                nextTransitArrivalTime,
                onCheckInPress: () => JourneyActionHandlers.onPressCheckIn(handlerContext),
                journeyId: handlerContext.journeyId,
            };
        }

        case 'transitArrived': {
            const transitArrivedMessage = userLanguageStrings.VehicleHasArrivedAt(
                currentLeg.vehicleIdentifier ?? stationMode,
                currentLeg.platformInfo ? userLanguageStrings.PlatformNumber(currentLeg.platformInfo) : stationName,
            );
            const trainMetroBadgeInfo =
                currentLeg.vehicleIdentifier ??
                (stationMode === 'metro' ? userLanguageStrings.MetroLine : userLanguageStrings.TrainService);
            const nextTransitArrivalTime = currentLeg.realTimeInfo.upcomingVehicleArrivals?.[1]
                ? formatTime(Date.now() + (currentLeg.realTimeInfo.upcomingVehicleArrivals?.[1] ?? 0) * 60 * 1000)
                : null;

            return {
                status: 'transitArrived',
                ...baseProps,
                transitArrivedMessage,
                trainMetroBadeInfo: trainMetroBadgeInfo,
                nextTransitArrivalTime,
                onSkipAndTakeNextPress: () =>
                    JourneyActionHandlers.onPressSkipAndTakeNext(handlerContext, currentLeg.staticInfo.legOrder),
                onCheckInPress: () => JourneyActionHandlers.onPressCheckIn(handlerContext),
                journeyId: handlerContext.journeyId,
            };
        }
    }
};
const buildNextPublicLegInfo = (
    nextLeg: ProcessedLegInfo,
    currentLeg: ProcessedLegInfo,
    handlerContext: HandlerContext,
): NextPubicLegInfoProps => {
    const busState: NextPubicLegInfoProps['busState'] = (() => {
        switch (nextLeg.vehicleState) {
            case 'VEHICLEISARRIVING':
            case 'VEHICLEALMOSTARRIVED':
            case 'VEHICLEARRIVED':
                return 'onTime';
            case 'VEHICLEWILLBEMISSED':
            case 'VEHICLEWASMISSED':
                return 'missed';
            default:
                return 'onTime';
        }
    })();

    const trainOrMetroState: NextPubicLegInfoProps['trainOrMetroState'] = (() => {
        switch (nextLeg.vehicleState) {
            case 'NOLIVEDATA':
                return 'scheduled';
            case 'VEHICLEISARRIVING':
            case 'VEHICLEALMOSTARRIVED':
            case 'VEHICLEARRIVED':
                return 'arriving';
            default:
                return 'scheduled';
        }
    })();

    const isTrackAvailableForBus =
        nextLeg.transitMode === 'BUS' &&
        nextLeg.vehicleState !== 'NOLIVEDATA' &&
        nextLeg.vehicleState !== 'VEHICLEWASMISSED' &&
        nextLeg.vehicleState !== 'VEHICLEWILLBEMISSED';

    return {
        travelMode: nextLeg.staticInfo.travelMode,
        origin: nextLeg.staticInfo.origin.stationName || '',
        destination: nextLeg.staticInfo.destination.stationName || '',
        arrivalTime: formatTime(Date.now() + (nextLeg.realTimeInfo.originStopETAInMinutes ?? 0) * 60 * 1000),
        vehicleInfo: nextLeg.vehicleIdentifier,
        switchLegProps:
            currentLeg?.transitMode === nextLeg.transitMode
                ? {
                      lineColor: nextLeg.staticInfo.lineColor?.[0],
                      platformNo: nextLeg.staticInfo.platform,
                      towards: nextLeg.staticInfo.towardsStation,
                  }
                : undefined,
        busState,
        trainOrMetroState,
        onTrackPress: () => {
            if (handlerContext.showDetailedTransitTrackingForLeg) {
                handlerContext.showDetailedTransitTrackingForLeg(nextLeg);
            }
        },
        onSwitchPress: () => {
            JourneyActionHandlers.onPressSkipAndTakeNext(handlerContext, nextLeg.staticInfo.legOrder);
        },
        onTimetablePress: () => {
            if (handlerContext.showTimeTableForLeg) {
                handlerContext.showTimeTableForLeg(nextLeg);
            }
        },
        isLoading: nextLeg.staticInfo.isLoading,
        isTrackAvailableForBus,
    };
};
export const buildNextLegProps = (
    currentLeg: ProcessedLegInfo,
    legs: ProcessedLegInfo[],
    handlerContext: HandlerContext,
    isDetailedTracking: boolean,
): NextLegProps | undefined => {
    const nextLeg = currentLeg?.staticInfo.legOrder
        ? getNextLegOrder(legs, currentLeg?.staticInfo.legOrder)
        : undefined;
    if (!nextLeg) return undefined;
    switch (nextLeg.transitMode) {
        case 'TAXI':
        case 'AUTO':
        case 'BIKE':
            return {
                mode: 'Taxi',
                ...buildNextLegAutoStatusProps(nextLeg, handlerContext, isDetailedTracking),
            };
        case 'WALK':
            return {
                mode: 'Walk',
                ...buildNextLegWalkStatusProps(nextLeg, handlerContext),
            };
        case 'BUS':
            return {
                mode: 'Bus',
                ...buildNextPublicLegInfo(nextLeg, currentLeg, handlerContext),
            };
        case 'METRO': {
            return {
                mode: 'Metro',
                ...buildNextPublicLegInfo(nextLeg, currentLeg, handlerContext),
            };
        }
        case 'SUBWAY': {
            return {
                mode: 'Subway',
                ...buildNextPublicLegInfo(nextLeg, currentLeg, handlerContext),
            };
        }
    }
};

export const buildNextLegAutoStatusProps = (
    nextLeg: ProcessedLegInfo,
    handlerContext: HandlerContext,
    isDetailedTracking: boolean,
): BookAutoToastProps => {
    const userLanguageStrings = handlerContext.userLanguageStrings;
    const autoState = ((): BookAutoToastProps['autoState'] => {
        switch (nextLeg.vehicleState) {
            case 'SEARCHINGFORVEHICLE':
                return 'searching';
            case 'VEHICLEISARRIVING':
            case 'VEHICLEALMOSTARRIVED':
            case 'VEHICLEARRIVED':
                return 'assigned';
            default:
                return 'Inplan';
        }
    })();

    const handleOnBookPress = () => {
        if (nextLeg.vehicleState === 'RIDESKIPPED') {
            JourneyActionHandlers.rebookSkippedLeg(handlerContext, nextLeg);
        } else {
            if (nextLeg.staticInfo.selectedQuoteId) {
                handlerContext.actions.selectPricingId(nextLeg.staticInfo.legOrder, nextLeg.staticInfo.selectedQuoteId);
            } else {
                console.error('No selected quote ID found for next leg');
            }
        }
    };

    const description =
        nextLeg.vehicleState === 'VEHICLEBOOKINGPENDING'
            ? userLanguageStrings.ThisIsTheRightTimeToStartSearchingAuto
            : userLanguageStrings.YouCanAccessInformationForYourNextTransit;

    return {
        autoState,
        destination: nextLeg.staticInfo.destination.stationName || userLanguageStrings.Destination,
        vehicleIdentifier:
            nextLeg.vehicleState !== 'NODRIVERFOUND' && nextLeg.vehicleIdentifier
                ? nextLeg.vehicleIdentifier
                : nextLeg.transitMode === 'AUTO'
                  ? userLanguageStrings.Auto
                  : nextLeg.transitMode === 'BIKE'
                    ? userLanguageStrings.Bike
                    : userLanguageStrings.Cab,
        transitMode: nextLeg.transitMode,
        vehicleNo: nextLeg.vehicleIdentifier || '',
        handleOnTrackRidePress: () => {
            if (nextLeg.taxiBookingId) {
                JourneyActionHandlers.navigateToRideTracking(handlerContext, nextLeg);
            } else {
                console.error('No taxi booking ID found for next leg');
            }
        },
        handleOnBookPress: handleOnBookPress,
        handleOnBoostRidePress: () => {
            if (nextLeg?.staticInfo.searchId && nextLeg?.staticInfo) {
                handlerContext.dispatch(
                    setJourneyRoute({
                        id: nextLeg.staticInfo.searchId,
                        payload: nextLeg.staticInfo,
                    }),
                );
            }
            JourneyActionHandlers.navigateToLookingForRides(
                handlerContext,
                nextLeg.staticInfo.searchId,
                nextLeg.staticInfo.legOrder,
            );
        },
        price: Math.round(nextLeg.staticInfo.fare?.amount ?? 0),
        description: isDetailedTracking ? '' : description,
    };
};

export const buildNextLegWalkStatusProps = (
    nextLeg: ProcessedLegInfo,
    handlerContext: HandlerContext,
): NextWalkLegInfoProps => {
    const userLanguageStrings = handlerContext.userLanguageStrings;
    return {
        distance: formatDistance(nextLeg.distanceValue ?? 0, userLanguageStrings),
        destination: nextLeg.staticInfo.destination.stationName || userLanguageStrings.Destination,
        onPressUseAuto: () => {
            handlerContext.actions.switchBetweenAutoAndWalk(getOrder(nextLeg.staticInfo.legOrder), 'Taxi', undefined);
        },
        onNextWalkLegCTAPress: () => {
            if (nextLeg?.riderLocation && nextLeg?.staticInfo?.destination) {
                const { riderLocation } = nextLeg;
                const { destination } = nextLeg.staticInfo;
                const url = `https://www.google.com/maps/dir/?api=1&origin=${riderLocation.lat},${riderLocation.lon}&destination=${destination.latLong.lat},${destination.latLong.lon}`;
                Linking.openURL(url);
            }
        },
        isLoading: nextLeg.staticInfo.isLoading,
    };
};

// --- DetailedTransitTracking Component Props Builder ---
export const buildDetailedTransitTrackingComponentProps = (
    showDetailedTransitTracking: boolean,
    legForDetailedTracking: ProcessedLegInfo | undefined,
    allJourneyLegs: ProcessedLegInfo[] | undefined,
    handleHideDetailedTransitTracking: () => void,
    isTrackModeAvailable: boolean,
    rideDistance: number | undefined,
    userLanguageStrings: strings,
): DetailedTransitTrackingUIProps | undefined => {
    if (!showDetailedTransitTracking || !legForDetailedTracking || !allJourneyLegs) {
        return undefined;
    }
    const nextLeg = getNextLegOrder(allJourneyLegs, legForDetailedTracking.staticInfo.legOrder);
    const modeForUI: 'Bus' | 'Metro' | 'Train' =
        legForDetailedTracking.transitMode === 'SUBWAY'
            ? 'Train'
            : legForDetailedTracking.transitMode === 'BUS'
              ? 'Bus'
              : 'Metro';

    const routeStopsMapped: StopMapping[] = legForDetailedTracking.staticInfo.stops.map(s => ({
        stopName:
            s.name ??
            userLanguageStrings.UnknownStop(getStopString(legForDetailedTracking.transitMode, userLanguageStrings)),
        distance: s.distance,
        lat: s.lat ?? 0,
        lon: s.lon ?? 0,
        stopCode: s.stopCode,
    }));
    const finalDestIndex = routeStopsMapped.findIndex(
        s => s.stopCode === legForDetailedTracking?.staticInfo.destination.stopCode,
    );
    const finalDestinationStopIndex: number =
        finalDestIndex >= 0 ? finalDestIndex : routeStopsMapped.length > 0 ? routeStopsMapped.length - 1 : 0;

    const currentLocStopIndex = routeStopsMapped.findIndex(
        s => s.stopCode === legForDetailedTracking?.realTimeInfo?.currentStop?.stopCode,
    );

    const mbBoardingStopIndex = routeStopsMapped.findIndex(
        s => s.stopCode === legForDetailedTracking?.staticInfo.origin.stopCode,
    );
    const boardingStopIndex: number = mbBoardingStopIndex >= 0 ? mbBoardingStopIndex : 0;
    const approachingDestinationStopIndex_: number =
        legForDetailedTracking.userState === 'INVEHICLE'
            ? Math.max(finalDestinationStopIndex - 1, 0)
            : Math.max(boardingStopIndex - 1, 0);
    const approachingDestinationStopIndex =
        approachingDestinationStopIndex_ <= currentLocStopIndex
            ? currentLocStopIndex
            : approachingDestinationStopIndex_;
    const originStopETA = formatTime(
        Date.now() + (legForDetailedTracking?.realTimeInfo.originStopETAInMinutes ?? 0) * 60 * 1000,
    );
    const destinationStopETA = formatTime(
        Date.now() + (legForDetailedTracking?.realTimeInfo.destinationStopETAInMinutes ?? 0) * 60 * 1000,
    );
    const preDestinationMessage =
        approachingDestinationStopIndex_ >= currentLocStopIndex
            ? userLanguageStrings.YouWillBeAlertedWhenVehicleReachesHere(
                  getUserLanguageStringsForMode(modeForUI, userLanguageStrings),
              )
            : legForDetailedTracking.userState === 'INVEHICLE'
              ? userLanguageStrings.ReachedDestinationGetDown
              : userLanguageStrings.VehicleHasArrivedBoardNow(
                    getUserLanguageStringsForMode(modeForUI, userLanguageStrings),
                );

    const transitTrackingProps: TransitTrackingProps = {
        routeStops: routeStopsMapped,
        boardingStopIndex,
        currentLocationStopIndex: currentLocStopIndex >= 0 ? currentLocStopIndex : 0,
        approachingDestinationStopIndex,
        finalDestinationStopIndex,
        boardingStopTitle: userLanguageStrings.BoardingStop(
            getStopString(legForDetailedTracking.transitMode, userLanguageStrings),
        ),
        boardingStopSubtitle: originStopETA ? originStopETA : userLanguageStrings.Scheduled,
        destinationStopTitle: userLanguageStrings.DestinationStop(
            getStopString(legForDetailedTracking.transitMode, userLanguageStrings),
        ),
        destinationStopSubtitle: destinationStopETA ? `${destinationStopETA}` : userLanguageStrings.Estimated,
        preDestinationMessage,
        isPreboarding: legForDetailedTracking.userState !== 'INVEHICLE',
        mode: modeForUI,
        nextLegMetroLineColor: nextLeg?.staticInfo.lineColor?.[0] ?? undefined,
    };
    const nextStopCode = legForDetailedTracking.realTimeInfo.currentLiveVehicle?.stopsInformation?.[0]?.stopCode;
    const nextStopName = nextStopCode
        ? routeStopsMapped.find(stop => stop.stopCode === nextStopCode)?.stopName
        : undefined;

    const miniTransitInfoProps: MiniTransitInfoProps = {
        mode: legForDetailedTracking.staticInfo.travelMode,
        info:
            userLanguageStrings.NextStopName(
                nextStopName ?? legForDetailedTracking.staticInfo.destination.stationName ?? '',
            ) +
            (legForDetailedTracking.realTimeInfo.destinationStopETAInMinutes
                ? `. ${userLanguageStrings.ETAMin(legForDetailedTracking.realTimeInfo.destinationStopETAInMinutes)}`
                : ''),
    };

    const detailedViewHeaderPropsConst: DetailedLiveHeaderProps = (() => {
        if (checkTaxiLeg(legForDetailedTracking.transitMode, true)) {
            const content = getWalkTaxiPreboardingHeaderContent(
                legForDetailedTracking,
                allJourneyLegs,
                rideDistance,
                userLanguageStrings,
            );
            return buildDetailedLiveHeaderProps(legForDetailedTracking, content.title, content.info, false);
        } else if (legForDetailedTracking.userState === 'WAITING') {
            if (legForDetailedTracking.transitMode === 'BUS') {
                const content = getBusPreboardingHeaderContent(legForDetailedTracking, userLanguageStrings);
                return buildDetailedLiveHeaderProps(legForDetailedTracking, content.title, content.info, false);
            } else {
                // METRO or SUBWAY
                const content = getMetroTrainPreboardingHeaderContent(legForDetailedTracking, userLanguageStrings);
                return buildDetailedLiveHeaderProps(legForDetailedTracking, content.title, content.info, false);
            }
        } else {
            const content = getInTransitHeaderContent(legForDetailedTracking, allJourneyLegs, userLanguageStrings);
            return buildDetailedLiveHeaderProps(legForDetailedTracking, content.title, content.info, true);
        }
    })();

    return {
        mode: modeForUI,
        detailedLiveHeaderProps: detailedViewHeaderPropsConst,
        transitTrackingProps,
        miniTransitInfoProps,
        hasLiveTracking: isTrackModeAvailable,
        onHideDetails: handleHideDetailedTransitTracking,
        customTopPadding: undefined,
    };
};

export const buildDetailedTimetableProps = (
    legForDetailedTracking: ProcessedLegInfo | undefined,
    detailedLiveHeaderProps: DetailedLiveHeaderProps,
    userLanguageStrings: strings,
): TransitTimetableUIProps | undefined => {
    if (!legForDetailedTracking || !legForDetailedTracking.staticInfo.timetable) {
        return undefined;
    }
    return {
        times: legForDetailedTracking.staticInfo.timetable,
        firstTime: legForDetailedTracking.staticInfo.timetable[0]?.time ?? userLanguageStrings.Morning,
        lastTime:
            legForDetailedTracking.staticInfo.timetable[legForDetailedTracking.staticInfo.timetable.length - 1]?.time ??
            userLanguageStrings.Evening,
        detailedLiveHeaderProps,
        destination: legForDetailedTracking.staticInfo.destination.stationName ?? userLanguageStrings.Destination,
        source: legForDetailedTracking.staticInfo.origin.stationName ?? userLanguageStrings.Source,
        onHideDetails: () => {},
    };
};

export const LOADING_VIEW_DATA: LiveJourneyDetailViewData = {
    viewMode: 'preboarding',
    backgroundMode: 'map',
    shouldShowBottomSheet: true,
    transitMode: undefined,
    userState: undefined,
    vehicleState: undefined,
    onCompleteJourney: () => Promise.resolve(),
    onMarkLegComplete: () => Promise.resolve(),
    detailedLiveHeaderProps: {
        title: '',
        icon: 'Bus',
        isInTransitHeader: false,
        info: '',
        noOfStops: 0,
        isLoading: true,
    },
    preboardingProps: {
        status: 'starting',
        mode: 'bus',
        isLastLeg: false,
        detailedLiveHeaderProps: {
            title: '',
            icon: 'Bus',
            isInTransitHeader: false,
            info: '',
            noOfStops: 0,
            isLoading: true,
        },
        isLiveTrackingNotAvailable: false,
        onPressTrackMode: () => {},
        currentLegSplitUpProps: {
            orientation: 'vertical',
            legs: [],
            isLoading: true,
        },
        handleOnPressViewTicketButton: () => {},
        onPressBookRide: () => {},
        isLoading: true,
        isBusTicketNotActivated: false,
        onPressVerifyPass: () => {},
        hasApplicablePasses: undefined,
        onPressBusOtpScreen: () => {},
    },
    inTransitProps: undefined,
    chooseRideProps: undefined,
    inStationZoneProps: undefined,
    errorMessage: undefined,
    isLastMile: false,
    showDetailedTransitTracking: false,
    detailedTransitTrackingComponentProps: undefined,
    transitCheckInProps: undefined,
    lastUpdatedAtString: undefined,
    onShowDetailedTransitTracking: () => {},
    onHideDetailedTransitTracking: () => {},
    onPressExit: () => {},
    onPressSafety: () => {},
    recenterMap: () => {},
    timeTableProps: undefined,
    ticketUIProps: undefined,
    callDriverProps: null,
    callDriverBottomsheetModalRef: createRef<BottomSheetModal>(),
    goBackToOverviewScreen: undefined,
    riderLocationHistory: [],
    locationRefreshViewData: {
        trackLostJourneyProps: [],
        onLegUpdate: () => {},
    },
    metroConfirmProps: null,
    onPressStatusBadge: () => {},
    predictedLeg: undefined,
    shouldAutoOpenUpdateTransit: false,
    setShouldAutoOpenUpdateTransit: () => {},
};

export const getVehicleStopMarker = (vehicleVariant: string | undefined) => {
    switch (vehicleVariant) {
        case 'METRO':
            return 'MetroStop';
        case 'SUBWAY':
            return 'SubwayStop';
        case 'BUS':
            return 'BusStop';
        default:
            return 'MultimodalStop';
    }
};
