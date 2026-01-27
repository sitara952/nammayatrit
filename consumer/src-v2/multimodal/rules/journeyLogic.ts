import { type ProcessedLegInfo, VehicleState } from '../types/journeyTracking';
import { type LocationWithTimestamp } from '../hooks/useRiderLocation';
import { JourneyId } from '@/typescript/state/client/user';
import { StrategyManager } from './strategyManager';
import { hasConfirmedBoardingDataInCache, setConfirmedBoardingDataInCache } from '../utils/cache';
import { logger } from '@/src-v2/systems/logger';
import { logStrategyResult } from '../utils/fieldTestingLogger';
import { checkTaxiLeg } from '@/typescript/utils/common';

// Helper function for debugging status transitions
const logStatusTransition = (legOrder: string, oldStatus: VehicleState, newStatus: VehicleState, reason: string) => {
    if (oldStatus !== newStatus) {
        console.info(`[Status Transition] Leg ${legOrder}: ${oldStatus} → ${newStatus} (${reason})`);
    }
};

export const processJourneyData = (
    journeyId: JourneyId,
    legs: ProcessedLegInfo[],
    onLegStatusChange: (legOrder: string, newStatus: VehicleState) => void,
    locationHistory: LocationWithTimestamp[] | undefined = undefined,
    customerTags: string[] | undefined = undefined,
): ProcessedLegInfo[] => {
    const strategyManager = new StrategyManager();
    const legsCopy = legs.map(leg => ({ ...leg }));

    const lastKnownLegIndex = legsCopy.findIndex(leg => leg.vehicleState !== 'RIDEREACHEDDESTINATION');

    if (lastKnownLegIndex === -1) {
        return legsCopy;
    }
    // eslint-disable-next-line functional/no-let
    let confirmedLegIndex = -1;
    // eslint-disable-next-line functional/no-let
    let possibleLegIndex = -1;
    // eslint-disable-next-line functional/no-let
    let confirmedStrategyIndex = -1;
    // eslint-disable-next-line functional/no-let
    let possibleStrategyIndex = -1;

    // Verification Phase
    // eslint-disable-next-line functional/no-let
    for (let i = lastKnownLegIndex; i < legsCopy.length; i++) {
        const legToTest = legsCopy[i];
        if (!legToTest) continue;

        const nextLeg = legsCopy[i + 1];
        const strategiesToTest = strategyManager.getStrategiesForLeg(legToTest, nextLeg);

        const timestamp = new Date().toISOString();
        // eslint-disable-next-line functional/no-let
        for (let j = 0; j < strategiesToTest.length; j++) {
            const strategy = strategiesToTest[j] ?? strategyManager.getDefaultStrategy();
            const context = {
                journeyId,
                leg: legToTest,
                legs: legsCopy,
                locationHistory: locationHistory || [],
                isFirstLeg: i === 0,
                isLastLeg: i === legsCopy.length - 1,
                isFirstIncompleteLeg: i === lastKnownLegIndex,
                pastModes: [],
            };
            const result = strategy.verify(context);
            console.info(
                '[Strategy Verification] ',
                strategy.constructor.name,
                'result',
                result,
                'leg',
                legToTest.staticInfo.legOrder,
                'riderLocation',
                legToTest.riderLocation,
            );
            logger.logDebug(
                `Journey Id: ${journeyId || 'No Journey Id'}, JourneyStatusUpdate: ${JSON.stringify({
                    strategy: strategy.constructor.name,
                    result: result,
                    legToTest: legToTest.staticInfo.legOrder,
                    rawLocation: legToTest.riderLocation,
                })}`,
                'MultimodalTracking',
            );

            // Log to field testing CSV for all strategy results
            if (customerTags?.includes('FieldTest')) {
                logStrategyResult({
                    journeyId,
                    lat: legToTest.riderLocation?.lat || 0,
                    lng: legToTest.riderLocation?.lon || 0,
                    accuracy: legToTest.riderLocation?.accuracy,
                    locTimestamp: legToTest.riderLocation?.timestamp,
                    isManual: legToTest.riderLocation?.isManual,
                    timestamp,
                    strategyResult: {
                        strategyName: strategy.constructor.name,
                        result: result.status,
                    },
                    trackingStatus: legToTest.trackingStatus,
                    bookingStatus: legToTest.bookingStatus,
                    vehicleStatus: legToTest.vehicleState,
                    userStatus: legToTest.userState,
                    currentLegInfo: {
                        legOrder: legToTest.staticInfo.legOrder,
                        locationHistory: locationHistory || [],
                        mode: legToTest.transitMode,
                    },
                });
            }

            if (result.status === 'CONFIRMED') {
                confirmedLegIndex = i;
                confirmedStrategyIndex = j;
                break;
            }
            if (result.status === 'POSSIBLE') {
                if (possibleLegIndex === -1) {
                    const isWalkOrTaxi = checkTaxiLeg(legToTest.transitMode, true);

                    // Only consider 'POSSIBLE' if it's the first incomplete leg OR it's a subsequent leg that is NOT Walk Or Taxi.
                    if (i === lastKnownLegIndex || !isWalkOrTaxi) {
                        possibleLegIndex = i;
                        possibleStrategyIndex = j;
                    }
                }
            }
        }
        if (confirmedLegIndex !== -1) break;
    }

    const currentLegIndex = confirmedLegIndex !== -1 ? confirmedLegIndex : possibleLegIndex;
    const currentStrategyIndex = confirmedLegIndex !== -1 ? confirmedStrategyIndex : possibleStrategyIndex;

    // Calculation Phase
    if (currentLegIndex !== -1) {
        const legToUpdate = legsCopy[currentLegIndex];
        if (!legToUpdate) return legsCopy;
        const nextLeg = legsCopy[currentLegIndex + 1];
        const strategy =
            strategyManager.getStrategiesForLeg(legToUpdate, nextLeg)?.[currentStrategyIndex] ||
            strategyManager.getDefaultStrategy();
        const context = {
            journeyId,
            leg: legToUpdate,
            legs: legsCopy,
            locationHistory: locationHistory || [],
            isFirstLeg: currentLegIndex === 0,
            isFirstIncompleteLeg: currentLegIndex === lastKnownLegIndex,
            isLastLeg: currentLegIndex === legsCopy.length - 1,
            pastModes: [],
        };
        const update = strategy.update(context);

        if (update.realTimeInfo?.confirmedBoardingData) {
            if (!hasConfirmedBoardingDataInCache(journeyId, legToUpdate.staticInfo.legOrder)) {
                setConfirmedBoardingDataInCache(
                    journeyId,
                    legToUpdate.staticInfo.legOrder,
                    update.realTimeInfo.confirmedBoardingData,
                );
            }
        }

        const newLegs = legsCopy.map((leg, index) => {
            if (index < currentLegIndex) {
                if (leg.vehicleState !== 'RIDEREACHEDDESTINATION') {
                    logStatusTransition(
                        leg.staticInfo.legOrder,
                        leg.vehicleState,
                        'RIDEREACHEDDESTINATION',
                        'auto-completion',
                    );
                    onLegStatusChange(leg.staticInfo.legOrder, 'RIDEREACHEDDESTINATION');
                }
                return {
                    ...leg,
                    vehicleState: 'RIDEREACHEDDESTINATION' as const,
                    currentLeg: legToUpdate?.staticInfo.legOrder,
                };
            }
            if (index === currentLegIndex) {
                if (update.vehicleState !== 'NOLIVEDATA') {
                    logStatusTransition(
                        legToUpdate.staticInfo.legOrder,
                        legToUpdate.vehicleState,
                        update.vehicleState,
                        'location-based update',
                    );
                    onLegStatusChange(legToUpdate.staticInfo.legOrder, update.vehicleState);
                }
                return { ...leg, ...update, currentLeg: legToUpdate?.staticInfo.legOrder };
            }
            return { ...leg, currentLeg: legToUpdate?.staticInfo.legOrder };
        });

        return newLegs.map((leg, index) => {
            if (index > currentLegIndex) {
                const waitingStrategy = strategyManager.getWaitingStrategy(leg.transitMode);
                const currentLeg = newLegs[currentLegIndex];
                const futureContext = {
                    journeyId,
                    leg,
                    legs: newLegs,
                    locationHistory: locationHistory || [],
                    isFirstIncompleteLeg: index === lastKnownLegIndex,
                    isFirstLeg: index === 0,
                    isLastLeg: index === newLegs.length - 1,
                    pastModes: currentLeg
                        ? [
                              {
                                  mode: currentLeg.transitMode,
                                  changeoverPoint: currentLeg.staticInfo.destination.latLong,
                              },
                          ]
                        : [],
                };
                const futureUpdate = waitingStrategy.update(futureContext);
                return { ...leg, ...futureUpdate, userState: 'WAITING', currentLeg: legToUpdate?.staticInfo.legOrder };
            }
            return { ...leg, currentLeg: legToUpdate?.staticInfo.legOrder };
        });
    }

    const firstIncompleteLeg = legsCopy.find(l => l.vehicleState !== 'RIDEREACHEDDESTINATION');
    if (firstIncompleteLeg) {
        const firstIncompleteLegIndex = legsCopy.findIndex(
            l => l.staticInfo.legOrder === firstIncompleteLeg.staticInfo.legOrder,
        );
        if (firstIncompleteLegIndex !== -1) {
            return legsCopy.map((leg, index) => {
                if (index === firstIncompleteLegIndex) {
                    // For single mode bus only, skip FARAWAY state to avoid "Fix Location" alerts
                    const isSingleModeBus = leg.isFirstLeg && leg.transitMode === 'BUS';
                    const userState = isSingleModeBus ? 'WAITING' : 'FARAWAY';
                    return { ...leg, userState, currentLeg: firstIncompleteLeg.staticInfo.legOrder };
                }
                return { ...leg, currentLeg: firstIncompleteLeg.staticInfo.legOrder };
            });
        }
    }

    return legsCopy;
};
