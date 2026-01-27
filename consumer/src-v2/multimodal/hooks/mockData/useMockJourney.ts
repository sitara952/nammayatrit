import { useState, useMemo } from 'react';
import { MOCKDATA, simulateJourneyEvents, JourneySimulationEvent } from './journeyTrackingMockData';
import { latLong, VehicleState, type ProcessedLegInfo } from '../../types/journeyTracking';

export const useMockJourney = () => {
    const [mockData, setMockData] = useState<ProcessedLegInfo[]>(MOCKDATA);

    const actions = useMemo(() => {
        const handleEvent = (event: JourneySimulationEvent) => {
            setMockData(currentData => simulateJourneyEvents([event], currentData));
        };

        return {
            checkIn: async (legOrder: string) => {
                const leg = mockData.find(l => l.staticInfo.legOrder === legOrder);
                if (leg) {
                    handleEvent({ type: 'USER_CHECK_IN', legIndex: mockData.indexOf(leg) });
                }
            },
            reachedStation: async (_legOrder: string) => {
                // TODO: Implement this
            },
            markLegComplete: async (legOrder: string) => {
                const leg = mockData.find(l => l.staticInfo.legOrder === legOrder);
                if (leg) {
                    // This is a simplified simulation. A more complex one might be needed.
                    handleEvent({ type: 'MARK_LEG_COMPLETE', legIndex: mockData.indexOf(leg) });
                }
            },
            updateLegStatus: async (legOrder: string, _newStatus: VehicleState) => {
                const leg = mockData.find(l => l.staticInfo.legOrder === legOrder);
                if (leg) {
                    // TODO: Implement this
                }
            },
            skipCurrentVehicle: async (legOrder: string) => {
                const leg = mockData.find(l => l.staticInfo.legOrder === legOrder);
                if (leg) {
                    handleEvent({ type: 'SKIP_CURRENT_VEHICLE', legIndex: mockData.indexOf(leg) });
                }
            },
            completeJourney: async () => {
                throw new Error('Not Implemented');
            },
            selectPricingId: async (_legOrder: string, _pricingId: string) => {
                // TODO: Implement this
            },
            switchBetweenAutoAndWalk: async (
                legOrder: number,
                newMode: string, // Assuming this is a string for simplicity
                riderLatLng: latLong | undefined, // Simplified type
            ) => {
                const leg = mockData.find(l => l.staticInfo.legOrder === String(legOrder));
                if (leg) {
                    //TODO
                    console.info('Switching to auto mode:', {
                        legOrder,
                        newMode,
                        riderLatLng,
                    });
                }
            },
            skipJourneyLeg: async (legOrder: string, journeyId: string) => {
                const leg = mockData.find(l => l.staticInfo.legOrder === legOrder);
                console.warn(`Leg with order ${legOrder} not found in journey ${journeyId} for skipping. leg ${leg}`);
                return false; // Simulating failure
            },
            rebookSkippedLeg: async (legOrder: string, journeyId: string) => {
                const leg = mockData.find(l => l.staticInfo.legOrder === legOrder);
                if (leg) {
                    // Simulate adding a booked skipped taxi
                    console.info(`Adding booked skipped taxi for leg ${legOrder} in journey ${journeyId}`);
                    return true; // Simulating success
                }
                console.warn(`Leg with order ${legOrder} not found in journey ${journeyId} for booking skipped taxi.`);
                return false; // Simulating failure
            },
        };
    }, [mockData]);

    const finalData = useMemo(() => {
        return {
            data: mockData,
            isLoading: false,
            error: null,
            actions,
        };
    }, [mockData, actions]);

    return finalData;
};
