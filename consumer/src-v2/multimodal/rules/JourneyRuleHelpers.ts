import { ProcessedLegInfo, type TransitMode, type VehicleState } from '@/src-v2/multimodal/types/journeyTracking';
import { JourneyState } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types'; // Corrected import path
import { HandlerContext } from './JourneyActionHandlers';
import { TransitCheckInProps } from '../screens/NewLiveJourney/components/StatusPopUpModal/TransitCheckIn/TransitCheckIn';
import * as JourneyActionHandlers from '@/src-v2/multimodal/rules/JourneyActionHandlers';
import { TransitType } from '../screens/NewLiveJourney/components/Iternary/types';
import { Stop } from '@/src-v2/multimodal/types/journeyTracking';
import { isUndefined } from 'lodash';
import { strings } from 'config-types';
import { checkTaxiLeg } from '@/typescript/utils/common';

// --- Utility Functions ---
export const formatTime = (timestampInput: string | number | undefined): string => {
    if (timestampInput === undefined) return '-:--pm';
    const date = typeof timestampInput === 'string' ? new Date(timestampInput) : new Date(timestampInput);
    if (isNaN(date.getTime())) return '-:--pm';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getStopString = (mode: TransitMode, userLanguageStrings: strings): string => {
    if (mode === 'BUS') return userLanguageStrings.Stops;
    return userLanguageStrings.station;
};

export const mapVehicleStateToJourneyState = (vehicleState: VehicleState | undefined): JourneyState => {
    if (vehicleState) {
        switch (vehicleState) {
            case 'SEARCHINGFORVEHICLE':
                return 'SEARCHINGFORVEHICLE';
            case 'VEHICLEISARRIVING':
                return 'VEHICLEISARRIVING';
            case 'VEHICLEALMOSTARRIVED':
                return 'VEHICLEALMOSTARRIVED';
            case 'VEHICLEARRIVED':
                return 'VEHICLEARRIVED';
            case 'RIDESTARTED':
                return 'RIDESTARTED';
            case 'RIDECLOSETODESTINATION':
                return 'RIDECLOSETODESTINATION';
            case 'ARRIVEDATSTATIONPLATFORM':
                return 'ARRIVEDATSTATIONPLATFORM';
            case 'RIDEREACHEDDESTINATION':
                return 'RIDEREACHEDDESTINATION';
            case 'VEHICLEWASMISSED':
                return 'VEHICLEWASMISSED';
            case 'VEHICLEWILLBEMISSED':
                return 'VEHICLEWILLBEMISSED';
            case 'RIDESKIPPED':
                return 'RIDESKIPPED';
            case 'NODRIVERFOUND':
                return 'NODRIVERFOUND';
            case 'NOLIVEDATA':
                return 'NOLIVEDATA';
            case 'VEHICLEBOOKINGPENDING':
                return 'VEHICLEBOOKINGPENDING';
        }
    }
    return 'SEARCHINGFORVEHICLE';
};

export const buildTransitCheckInProps = (
    currentLeg: ProcessedLegInfo,
    handlerContext: HandlerContext,
): TransitCheckInProps => {
    const onPressCheckIn = () => {
        if (currentLeg.realTimeInfo.possibleCheckInStations.length > 1) {
            handlerContext.liveJourneyTransitCheckInModalRef?.current?.dismiss();
            handlerContext.liveJourneyMetroConfirmLocationBottomSheetRef?.current?.present();
        } else {
            JourneyActionHandlers.onCheckInConfirmation(
                handlerContext,
                currentLeg,
                currentLeg.realTimeInfo.possibleCheckInStations[0],
                undefined,
            );
            handlerContext.liveJourneyTransitCheckInModalRef?.current?.dismiss();
        }
    };
    const mode = (() => {
        switch (currentLeg.displayTransitType) {
            case 'METRO':
                return 'metro';
            case 'SUBWAY':
                return 'train';
            default:
                return 'bus';
        }
    })();
    const metroConfirmProps = {
        stations: currentLeg.staticInfo.onRouteStops,
        possibleCheckInStations: currentLeg.realTimeInfo.possibleCheckInStations,
        onStationConfirm: (station: Stop) => {
            JourneyActionHandlers.onCheckInConfirmation(
                handlerContext,
                currentLeg,
                station,
                currentLeg.riderLocationHistory,
            );
            handlerContext.liveJourneyMetroConfirmLocationBottomSheetRef?.current?.dismiss();
        },
    };

    return {
        mode: mode,
        onCheckInPress: onPressCheckIn,
        onClosePress: () => {
            handlerContext.liveJourneyTransitCheckInModalRef?.current?.dismiss();
        },
        metroConfirmProps,
    };
};

export const buildTrackLostJourneyProps = (legs: ProcessedLegInfo[]): TransitType[] => {
    // Find the last completed taxi/auto leg
    const lastCompletedTaxiAutoIndex = [...legs]
        .reverse()
        .findIndex(
            leg =>
                checkTaxiLeg(leg.displayTransitType) &&
                leg.vehicleState === 'RIDEREACHEDDESTINATION' &&
                !isUndefined(leg.taxiBookingId),
        );

    const lastCompletedTaxiAutoPosition =
        lastCompletedTaxiAutoIndex === -1 ? -1 : legs.length - 1 - lastCompletedTaxiAutoIndex;

    // Find first taxi/auto leg with active status
    const firstActiveTaxiAutoIndex = legs.findIndex(
        leg =>
            checkTaxiLeg(leg.displayTransitType) &&
            [
                'VEHICLEISARRIVING',
                'VEHICLEALMOSTARRIVED',
                'VEHICLEARRIVED',
                'RIDESTARTED',
                'RIDECLOSETODESTINATION',
                'SEARCHINGFORVEHICLE',
            ].includes(leg.vehicleState || ''),
    );

    return legs.map((leg, index) => {
        const shouldShowUpdateBasedOnCompleted =
            lastCompletedTaxiAutoPosition === -1 || index > lastCompletedTaxiAutoPosition;
        const shouldShowUpdateBasedOnActive = firstActiveTaxiAutoIndex === -1 || index < firstActiveTaxiAutoIndex;
        const shouldShowUpdate = shouldShowUpdateBasedOnCompleted && shouldShowUpdateBasedOnActive;
        return {
            type: leg.displayTransitType,
            time: leg.realTimeInfo.destinationStopETAInMinutes ?? 0,
            distance: leg.distanceValue,
            vehicleDetail: leg.vehicleIdentifier,
            exitGate: leg.staticInfo.destination.exitGate,
            place: leg.staticInfo.origin.stationName || '',
            state: leg.vehicleState ? mapVehicleStateToJourneyState(leg.vehicleState) : 'VEHICLEISARRIVING',
            NextLeg: 'DESTINATION',
            NoOfStops: leg.realTimeInfo.remainingStops ?? -1,
            isFirstLeg: leg.isFirstLeg,
            isLastLeg: leg.isLastLeg,
            scheduledArrivalTime: undefined,
            isJourneyComplete: leg.vehicleState === 'RIDEREACHEDDESTINATION',
            fromLocation: leg.staticInfo.origin.stationName,
            toLocation: leg.staticInfo.destination.stationName,
            legOrder: leg.staticInfo.legOrder,
            isShowUpdate: shouldShowUpdate,
            transitMode: leg.transitMode,
        };
    });
};

export const getFilteredMetroStations = (
    allStops: Stop[],
    currentVehicleStop: Stop | undefined,
    possibleCheckInStations: Stop[] | undefined,
): Stop[] => {
    // Strategy 1: Use live vehicle position if available (most accurate)
    if (currentVehicleStop) {
        const vehicleStopIndex = allStops.findIndex(stop => stop.stopCode === currentVehicleStop.stopCode);

        // Show: previous stop + current stop + next 4 stops (6 total max)
        if (vehicleStopIndex >= 0) {
            const startIndex = Math.max(0, vehicleStopIndex - 1); // Include previous stop if exists
            const endIndex = Math.min(allStops.length, vehicleStopIndex + 4); // Current + next 3 stops
            return allStops.slice(startIndex, endIndex);
        }
    }

    if (possibleCheckInStations && possibleCheckInStations.length > 0) {
        return possibleCheckInStations;
    }

    // fallback
    return allStops.slice(0, Math.min(5, allStops.length));
};

export const getCurrentVehicleStop = (legOrder: string | undefined, allLegs: ProcessedLegInfo[]): Stop | undefined => {
    if (!legOrder) {
        return undefined;
    }

    const selectedLeg = allLegs.find(leg => leg.staticInfo.legOrder === legOrder);
    return selectedLeg?.realTimeInfo.currentStop;
};
