import { type ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import {
    type TransitType,
    type Transit,
    JourneyStatus,
} from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types';
import { type RuleHandlerParams } from '@/src-v2/multimodal/rules/JourneyRulesTypes';
import { mapVehicleStateToJourneyState } from '@/src-v2/multimodal/rules/JourneyRuleHelpers';
import { createBookingId } from '@/typescript/state/client/user';
import * as JourneyActionHandlers from '@/src-v2/multimodal/rules/JourneyActionHandlers';
import { getJourneyUserState, getNextLegOrder } from '../../utils/journeyTrackingUtils';
import { formatTime } from '../LiveJourneyDetail/FlowHelpers';
import { setJourneyRoute } from '@/typescript/state/client/search';
import { checkTaxiLeg } from '@/typescript/utils/common';

export const calculateScheduleFrequency = (etas: number[]): number | undefined => {
    if (etas.length < 2) return undefined;
    const differences = etas.slice(1).map((eta, i) => eta - (etas[i] ?? 0));
    const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
    return Math.round(avgDifference);
};

// mapLegToUITransitType specific to Overview's needs, to be used by rule handlers
export const mapLegToOverviewUITransitType = (
    leg: ProcessedLegInfo,
    allTrackedData: ProcessedLegInfo[], // Renamed for clarity, this is the full journey data
    typeOverride: Transit | undefined,
    nextLegActualModeOverride: Transit | undefined,
    timeType: 'ETA' | 'DURATION',
    scheduledArrivalTime: string | undefined,
): TransitType => {
    const nextLegForNextLegField = getNextLegOrder(allTrackedData, leg.staticInfo.legOrder);
    return {
        type:
            leg.staticInfo.isLoading && typeOverride !== 'DESTINATION'
                ? 'RELOADING'
                : typeOverride || leg.displayTransitType,
        time:
            timeType === 'ETA'
                ? Math.max(leg.realTimeInfo.originStopETAInMinutes ?? 0, 0)
                : (leg.realTimeInfo.destinationStopETAInMinutes ?? 0),
        distance: leg.distanceValue,
        vehicleDetail: leg.vehicleIdentifier,
        exitGate: leg.staticInfo.destination.exitGate,
        place:
            typeOverride === 'WAITING' ||
            (typeOverride === 'FARAWAY' && (leg.farawayTarget === 'origin' || !leg.farawayTarget))
                ? leg.staticInfo.origin.stationName || ''
                : leg.staticInfo.destination.stationName || '',
        state: leg.vehicleState ? mapVehicleStateToJourneyState(leg.vehicleState) : 'VEHICLEISARRIVING',
        NextLeg: nextLegActualModeOverride || (nextLegForNextLegField?.displayTransitType ?? 'DESTINATION'),
        NoOfStops: leg.realTimeInfo.remainingStops ?? -1,
        isFirstLeg: leg.isFirstLeg && typeOverride !== 'DESTINATION',
        isLastLeg: leg.isLastLeg && typeOverride === 'DESTINATION',
        scheduledArrivalTime,
        isJourneyComplete: false,
        isShowUpdate: false,
        fromLocation: leg.staticInfo.origin.stationName,
        toLocation: leg.staticInfo.destination.stationName,
        legOrder: leg.staticInfo.legOrder,
        transitMode: leg.transitMode,
    };
};

export const buildOverviewTwoTransits = (currentLeg: ProcessedLegInfo, allLegs: ProcessedLegInfo[]): TransitType[] => {
    const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
    if (nextLeg) {
        const afterNextLeg = nextLeg?.staticInfo.legOrder
            ? getNextLegOrder(allLegs, nextLeg.staticInfo.legOrder)
            : null;

        const scheduledArrivalTime = nextLeg.realTimeInfo.originStopETAInMinutes
            ? formatTime(Date.now() + nextLeg.realTimeInfo.originStopETAInMinutes * 60 * 1000)
            : undefined;

        const firstTransit = mapLegToOverviewUITransitType(
            currentLeg,
            allLegs,
            undefined, // userStateOverride - specific rules might adjust this if needed before calling
            nextLeg.displayTransitType,
            'DURATION',
            undefined,
        );
        const secondTransit = mapLegToOverviewUITransitType(
            nextLeg,
            allLegs,
            undefined, // userStateOverride
            afterNextLeg?.displayTransitType || 'DESTINATION',
            'ETA',
            scheduledArrivalTime,
        );
        return [firstTransit, secondTransit];
    } else {
        // Handle case where there is no next leg (currentLeg is the last leg)
        const firstTransit = mapLegToOverviewUITransitType(
            currentLeg,
            allLegs,
            undefined, // userStateOverride
            'DESTINATION',
            'DURATION',
            undefined,
        );
        const secondTransit = mapLegToOverviewUITransitType(
            currentLeg, // Using currentLeg again as there's no nextLeg
            allLegs,
            'DESTINATION', // userStateOverride for the "second" transit when it's just destination
            'DESTINATION',
            'DURATION',
            undefined,
        );
        return [firstTransit, secondTransit];
    }
};

export const buildOverviewCommonProps = (
    currentLeg: ProcessedLegInfo,
    allLegs: ProcessedLegInfo[],
    params: RuleHandlerParams,
) => {
    const { handlerContext } = params;
    const { navigation, journeyId } = handlerContext;
    if (!navigation || !journeyId) return null;

    const finalLeg = allLegs[allLegs.length - 1];
    const destinationString: string =
        finalLeg?.staticInfo.destination.stationName || handlerContext.userLanguageStrings.Destination;
    const entireJourneyArr: Transit[] = allLegs.map(leg => leg.displayTransitType);

    const currentStatusString: JourneyStatus = getJourneyUserState(currentLeg);

    const onPressDetails = () => {
        if (currentStatusString === 'LIVE') {
            JourneyActionHandlers.navigateToLiveJourneyDetail(handlerContext);
        } else {
            JourneyActionHandlers.showTicket(handlerContext);
        }
    };

    const getTaxiLeg = (): ProcessedLegInfo | null => {
        if (checkTaxiLeg(currentLeg.transitMode)) {
            return currentLeg;
        } else {
            const nextLeg = getNextLegOrder(allLegs, currentLeg.staticInfo.legOrder);
            if (nextLeg && checkTaxiLeg(nextLeg.transitMode)) {
                return nextLeg;
            }
            return null;
        }
    };

    const onPressCallRide = () => {
        JourneyActionHandlers.showCallDriverBottomsheet(handlerContext);
    };

    const onPressViewTicket = () => {
        JourneyActionHandlers.showTicket(handlerContext);
    };

    const onMuteJourney = () => {
        JourneyActionHandlers.muteJourney(handlerContext);
    };

    const onCompleteJourney = async () => {
        await JourneyActionHandlers.completeJourney(handlerContext);
    };

    const onViewJourneyPlan = () => {
        JourneyActionHandlers.navigateToJourneyPlan(handlerContext);
    };

    const onPressBoostRide = () => {
        const taxiLeg = getTaxiLeg();
        if (taxiLeg) {
            JourneyActionHandlers.navigateToLookingForRides(
                handlerContext,
                taxiLeg.staticInfo.searchId,
                taxiLeg.staticInfo.legOrder,
            );
        }
    };

    const onPressSwitchToWalk = () => {
        const taxiLeg = getTaxiLeg();
        if (taxiLeg) {
            JourneyActionHandlers.switchBetweenAutoAndWalk(handlerContext, taxiLeg);
        }
    };

    const onPressMarkLegComplete = async () => {
        JourneyActionHandlers.markLegComplete(handlerContext, currentLeg.staticInfo.legOrder);
    };

    const onDirectRidePress = () => {
        JourneyActionHandlers.onDirectRidePress(handlerContext, currentLeg, allLegs);
    };

    const onPressViewTimetable = () => {
        JourneyActionHandlers.navigateToTimetable(handlerContext);
    };

    const onPressCheckIn = () => {
        JourneyActionHandlers.onPressCheckIn(handlerContext);
    };

    const onPressStatusBadge = () => {
        // This will be overridden in the Flow file
    };

    const onRetryBooking = async () => {
        const taxiLeg = getTaxiLeg();
        if (taxiLeg) {
            await JourneyActionHandlers.rebookSkippedLeg(handlerContext, taxiLeg);
            if (taxiLeg.staticInfo.selectedQuoteId && taxiLeg.staticInfo.searchId && taxiLeg.staticInfo) {
                handlerContext.actions.selectPricingId(taxiLeg.staticInfo.legOrder, taxiLeg.staticInfo.selectedQuoteId);
                handlerContext.dispatch(
                    setJourneyRoute({
                        id: taxiLeg.staticInfo.searchId,
                        payload: taxiLeg.staticInfo,
                    }),
                );
                JourneyActionHandlers.navigateToLookingForRides(
                    handlerContext,
                    taxiLeg.staticInfo.searchId,
                    taxiLeg.staticInfo.legOrder,
                );
            }
        }
    };

    const callDriverProps = (() => {
        const taxiLeg = getTaxiLeg();
        if (taxiLeg && taxiLeg.staticInfo.driverNumber && taxiLeg.staticInfo.exoNumber && taxiLeg.taxiBookingId) {
            return {
                driverNumber: taxiLeg.staticInfo.driverNumber,
                exoNumber: taxiLeg.staticInfo.exoNumber,
                bookingId: createBookingId(taxiLeg.taxiBookingId),
            };
        }
        return null;
    })();

    const { busFleetNumber, busLegData } = getBusFleetInfo(allLegs);

    return {
        destination: destinationString,
        entireJourney: entireJourneyArr,
        currentStatus: currentStatusString,
        callDriverProps,
        onPressDetails,
        onPressStatusBadge,
        onPressViewTicket,
        onPressSwitchToWalk,
        onPressCallRide,
        onPressBoostRide,
        onPressMarkLegComplete,
        onPressViewTimetable,
        onMuteJourney,
        onCompleteJourney,
        onDirectRidePress,
        onViewJourneyPlan,
        onPressCheckIn,
        onRetryBooking,
        isLoading: false,
        currentLegBookingId: currentLeg.taxiBookingId,
        currentLegStatus: currentLeg.vehicleState,
        currentLegBookingStatus: currentLeg.bookingStatus,
        currentLegMode: currentLeg.transitMode,
        currentLegOrder: currentLeg.currentLeg,
        busFleetNumber,
        busLegData,
    };
};

export const getBusFleetInfo = (trackedData: ProcessedLegInfo[] | undefined) => {
    const publicTransportLegs =
        trackedData?.filter(
            leg => leg.transitMode === 'BUS' || leg.transitMode === 'METRO' || leg.transitMode === 'SUBWAY',
        ) || [];
    const isSingleBusLeg = publicTransportLegs.length === 1 && publicTransportLegs[0]?.transitMode === 'BUS';
    const busFleetNumber = isSingleBusLeg ? publicTransportLegs[0]?.realTimeInfo?.busFleetNumber : undefined;
    const busLegData = isSingleBusLeg ? publicTransportLegs[0] : undefined;

    return { busFleetNumber, busLegData };
};
