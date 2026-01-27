import { IJourneyStrategy, StrategyContext, VerificationResult } from '../types';
import { findNextStop } from '../../../utils/locationUtils';
import { calculateTravelTime, calculateRouteBasedDistanceAndTime } from '../../../utils/journeyTrackingUtils';
import { round } from 'lodash';
import { verifyInsideVehicle } from '../common';
import { ProcessedLegInfo, VehicleState } from '@/src-v2/multimodal/types/journeyTracking';

export class BusInVehicleStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        return verifyInsideVehicle(context);
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const { riderLocation, staticInfo } = leg;

        const { remainingStops, currentStop } = findNextStop(riderLocation, staticInfo.onRouteStops);

        const routeBasedResult = calculateRouteBasedDistanceAndTime(
            riderLocation,
            staticInfo.destination.latLong,
            staticInfo.routeWaypoints,
            'BUS',
        );

        const { time, distance } =
            routeBasedResult ||
            calculateTravelTime(riderLocation, staticInfo.destination.latLong, [
                { mode: 'BUS', changeoverPoint: staticInfo.destination.latLong },
            ]);

        const destinationEta = round(time / 60);
        const preciseDestinationEta = time / 60;

        const vehicleState = this.determineVehicleState(leg, preciseDestinationEta);

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

    private determineVehicleState(_leg: StrategyContext['leg'], preciseDestinationEta: number): VehicleState {
        if (preciseDestinationEta <= 1) {
            return 'RIDEREACHEDDESTINATION';
        }
        if (preciseDestinationEta < 3) {
            return 'RIDECLOSETODESTINATION';
        }
        return 'RIDESTARTED';
    }
}
