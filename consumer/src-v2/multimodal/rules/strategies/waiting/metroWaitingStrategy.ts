import { IJourneyStrategy, StrategyContext, VerificationResult } from '../types';
import { isPointInPolygon } from '../../../utils/locationUtils';
import { calculateEta } from '../../../utils/journeyTrackingUtils';
import { getPossibleCheckInStations, verifyWaitingAtOrigin } from '../common';
import { ProcessedLegInfo, VehicleState } from '@/src-v2/multimodal/types/journeyTracking';

export class MetroWaitingStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        const result = verifyWaitingAtOrigin(context);

        // If verifyWaitingAtOrigin returns POSSIBLE, but user has already boarded metro,
        // prevent regression to waiting state.
        if (result.status === 'POSSIBLE' && context.leg.realTimeInfo.confirmedBoardingData) {
            return { status: 'IMPOSSIBLE' };
        }

        return result;
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const { originStopETAInMinutes, upcomingVehicleArrivals } = calculateEta(
            leg,
            leg.realTimeInfo.liveVehicleData,
            leg.riderLocation,
            context.pastModes,
        );

        const vehicleState = this.determineVehicleState(leg, originStopETAInMinutes);
        const possibleCheckInStations = getPossibleCheckInStations(leg.riderLocation, leg.staticInfo.onRouteStops);

        return {
            ...leg,
            userState: 'WAITING',
            insideSpecialZone: isPointInPolygon(leg.riderLocation, leg.staticInfo.origin.geoJson?.coordinates ?? []),
            vehicleState,
            realTimeInfo: {
                ...leg.realTimeInfo,
                originStopETAInMinutes,
                possibleCheckInStations,
                upcomingVehicleArrivals: upcomingVehicleArrivals.map(v => v.eta),
            },
        };
    }

    private determineVehicleState(leg: StrategyContext['leg'], originEta: number | undefined): VehicleState {
        if (leg.realTimeInfo.liveVehicleData.length === 0) {
            return 'NOLIVEDATA';
        }
        if (originEta === undefined) {
            return 'SEARCHINGFORVEHICLE';
        }
        if (originEta <= 1) {
            return 'VEHICLEARRIVED';
        }
        if (originEta <= 3) {
            return 'VEHICLEALMOSTARRIVED';
        }
        return 'VEHICLEISARRIVING';
    }
}
