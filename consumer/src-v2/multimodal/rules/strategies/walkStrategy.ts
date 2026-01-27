import { IJourneyStrategy, StrategyContext, VerificationResult } from './types';
import { round } from 'lodash';
import { calculateTravelTime } from '../../utils/journeyTrackingUtils';
import { isPointInPolygon } from '../../utils/locationUtils';
import { ProcessedLegInfo } from '../../types/journeyTracking';
import { verifyWalkOrTaxi } from './common';

const NEAR_DESTINATION_THRESHOLD_METERS = 200;
const AT_DESTINATION_THRESHOLD_METERS = 100;

export class WalkStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        return verifyWalkOrTaxi(context);
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const { riderLocation, staticInfo } = leg;
        const insideSpecialZone = staticInfo.origin.geoJson
            ? isPointInPolygon(riderLocation, staticInfo.origin.geoJson.coordinates)
            : false;
        const { time, distance } = calculateTravelTime(riderLocation, staticInfo.destination.latLong, [
            { mode: 'WALK', changeoverPoint: staticInfo.destination.latLong },
        ]);
        const destinationEta = round(time / 60);

        const getVehicleState = () => {
            if (distance < AT_DESTINATION_THRESHOLD_METERS && !insideSpecialZone) {
                return 'RIDEREACHEDDESTINATION';
            }
            if (distance < NEAR_DESTINATION_THRESHOLD_METERS) {
                return 'RIDECLOSETODESTINATION';
            }
            return 'RIDESTARTED';
        };

        const vehicleState = getVehicleState();

        return {
            ...leg,
            userState: 'WALK',
            vehicleState,
            insideSpecialZone,
            realTimeInfo: {
                ...leg.realTimeInfo,
                destinationStopETAInMinutes: destinationEta,
            },
            distanceValue: round(distance),
        };
    }
}
