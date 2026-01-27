import { useState } from 'react';
import { getTicketStatus } from '@/src-v2/multimodal/screens/LiveTicket/Tickets/TicketUtils.tsx';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react'; // Required for useFocusEffect useCallback
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { createMMKV } from '@/utils/mmkvUtils';

const storage = createMMKV();
const CACHED_JOURNEYS_KEY = 'cached_journeys';

export const getCachedJourneyInfoFromMMKV = (): journeyInfoResp[] => {
    try {
        const existingJourneysString = storage.getString(CACHED_JOURNEYS_KEY);
        if (!existingJourneysString) {
            return [];
        }
        const allJourneys = safeJsonParse<journeyInfoResp[]>(existingJourneysString, [], 'offline-journeys');
        const nonExpiredJourneys: journeyInfoResp[] = [];

        allJourneys.forEach(journey => {
            if (journey && journey.journeyStatus && journey.legs) {
                if (
                    getTicketStatus(
                        journey.journeyStatus,
                        journey.legs.length > 0,
                        journey.legs.map(l => l.legExtraInfo),
                    ) === 'live'
                ) {
                    // eslint-disable-next-line functional/immutable-data
                    nonExpiredJourneys.push(journey);
                }
            }
        });
        return nonExpiredJourneys;
    } catch (error) {
        console.error('Error retrieving cached journeys from MMKV:', error);
        return [];
    }
};

export const addJourneyToMMKV = (journeyData: journeyInfoResp) => {
    try {
        const existingJourneysString = storage.getString(CACHED_JOURNEYS_KEY);
        // eslint-disable-next-line functional/no-let
        let existingJourneys: journeyInfoResp[] = [];

        if (existingJourneysString) {
            existingJourneys = safeJsonParse<journeyInfoResp[]>(existingJourneysString, [], 'offline-journeys');
        }

        // Filter out expired journeys before adding/updating
        const nonExpiredExistingJourneys = existingJourneys.filter(journey => {
            if (journey && journey.journeyStatus && journey.legs) {
                return (
                    getTicketStatus(
                        journey.journeyStatus,
                        journey.legs.length > 0,
                        journey.legs.map(l => l.legExtraInfo),
                    ) === 'live'
                );
            }
            return false;
        });

        const index = nonExpiredExistingJourneys.findIndex(j => j.journeyId === journeyData.journeyId);

        if (index !== -1) {
            // Update existing journey
            // eslint-disable-next-line functional/immutable-data
            nonExpiredExistingJourneys[index] = journeyData;
        } else {
            // Add new journey
            // eslint-disable-next-line functional/immutable-data
            nonExpiredExistingJourneys.push(journeyData);
        }

        existingJourneys = nonExpiredExistingJourneys; // Update the reference to the filtered list

        storage.set(CACHED_JOURNEYS_KEY, JSON.stringify(existingJourneys));
    } catch (error) {
        console.error(`Error adding/updating journey ${journeyData.journeyId} to MMKV:`, error);
    }
};

export const removeJourneyFromMMKV = (journeyId: string) => {
    try {
        const existingJourneysString = storage.getString(CACHED_JOURNEYS_KEY);
        if (!existingJourneysString) return;

        const existingJourneys = safeJsonParse<journeyInfoResp[]>(existingJourneysString, [], 'offline-journeys');
        const filteredJourneys = existingJourneys.filter(j => j.journeyId !== journeyId);

        storage.set(CACHED_JOURNEYS_KEY, JSON.stringify(filteredJourneys));
    } catch (error) {
        console.error(`Error removing journey ${journeyId} from MMKV:`, error);
    }
};

export const clearOfflineTickets = () => {
    storage.delete(CACHED_JOURNEYS_KEY);
};

export const useOfflineTickets = () => {
    const [cachedJourneys, setCachedJourneys] = useState<journeyInfoResp[]>(getCachedJourneyInfoFromMMKV());

    const fetchJourneys = React.useCallback(() => {
        const journeys = getCachedJourneyInfoFromMMKV();
        const sortedJourneys = [...journeys].sort((a, b) => {
            const startTimeA = a.createdAt || '';
            const startTimeB = b.createdAt || '';
            return startTimeB.localeCompare(startTimeA);
        });
        setCachedJourneys(sortedJourneys);
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchJourneys();
        }, [fetchJourneys]),
    );

    return {
        cachedJourneys,
        addJourneyToMMKV,
    };
};
