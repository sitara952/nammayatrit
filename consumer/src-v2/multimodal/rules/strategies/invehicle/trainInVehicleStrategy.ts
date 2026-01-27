import { IJourneyStrategy, StrategyContext, VerificationResult } from '../types';
import { findNextStop } from '../../../utils/locationUtils';
import { calculateTravelTime } from '../../../utils/journeyTrackingUtils';
import { round } from 'lodash';
import { verifyInsideVehicle } from '../common';
import { ProcessedLegInfo, VehicleState } from '@/src-v2/multimodal/types/journeyTracking';

export class TrainInVehicleStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        return verifyInsideVehicle(context);
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const { riderLocation, staticInfo } = leg;

        const { remainingStops, currentStop } = findNextStop(riderLocation, staticInfo.onRouteStops);

        const { time, distance } = calculateTravelTime(riderLocation, staticInfo.destination.latLong, [
            { mode: 'SUBWAY', changeoverPoint: staticInfo.destination.latLong },
        ]);
        const destinationEta = round(time / 60);

        const vehicleState = this.determineVehicleState(leg, destinationEta);

        return {
            ...leg,
            userState: 'INVEHICLE',
            vehicleState,
            insideSpecialZone: leg.insideSpecialZone,
            realTimeInfo: {
                ...leg.realTimeInfo,
                destinationStopETAInMinutes: destinationEta,
                currentStop,
                remainingStops,
            },
            distanceValue: round(distance),
        };
    }

    private determineVehicleState(_leg: StrategyContext['leg'], destinationEta: number): VehicleState {
        if (destinationEta <= 1) {
            return 'ARRIVEDATSTATIONPLATFORM';
        }
        if (destinationEta < 3) {
            return 'RIDECLOSETODESTINATION';
        }
        return 'RIDESTARTED';
    }
}
