import { ProcessedLegInfo } from '../../types/journeyTracking';
import { IJourneyStrategy, StrategyContext, VerificationResult } from './types';
import { round } from 'lodash';
import { calculateTravelTime } from '../../utils/journeyTrackingUtils';
import { verifyWalkOrTaxi } from './common';

const NEAR_DESTINATION_THRESHOLD_METERS = 100;

export class TaxiStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        const { leg } = context;
        // if ride started or close to destination, then always use the taxi strategy
        if (['RIDESTARTED', 'RIDECLOSETODESTINATION'].includes(leg?.vehicleState)) {
            return { status: 'CONFIRMED' };
        }
        // verify using walk status as user is not inside the Taxi yet
        return verifyWalkOrTaxi(context);
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const { riderLocation, staticInfo } = leg;

        const { time, distance } = calculateTravelTime(riderLocation, staticInfo.destination.latLong, [
            {
                mode: leg.vehicleState === 'RIDESKIPPED' ? 'WALK' : 'TAXI',
                changeoverPoint: staticInfo.destination.latLong,
            },
        ]);
        const destinationEta = round(time / 60);

        const getVehicleState = () => {
            if (['VEHICLEBOOKINGPENDING', 'RIDESKIPPED', 'NODRIVERFOUND'].includes(leg.vehicleState)) {
                if (distance < NEAR_DESTINATION_THRESHOLD_METERS) {
                    return 'RIDEREACHEDDESTINATION';
                }
                return leg.vehicleState;
            } else {
                return leg.vehicleState;
            }
        };
        const updatedLeg = {
            ...leg,
            vehicleState: getVehicleState(),
            realTimeInfo: {
                ...leg.realTimeInfo,
                destinationStopETAInMinutes: destinationEta,
            },
            distanceValue: round(distance),
        };

        return updatedLeg;
    }
}
