import { IJourneyStrategy, StrategyContext, VerificationResult } from '../types';
import { isPointInPolygon } from '../../../utils/locationUtils';
import { calculateEta } from '../../../utils/journeyTrackingUtils';
import { verifyWaitingAtOrigin } from '../common';
import { ProcessedLegInfo, VehicleState } from '@/src-v2/multimodal/types/journeyTracking';

export class BusWaitingStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        return verifyWaitingAtOrigin(context);
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const {
            originStopETAInMinutes,
            upcomingVehicleArrivals,
            currentLiveVehicle,
            originStopRemainingStops,
            currentStop,
        } = calculateEta(leg, leg.realTimeInfo.liveVehicleData, leg.riderLocation, context.pastModes);

        const vehicleState = this.determineVehicleState(leg, originStopETAInMinutes, originStopRemainingStops);

        return {
            ...leg,
            userState: 'WAITING',
            vehicleState,
            insideSpecialZone: isPointInPolygon(leg.riderLocation, leg.staticInfo.origin.geoJson?.coordinates ?? []),
            realTimeInfo: {
                ...leg.realTimeInfo,
                remainingStops: originStopRemainingStops,
                originStopETAInMinutes,
                currentLiveVehicle,
                upcomingVehicleArrivals: upcomingVehicleArrivals.map(v => v.eta),
                currentStop: currentStop,
            },
        };
    }

    private determineVehicleState(
        leg: StrategyContext['leg'],
        originEta: number | undefined,
        remainingStops: number | undefined,
    ): VehicleState {
        if (leg.realTimeInfo.liveVehicleData.length === 0) {
            return 'NOLIVEDATA';
        }
        if (originEta === undefined) {
            return 'SEARCHINGFORVEHICLE';
        }

        // Prioritize remaining stops if available
        if (remainingStops !== undefined) {
            if (remainingStops <= 1) {
                return 'VEHICLEARRIVED';
            }
            if (remainingStops <= 2) {
                return 'VEHICLEALMOSTARRIVED';
            }
            return 'VEHICLEISARRIVING';
        }

        // Fallback to ETA
        if (originEta <= 1) {
            return 'VEHICLEARRIVED';
        }
        if (originEta <= 3) {
            return 'VEHICLEALMOSTARRIVED';
        }
        return 'VEHICLEISARRIVING';
    }
}
