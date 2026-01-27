import { ProcessedLegInfo } from '../../types/journeyTracking';
import { getBoundingBox, isPointInBoundingBox, isPointInPolygon } from '../../utils/locationUtils';
import { IJourneyStrategy, StrategyContext, VerificationResult } from './types';
import {
    inNearDestinationProximity,
    isLocationDataReliable,
    isLocationDataSuperReliable,
    isNearDestination,
} from './common';
import { isBookingStatusConfirmed } from '@/typescript/utils/LegStatusUtils';

// Highly Conservative Strategy
export class ExitStationStrategy implements IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult {
        const { leg } = context;
        const { riderLocation, staticInfo } = leg;

        // very sure to be inside the exit station
        if (
            staticInfo.destination.geoJson &&
            isLocationDataSuperReliable(riderLocation) &&
            isPointInPolygon(riderLocation, staticInfo.destination.geoJson.coordinates)
        ) {
            return { status: 'CONFIRMED' };
        }

        // if outside the exit station proximity or not even on the path then we can say for sure not at the exit station
        // extra check for path bounding box is if user by mistake does exit metro from inside the metro, we can always show exit station even if user inside the metro
        if (
            isLocationDataReliable(riderLocation) &&
            !inNearDestinationProximity(leg) &&
            !isPointInBoundingBox(riderLocation, getBoundingBox(staticInfo.filteredRouteWaypoints))
        ) {
            return { status: 'IMPOSSIBLE' };
        }

        return { status: 'POSSIBLE' };
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        const isInStation = isNearDestination(leg);
        const isOnRoute = isPointInBoundingBox(
            leg.riderLocation,
            getBoundingBox(leg.staticInfo.filteredRouteWaypoints),
        );
        const vehicleState =
            (isLocationDataSuperReliable(leg.riderLocation) && !isInStation && !isOnRoute) ||
            !isBookingStatusConfirmed(leg.bookingStatus)
                ? 'RIDEREACHEDDESTINATION'
                : 'ARRIVEDATSTATIONPLATFORM';
        return {
            ...leg,
            userState: 'EXITSTATION',
            vehicleState,
        };
    }
}
