import { useRef, useCallback, useMemo, useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-native';
import { createMMKV } from '@/utils/mmkvUtils';
import { getBestPossibleLocation } from '@/typescript/utils/location';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { useMultimodalJourneyIdRiderLocationPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdRiderLocationPost';
import { latLong } from '@/readOnly/api/types/LatLong.gen';
import { JourneyId } from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    updateLegsStatus,
    updateNextStops,
    updateVehiclePosition,
    selectJourneyLegs,
} from '@/typescript/state/client/journey';
import { updateJourneyStatus, updateJourneyPaymentStatus } from '@/typescript/state/client/journey';
import { setCurrentLocation } from '@/typescript/state/client/session';
import { selectBookingId, setBookingId } from '@/typescript/state/client/user';
import { selectToken } from '@/typescript/state/client/auth';
import { useNetworkAware } from './useNetworkAware';
import { logger } from '@/src-v2/systems/logger';
import { min } from 'lodash';
import { useLocationStatusContext } from '@/typescript/context/LocationStatusContext';

const DEFAULT_POLLING_INTERVAL = 10000;
const OFFLINE_LOCATION_UPDATE_INTERVAL = 20000;

const GOOD_ACCURACY_THRESHOLD = 100; // meters
const LOCATION_HISTORY_SIZE = 10;
const LOCATION_TIMEOUT_MS = 120000; // 2 minutes
const MANUAL_LOCATION_TIMEOUT_MS = 300000; // 5 minutes
const STATIC_LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds

const LOCATION_HISTORY_KEY = 'rider_location_history';

const storage = createMMKV();

export interface LocationWithTimestamp extends latLong {
    timestamp: number;
    accuracy: number;
    isManual: boolean;
}

interface MockLocation {
    lat: number;
    lon: number;
    accuracy: number;
}

const mockLocations: MockLocation[] = [
    { lat: 12.973022, lon: 77.61702, accuracy: 43 },
    { lat: 12.973272, lon: 77.615997, accuracy: 34 },
    { lat: 12.973523, lon: 77.614974, accuracy: 33 },
    { lat: 12.973773, lon: 77.613951, accuracy: 71 },
    { lat: 12.974024, lon: 77.612928, accuracy: 89 },
    { lat: 12.974274, lon: 77.611905, accuracy: 40 },
    { lat: 12.974524, lon: 77.610882, accuracy: 88 },
    { lat: 12.974775, lon: 77.609859, accuracy: 59 },
    { lat: 12.975025, lon: 77.608836, accuracy: 82 },
    { lat: 12.975276, lon: 77.607813, accuracy: 91 },
    { lat: 12.975526, lon: 77.60679, accuracy: 50 },
    { lat: 12.976069, lon: 77.605868, accuracy: 39 },
    { lat: 12.976612, lon: 77.604946, accuracy: 80 },
    { lat: 12.977156, lon: 77.604024, accuracy: 38 },
    { lat: 12.977699, lon: 77.603102, accuracy: 88 },
    { lat: 12.978242, lon: 77.60218, accuracy: 47 },
    { lat: 12.978785, lon: 77.601258, accuracy: 41 },
    { lat: 12.979328, lon: 77.600336, accuracy: 43 },
    { lat: 12.979872, lon: 77.599414, accuracy: 76 },
    { lat: 12.980415, lon: 77.598492, accuracy: 44 },
    { lat: 12.980958, lon: 77.59757, accuracy: 95 },
    { lat: 12.980736, lon: 77.596977, accuracy: 99 },
    { lat: 12.980515, lon: 77.596384, accuracy: 32 },
    { lat: 12.980293, lon: 77.595791, accuracy: 68 },
    { lat: 12.980072, lon: 77.595198, accuracy: 70 },
    { lat: 12.97985, lon: 77.594605, accuracy: 91 },
    { lat: 12.979628, lon: 77.594012, accuracy: 59 },
    { lat: 12.979407, lon: 77.593419, accuracy: 70 },
    { lat: 12.979185, lon: 77.592826, accuracy: 92 },
    { lat: 12.978964, lon: 77.592233, accuracy: 40 },
];

const useMockLocation = false;
const stopAt: number | undefined = undefined;

// Helper functions for caching location data
const saveLocationHistory = (history: LocationWithTimestamp[]) => {
    try {
        storage.set(LOCATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('[RiderLocation] Failed to save location history:', error);
    }
};

const loadLocationHistory = (): LocationWithTimestamp[] => {
    try {
        const historyJson = storage.getString(LOCATION_HISTORY_KEY);
        if (historyJson) {
            return safeJsonParse<LocationWithTimestamp[]>(historyJson, [], 'loadLocationHistory');
        }
    } catch (error) {
        console.error('[RiderLocation] Failed to load location history:', error);
    }
    return [];
};

interface RiderLocationResult {
    currentLocation: LocationWithTimestamp | null;
    history: LocationWithTimestamp[];
    updateLocationManually: (location: latLong) => void;
}

export const useRiderLocation = ({
    journeyId,
    isFocused,
    pollingInterval,
}: {
    journeyId: JourneyId | null;
    mock: boolean | undefined;
    isFocused: boolean;
    pollingInterval: number | undefined;
}): RiderLocationResult => {
    const riderLocationRef = useRef<LocationWithTimestamp | null>(null);
    const locationHistoryRef = useRef<LocationWithTimestamp[]>([]);
    const mockLocationIndexRef = useRef<number>(0);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const dispatch = useAppDispatch();
    const { shouldMakeApiCalls } = useNetworkAware();
    const userToken = useAppSelector(selectToken);
    const currentBookingId = useAppSelector(selectBookingId);
    const journeyLegs = useAppSelector(state => selectJourneyLegs(state, journeyId));
    const [postRiderLocation] = useMultimodalJourneyIdRiderLocationPostMutation({
        selectFromResult: () => ({}),
    });
    const isActiveRef = useRef(true);
    const { updateLocationHistoryForStatus } = useLocationStatusContext();

    useEffect(() => {
        locationHistoryRef.current = loadLocationHistory();
        const lastLocation = locationHistoryRef.current[locationHistoryRef.current.length - 1];
        if (lastLocation) {
            riderLocationRef.current = lastLocation;
        }
        updateLocationHistoryForStatus([...locationHistoryRef.current]);
    }, []);

    const processLocation = useCallback((rawLocation: LocationWithTimestamp): LocationWithTimestamp | null => {
        const now = Date.now();
        const history = [...locationHistoryRef.current];

        if (rawLocation.accuracy <= GOOD_ACCURACY_THRESHOLD) {
            const newHistory = [...history, rawLocation].slice(-LOCATION_HISTORY_SIZE);
            locationHistoryRef.current = newHistory;
            saveLocationHistory(newHistory);
            updateLocationHistoryForStatus(newHistory);
            return rawLocation;
        }

        const recentLocation = [...history]
            .reverse()
            .find(
                loc =>
                    now - loc.timestamp < LOCATION_TIMEOUT_MS ||
                    (loc.isManual && now - loc.timestamp < MANUAL_LOCATION_TIMEOUT_MS),
            );
        if (recentLocation) {
            return recentLocation;
        }

        const newFilteredLocation: LocationWithTimestamp = { ...rawLocation, isManual: false };
        const newHistory = [...history, newFilteredLocation].slice(-LOCATION_HISTORY_SIZE);
        locationHistoryRef.current = newHistory;
        saveLocationHistory(newHistory);
        updateLocationHistoryForStatus(newHistory);
        return newFilteredLocation;
    }, []);

    const updateLocation = useCallback(
        async (location: LocationWithTimestamp, isManualUpdate: boolean = false) => {
            if (!journeyId || !isActiveRef.current || !isFocused) return;

            // Check if location has actually changed
            console.info('[RiderLocation] hasLocationActualChanged', riderLocationRef.current, location);
            const hasLocationChanged =
                riderLocationRef.current?.lat !== location.lat || riderLocationRef.current?.lon !== location.lon;

            // if location has changed or it's been 30 seconds since last update, update the location
            if (
                hasLocationChanged ||
                !riderLocationRef.current ||
                Date.now() - riderLocationRef.current.timestamp > STATIC_LOCATION_UPDATE_INTERVAL ||
                isManualUpdate
            ) {
                riderLocationRef.current = location;
                logger.logDebug(
                    `Journey Id: ${journeyId || 'No Journey Id'}, currentLocation: ${riderLocationRef.current} - Rider location result updated (${hasLocationChanged ? 'significant change' : 'periodic update'})`,
                    'MultimodalTracking',
                );
            } else {
                console.info('[RiderLocation] Location unchanged, skipping ref update');
                return;
            }

            // Only make API calls if we have internet
            if (!shouldMakeApiCalls) {
                console.info('[RiderLocation] Offline mode: skipping API call, location updated locally');
                return;
            }

            const currTime = new Date().toISOString();
            try {
                const resp = await postRiderLocation({ journeyId, body: { latLong: location, currTime } });

                if (!isActiveRef.current || !resp.data) return;

                // Batch all dispatches together in async contexts like interval
                unstable_batchedUpdates(() => {
                    dispatch(
                        setCurrentLocation({
                            lat: location.lat,
                            lng: location.lon,
                            placeId: undefined,
                            title: undefined,
                            subtitle: undefined,
                            formattedAddress: undefined,
                            tag: 'AUTOCOMPLETE',
                            addressComponents: undefined,
                            serviceable: undefined,
                            serviceabilityCity: undefined,
                            specialLocation: undefined,
                            locationType: undefined,
                            distanceFromCurrentLocation: undefined,
                            hotSpotInfo: undefined,
                        }),
                    );
                    dispatch(updateJourneyStatus({ id: journeyId, payload: resp.data.journeyStatus }));
                    dispatch(
                        updateJourneyPaymentStatus({
                            id: journeyId,
                            payload: resp.data.journeyPaymentStatus ?? null,
                        }),
                    );

                    const legs = resp.data.legs;
                    if (legs) {
                        dispatch(updateLegsStatus({ id: journeyId, payload: legs }));
                        dispatch(updateVehiclePosition({ id: journeyId, payload: legs }));
                        dispatch(updateNextStops({ id: journeyId, payload: legs }));

                        // Clear global bookingId when a Taxi leg finishes to prevent subsequent taxi legs consuming it.
                        if (journeyLegs && currentBookingId) {
                            const statusByOrder = new Map(legs.map(ls => [ls.legOrder, ls.trackingStatus]));
                            for (const leg of journeyLegs) {
                                if (leg?.legExtraInfo?.TAG !== 'Taxi') continue;
                                const bookingId = leg?.legExtraInfo?._0?.bookingId;
                                const status = statusByOrder.get(leg.order);
                                if (bookingId && bookingId === currentBookingId && status === 'Finished') {
                                    dispatch(setBookingId({ id: userToken, payload: null }));
                                    break;
                                }
                            }
                        }
                    }
                });
            } catch (err) {
                console.error('Update rider location failed: ', err);
            }
        },
        [journeyId, postRiderLocation, dispatch, shouldMakeApiCalls],
    );

    // Mock location processing function
    const getNextMockLocation = useCallback((): LocationWithTimestamp => {
        if (!mockLocations.length) {
            console.warn('[RiderLocation] No mock locations provided');
            throw new Error('No mock locations provided');
        }

        const currentIndex = mockLocationIndexRef.current;
        const mockLocation = mockLocations[currentIndex];

        if (!mockLocation) {
            console.warn(`[RiderLocation] Mock location at index ${currentIndex} not found`);
            throw new Error(`Mock location at index ${currentIndex} not found`);
        }

        // Cycle to next location for next call
        mockLocationIndexRef.current = min([currentIndex + 1, stopAt ? stopAt : mockLocations.length - 1]) ?? 0;

        const locationWithTimestamp: LocationWithTimestamp = {
            lat: mockLocation.lat,
            lon: mockLocation.lon,
            accuracy: mockLocation.accuracy,
            timestamp: Date.now(),
            isManual: false,
        };

        console.info(
            `[RiderLocation] Using mock location ${currentIndex + 1}/${mockLocations.length}: ` +
                `lat=${mockLocation.lat}, lon=${mockLocation.lon}, accuracy=${mockLocation.accuracy}m`,
        );

        return locationWithTimestamp;
    }, []);

    const getRawLocation = useCallback(async (): Promise<LocationWithTimestamp> => {
        if (useMockLocation) {
            return getNextMockLocation();
        }
        const rawLocation = await getBestPossibleLocation();
        logger.logDebug(
            `Journey Id: ${journeyId || 'No Journey Id'}, rawLocation: ${rawLocation} - Rider location result fetched`,
            'MultimodalTracking',
        );
        return {
            lat: rawLocation.coords.latitude,
            lon: rawLocation.coords.longitude,
            accuracy: rawLocation.coords.accuracy,
            timestamp: rawLocation.timestamp,
            isManual: false,
        };
    }, [useMockLocation, getNextMockLocation]);

    useEffect(() => {
        // Always clear any existing interval when dependencies change
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }

        if (!isFocused) {
            console.info('RiderLocation: Not focused, skipping interval start');
            isActiveRef.current = false;
            return;
        }

        console.info('RiderLocation: Starting interval');
        isActiveRef.current = true;

        // Use different intervals based on connectivity and current leg
        const onlineInterval = pollingInterval ?? DEFAULT_POLLING_INTERVAL;
        const interval = shouldMakeApiCalls ? onlineInterval : OFFLINE_LOCATION_UPDATE_INTERVAL;

        intervalIdRef.current = setInterval(async () => {
            try {
                const rawLocation = await getRawLocation();
                // Process the location with validation and smoothing
                const processedLocation = processLocation(rawLocation);

                if (processedLocation && isActiveRef.current) {
                    updateLocation(processedLocation);
                }
            } catch (error) {
                console.error('Geolocation.getCurrentPosition error', error);

                const lastKnownLocation = locationHistoryRef.current[locationHistoryRef.current.length - 1];
                if (
                    lastKnownLocation &&
                    (Date.now() - lastKnownLocation.timestamp < LOCATION_TIMEOUT_MS ||
                        (lastKnownLocation.isManual &&
                            Date.now() - lastKnownLocation.timestamp < MANUAL_LOCATION_TIMEOUT_MS))
                ) {
                    if (isActiveRef.current) {
                        updateLocation(lastKnownLocation);
                    }
                }
            }
        }, interval);

        // Run once immediately so user doesn't wait for first interval
        // Initial poll
        getRawLocation()
            .then(rawLocation => {
                // Process the location with validation and smoothing
                const processedLocation = processLocation(rawLocation);

                if (processedLocation && isActiveRef.current) {
                    updateLocation(processedLocation);
                }
            })
            .catch(error => {
                console.error('Initial geolocation error', error);
            });

        return () => {
            isActiveRef.current = false;
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
            intervalIdRef.current = null;
        };
    }, [isFocused, shouldMakeApiCalls, pollingInterval]);

    const updateLocationManually = useCallback(
        (location: latLong) => {
            const newLocation: LocationWithTimestamp = {
                ...location,
                timestamp: Date.now(),
                accuracy: 1, // High accuracy for manual updates
                isManual: true,
            };
            const newHistory = [newLocation]; //clear the history and add the new manual location
            locationHistoryRef.current = newHistory;
            saveLocationHistory(newHistory);
            updateLocationHistoryForStatus(newHistory);
            updateLocation(newLocation, true);
        },
        [updateLocation],
    );

    const result: RiderLocationResult = useMemo(() => {
        const currentLocation = riderLocationRef.current ?? null;

        return {
            currentLocation,
            history: [...locationHistoryRef.current],
            updateLocationManually,
        };
    }, [riderLocationRef.current, locationHistoryRef.current, updateLocationManually]);

    return result;
};
