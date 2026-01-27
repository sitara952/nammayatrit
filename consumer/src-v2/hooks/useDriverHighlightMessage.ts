import { useMemo, useEffect, useState } from 'react';
import { selectIsFavoriteWithId, selectPickupDistanceWithid } from '@/typescript/state/client/ride';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { RideId } from '@/typescript/state/client/booking';
import { selectDriverHighlightMessage, setDriverHighlightMessage } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { configManager } from '@/src-v2/systems/configs/configManager';
import { selectOperatingCity } from '@/typescript/state/client/session';
import { DriverHighlightConfig } from '@/src-v2/systems/configs/types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { strings } from 'config-types';
import { useKnowYourDriverRideIdGetQuery } from '@/api/integrations/rtk/KnowYourDriverRideIdGet';
import { logger } from '@/src-v2/systems/logger';

export enum DriverConditionType {
    FAVORITE = 'FAVORITE',
    WELL_RATED = 'WELL_RATED',
    LOW_CANCELLATION = 'LOW_CANCELLATION',
    NEARBY = 'NEARBY',
    EXPERIENCED = 'EXPERIENCED',
}

type ConditionMessages = readonly [string, string];

type DriverHighlightCondition = {
    condition: boolean;
    type: DriverConditionType;
    messages: ConditionMessages;
};

export type DriverHighlightResult = {
    message: string | null;
    conditionType: DriverConditionType | undefined;
};

const isWellRatedDriver = (
    rating: number | undefined,
    rideCount: number | undefined,
    ratingRules: { rating: number; minRideCount: number }[],
): boolean => {
    if (rating === undefined || rideCount === undefined) {
        return false;
    }

    return ratingRules.some(rule => rating >= rule.rating && rideCount >= rule.minRideCount);
};

const hasLowCancellationRate = (
    cancellationRate: number | undefined,
    rideCount: number | undefined,
    config: { maxRate: number; minRideCount: number },
): boolean => {
    if (cancellationRate === undefined || rideCount === undefined) {
        return false;
    }
    return cancellationRate < config.maxRate && rideCount >= config.minRideCount;
};

const isDriverNearby = (pickupDistance: number | undefined, thresholdMeters: number): boolean => {
    if (pickupDistance === undefined) return false;
    return pickupDistance < thresholdMeters;
};

const isHighlyExperienced = (numTrips: number | undefined, experiencedThreshold: number): boolean => {
    if (numTrips === undefined) return false;
    return numTrips > experiencedThreshold;
};

/**
 * Hook that determines which positive driver highlight message to show to reduce cancellations
 *
 * @param rideId - The current ride ID
 * @param bookingId - The current booking ID
 * @param driverRating - The driver's rating
 * @returns An object with the message highlighting positive driver attributes and the condition type
 */
export const useDriverHighlightMessage = (
    rideId: RideId | null,
    bookingId: BookingId | null,
    driverRating: number | undefined,
): DriverHighlightResult => {
    const dispatch = useAppDispatch();
    const operatingCity = useAppSelector(selectOperatingCity);
    const configContext = useConfigContext();
    const userLanguageStrings: strings = configContext.get('userLanguageStrings');
    const [shouldLoadDriverProfile, setShouldLoadDriverProfile] = useState(false);
    const [selectedConditionType, setSelectedConditionType] = useState<DriverConditionType | undefined>(undefined);

    // Add state to track if we're fully loaded and ready to show a message
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const getDriverHighlightConfig = useMemo((): DriverHighlightConfig => {
        const cityConfig = configManager.getDriverHighlightConfig(operatingCity);
        return cityConfig;
    }, [operatingCity, rideId]);

    const isFeatureEnabled = useMemo(() => getDriverHighlightConfig.enabled, [getDriverHighlightConfig]);

    const { data: driverProfileData } = useKnowYourDriverRideIdGetQuery(
        {
            rideId: rideId ?? '',
            isImages: false,
        },
        {
            skip: !shouldLoadDriverProfile || !rideId || !isFeatureEnabled,
        },
    );

    useEffect(() => {
        if (rideId && isFeatureEnabled) {
            // Reset data loaded state when ride ID changes
            setIsDataLoaded(false);

            const timer = setTimeout(() => {
                setShouldLoadDriverProfile(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
        return () => {};
    }, [rideId, isFeatureEnabled]);

    const driverStats = driverProfileData?.response?.driverStats;
    const numberOfTrips = driverProfileData?.response?.driverStats?.numTrips;

    const persistedMessage = useAppSelector(state => selectDriverHighlightMessage(state, bookingId));
    const isFavorite = useAppSelector(state => selectIsFavoriteWithId(state, rideId));
    const pickupDistance = useAppSelector(state => selectPickupDistanceWithid(state, rideId));

    // Set data loaded state when we have all the necessary data
    useEffect(() => {
        if (rideId && driverStats && pickupDistance !== undefined) {
            setIsDataLoaded(true);
        }
    }, [rideId, driverStats, pickupDistance]);

    const driverIsWellRated = useMemo(
        () => isWellRatedDriver(driverRating, driverStats?.numTrips, getDriverHighlightConfig.ratingRules),
        [driverRating, driverStats?.numTrips, getDriverHighlightConfig.ratingRules],
    );

    const driverHasLowCancellation = useMemo(
        () =>
            hasLowCancellationRate(
                driverStats?.cancellationRate,
                driverStats?.numTrips,
                getDriverHighlightConfig.lowCancellationRate,
            ),
        [driverStats?.cancellationRate, driverStats?.numTrips, getDriverHighlightConfig.lowCancellationRate],
    );

    const driverIsNearby = useMemo(
        () => isDriverNearby(pickupDistance, getDriverHighlightConfig.nearbyThresholdMeters),
        [pickupDistance, getDriverHighlightConfig.nearbyThresholdMeters],
    );

    const driverIsExperienced = useMemo(
        () => isHighlyExperienced(driverStats?.numTrips, getDriverHighlightConfig.experiencedDriverThreshold),
        [driverStats?.numTrips, getDriverHighlightConfig.experiencedDriverThreshold],
    );

    // Define message map for each condition type
    const messageMap = useMemo(
        (): Record<DriverConditionType, ConditionMessages> => ({
            [DriverConditionType.FAVORITE]: [
                userLanguageStrings.FavoriteDriverHere,
                userLanguageStrings.TrustedDriverPreferred,
            ],
            [DriverConditionType.WELL_RATED]: [
                userLanguageStrings.WellRatedDriverExp,
                userLanguageStrings.QualityServiceDriver,
            ],
            [DriverConditionType.LOW_CANCELLATION]: [
                userLanguageStrings.ReliableDriverShowsUp,
                userLanguageStrings.ConsistentDriverTrust,
            ],
            [DriverConditionType.NEARBY]: [
                userLanguageStrings.NearbyDriverQuickPickup,
                userLanguageStrings.QuickPickupDriverNearby,
            ],
            [DriverConditionType.EXPERIENCED]: [
                userLanguageStrings.ExperiencedDriverService,
                userLanguageStrings.VeteranDriverTrusted(numberOfTrips ?? 0),
            ],
        }),
        [userLanguageStrings, numberOfTrips],
    );

    // Build condition array with their respective messages
    const conditions: readonly DriverHighlightCondition[] = useMemo(() => {
        return [
            {
                condition: !!isFavorite,
                type: DriverConditionType.FAVORITE,
                messages: messageMap[DriverConditionType.FAVORITE],
            },
            {
                condition: driverIsWellRated,
                type: DriverConditionType.WELL_RATED,
                messages: messageMap[DriverConditionType.WELL_RATED],
            },
            {
                condition: driverHasLowCancellation,
                type: DriverConditionType.LOW_CANCELLATION,
                messages: messageMap[DriverConditionType.LOW_CANCELLATION],
            },
            {
                condition: driverIsNearby,
                type: DriverConditionType.NEARBY,
                messages: messageMap[DriverConditionType.NEARBY],
            },
            {
                condition: driverIsExperienced,
                type: DriverConditionType.EXPERIENCED,
                messages: messageMap[DriverConditionType.EXPERIENCED],
            },
        ];
    }, [isFavorite, driverIsWellRated, driverHasLowCancellation, driverIsNearby, driverIsExperienced, messageMap]);

    const generatedMessageAndType = useMemo(() => {
        // Don't make any decisions until we have a valid rideId
        if (!rideId) {
            return { message: null, conditionType: undefined };
        }

        if (!isFeatureEnabled) {
            logger.logInfo(`DriverHighlight:${rideId} Feature disabled in config`, 'DriverHighlight');
            return { message: null, conditionType: undefined };
        }

        if (persistedMessage && rideId) {
            // For persisted messages, we need to determine the condition type
            // Check all conditions to see which one might have generated this message
            const matchingCondition = conditions.find(condition => condition.messages.includes(persistedMessage));

            // Only use the persisted message if its condition is still valid
            if (matchingCondition && matchingCondition.condition) {
                return {
                    message: persistedMessage,
                    conditionType: matchingCondition.type,
                };
            }
        }

        logger.logInfo(
            `DriverHighlight:${rideId} All conditions: ${JSON.stringify(conditions.map(c => ({ type: c.type, condition: c.condition })))}`,
            'DriverHighlight',
        );

        const validConditions = conditions.filter(condition => condition.condition);
        logger.logInfo(
            `DriverHighlight:${rideId} Valid conditions: ${JSON.stringify(validConditions.map(c => c.type))}`,
            'DriverHighlight',
        );

        if (validConditions.length === 0) {
            if (persistedMessage && bookingId) {
                dispatch(
                    setDriverHighlightMessage({
                        id: bookingId,
                        payload: null,
                    }),
                );
            }

            logger.logInfo(`DriverHighlight:${rideId} No valid conditions found`, 'DriverHighlight');
            return { message: null, conditionType: undefined };
        }

        const conditionIndex = Math.floor(Math.random() * validConditions.length);
        const selectedCondition = validConditions[conditionIndex];

        if (!selectedCondition) {
            logger.logInfo(`DriverHighlight:${rideId} No condition selected`, 'DriverHighlight');
            return { message: null, conditionType: undefined };
        }

        logger.logInfo(
            `DriverHighlight:${rideId} Selected condition type: ${selectedCondition.type}`,
            'DriverHighlight',
        );

        // Select a message randomly
        const messages = selectedCondition.messages;
        const messageIndex = Math.floor(Math.random() * messages.length);
        const selectedMessage = messages[messageIndex] || null;

        // Save the selected condition type
        if (selectedCondition.type) {
            setSelectedConditionType(selectedCondition.type);
        }

        logger.logInfo(`DriverHighlight:${rideId} Final selected message: ${selectedMessage}`, 'DriverHighlight');
        return { message: selectedMessage, conditionType: selectedCondition.type };
    }, [persistedMessage, conditions, bookingId, rideId, isFeatureEnabled, selectedConditionType]);

    // Storing the generated message in redux if we don't have a persisted message yet
    useEffect(() => {
        if (bookingId && generatedMessageAndType.message && !persistedMessage) {
            dispatch(
                setDriverHighlightMessage({
                    id: bookingId,
                    payload: generatedMessageAndType.message,
                }),
            );
        }
    }, [dispatch, bookingId, generatedMessageAndType.message, persistedMessage]);

    // Only return a message when all data is loaded
    if (!isDataLoaded) {
        return {
            message: null,
            conditionType: undefined,
        };
    }

    return {
        message: generatedMessageAndType.message,
        conditionType: generatedMessageAndType.conditionType,
    };
};
