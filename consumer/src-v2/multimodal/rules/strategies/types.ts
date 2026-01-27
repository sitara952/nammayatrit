import { ProcessedLegInfo, TransitMode } from '../../types/journeyTracking';
import { LocationWithTimestamp } from '../../hooks/useRiderLocation';
import { latLong } from '../../hooks/useJourneyTrackingData';
import { type latLong as LatLongType } from '@/readOnly/api/types/LatLong.gen';
import { JourneyId } from '@/typescript/state/client/user';

// The context object passed to each strategy
export interface StrategyContext {
    journeyId: JourneyId;
    leg: ProcessedLegInfo;
    legs: ProcessedLegInfo[];
    locationHistory: LocationWithTimestamp[];
    isFirstLeg: boolean;
    isLastLeg: boolean;
    isFirstIncompleteLeg: boolean;
    pastModes: { mode: TransitMode; changeoverPoint: LatLongType | undefined }[];
}

export type VerificationResult = { status: 'CONFIRMED' } | { status: 'POSSIBLE' } | { status: 'IMPOSSIBLE' };

// The strategy interface
export interface IJourneyStrategy {
    verify(context: StrategyContext): VerificationResult;
    update(context: StrategyContext): ProcessedLegInfo;
}

export interface LegStrategy {
    transitMode: TransitMode;
    changeoverPoint: latLong;
}
