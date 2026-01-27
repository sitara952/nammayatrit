import { ProcessedLegInfo } from '../../types/journeyTracking';
import { IJourneyStrategy, StrategyContext, VerificationResult } from './types';

export class DefaultStrategy implements IJourneyStrategy {
    verify(_context: StrategyContext): VerificationResult {
        return { status: 'IMPOSSIBLE' };
    }

    update(context: StrategyContext): ProcessedLegInfo {
        const { leg } = context;
        return leg;
    }
}
