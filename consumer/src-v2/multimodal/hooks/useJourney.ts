import { useJourneyTrackingData } from './useJourneyTrackingData';
import { useJourneyActions } from './useJourneyActions';
import { useMockJourney } from './mockData/useMockJourney';
import { type JourneyId } from '../../../src/typescript/state/client/user';
import { useMemo, useCallback } from 'react';
import { useJourneyNotificationSync } from './useJourneyNotificationSync';
import { type VehicleState } from '../types/journeyTracking';

export const useJourney = (journeyId: JourneyId | null, isFocused: boolean) => {
    const mockMode = false;
    const realJourneyActions = useJourneyActions(journeyId);

    // Create a stable callback ref to prevent recreation across screens
    // This ensures consistent status updates between Overview and Detail screens
    const stableOnLegStatusChange = useCallback(
        (legOrder: string, newStatus: VehicleState) => {
            // Non-manual updates go through the batching system
            realJourneyActions.updateLegStatus(legOrder, newStatus);
            return undefined;
        },
        [realJourneyActions.updateLegStatus],
    );

    const realJourneyData = useJourneyTrackingData(journeyId, {
        mockMode,
        onLegStatusChange: stableOnLegStatusChange,
        isFocused,
    });
    // Consume push notifications to optimistically sync auto/taxi leg statuses
    useJourneyNotificationSync(journeyId, realJourneyData.data);
    const mockJourney = useMockJourney();

    const finalData = useMemo(() => {
        if (mockMode) {
            return { ...mockJourney, updateLocationManually: () => {} };
        }

        return {
            ...realJourneyData,
            actions: realJourneyActions,
        };
    }, [mockMode, realJourneyData, realJourneyActions, mockJourney]);

    return finalData;
};
