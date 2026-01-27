import { createMMKV } from '@/utils/mmkvUtils';
import { Dimensions } from 'react-native';
import { safeJsonParse } from '../../components/SafeJsonParser';
import { MapRef } from '../../../src/typescript/Maps/MapComponent';
import React from 'react';
import { AppStateHolder, selectAppConfig } from '@/typescript/state/client/session';
import { store } from '@/typescript/state/store';

const storage = createMMKV();

const SNAPSHOT_EXPIRY_HOURS = 24;

export const setMapSnapshotWithExpiry = (journeyId: string, snapshotUri: string): void => {
    try {
        const expiryTime = Date.now() + SNAPSHOT_EXPIRY_HOURS * 60 * 60 * 1000;
        const snapshotData = {
            uri: snapshotUri,
            expiry: expiryTime,
        };
        storage.set(`map_snapshot_${journeyId}`, JSON.stringify(snapshotData));
    } catch (error) {
        console.error(`[MapSnapshot] Failed to save map snapshot for journey ${journeyId}:`, error);
    }
};

export const getMapSnapshotWithExpiryCheck = (journeyId: string): string | null => {
    try {
        const snapshotData = storage.getString(`map_snapshot_${journeyId}`);
        if (!snapshotData) {
            return null;
        }

        const parsedData = safeJsonParse<{ uri: string; expiry: number }>(
            snapshotData,
            { uri: '', expiry: 0 },
            'mapSnapshotUtils',
        );

        if (!parsedData.uri || parsedData.expiry === 0) {
            storage.delete(`map_snapshot_${journeyId}`);
            return null;
        }

        const currentTime = Date.now();

        if (currentTime > parsedData.expiry) {
            storage.delete(`map_snapshot_${journeyId}`);
            return null;
        }

        return parsedData.uri;
    } catch (error) {
        console.error(`[MapSnapshot] Failed to retrieve map snapshot for journey ${journeyId}:`, error);
        return null;
    }
};

export const clearMapSnapshot = (journeyId: string): void => {
    try {
        storage.delete(`map_snapshot_${journeyId}`);
    } catch (error) {
        console.error(`[MapSnapshot] Failed to clear map snapshot for journey ${journeyId}:`, error);
    }
};

export const clearAllMapSnapshots = (): void => {
    try {
        const keys = storage.getAllKeys();
        const snapshotKeys = keys.filter(key => key.startsWith('map_snapshot_'));
        snapshotKeys.forEach(key => storage.delete(key));
    } catch (error) {
        console.error('[MapSnapshot] Failed to clear all map snapshots:', error);
    }
};

/**
 * Safely captures a map snapshot with app state validation and optional delay
 * This is the recommended function to use for all map snapshot operations
 *
 * @param mapRef - React ref to the map component
 * @param journeyId - Journey ID for storage
 * @param appState - Current app state ('active' | 'background' | 'inactive' | undefined)
 * @param delayMs - Optional delay before capture (default: 0)
 * @returns Promise<string | null> - Snapshot URI or null if failed/skipped
 */
export const captureMapSnapshotSafely = async (
    mapRef: React.RefObject<MapRef | null>,
    journeyId: string,
    appState: AppStateHolder | undefined,
    delayMs: number = 0,
): Promise<string | null> => {
    try {
        const appConfig = selectAppConfig(store.getState());
        if (!appConfig.flowConfig.enableMapSnapshot) {
            console.info(`[MapSnapshot] Skipping map snapshot for 'anna' app`);
            return null;
        }

        // Check if a valid snapshot already exists for this journey
        const existingSnapshot = getMapSnapshotWithExpiryCheck(journeyId);
        if (existingSnapshot) {
            console.info(`[MapSnapshot] Using existing map snapshot for journey: ${journeyId}`);
            return existingSnapshot;
        }

        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        if (!appState || appState !== 'active') {
            console.info(
                `[MapSnapshot] Skipping map snapshot for journey ${journeyId} - app not in active state:`,
                appState,
            );
            return null;
        }

        if (!mapRef?.current) {
            console.warn(`[MapSnapshot] Map ref not available for snapshot for journey ${journeyId}`);
            return null;
        }

        const snapshotUri = await captureMapSnapshot(mapRef, journeyId);

        if (snapshotUri) {
            setMapSnapshotWithExpiry(journeyId, snapshotUri);
            console.info(`[MapSnapshot] Map snapshot captured and stored for journey: ${journeyId}`);
        } else {
            console.warn(`[MapSnapshot] Map snapshot capture returned null URI for journey: ${journeyId}`);
        }

        return snapshotUri;
    } catch (error) {
        console.error(`[MapSnapshot] Failed to capture map snapshot safely for journey ${journeyId}:`, error);
        return null;
    }
};

export const captureMapSnapshot = async (
    mapRef: React.RefObject<MapRef | null>,
    journeyId: string,
): Promise<string | null> => {
    try {
        if (!mapRef?.current) {
            console.warn(`[MapSnapshot] Map ref not available for snapshot for journey ${journeyId}`);
            return null;
        }

        return await captureMapSnapshotUsingTakeSnapshot(mapRef, journeyId);
    } catch (error) {
        console.error(`[MapSnapshot] Failed to capture map snapshot for journey ${journeyId}:`, error);
        return null;
    }
};
const captureMapSnapshotUsingTakeSnapshot = async (
    mapRef: React.RefObject<MapRef | null>,
    journeyId: string,
): Promise<string | null> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { width: deviceWidth, height: deviceHeight } = Dimensions.get('screen');

        const snapshotWidth = deviceWidth;
        const snapshotHeight = deviceHeight * 0.4;

        if (!mapRef.current) {
            console.warn(`[MapSnapshot] Map ref not available for snapshot in takeSnapshot for journey ${journeyId}`);
            return null;
        }

        const snapshotUri = await mapRef.current.takeSnapshot({
            width: snapshotWidth,
            height: snapshotHeight,
            region: undefined,
            format: 'jpg',
            quality: 1.0,
            result: 'file',
        });

        if (!snapshotUri) {
            console.warn(`[MapSnapshot] Failed to capture map snapshot for journey ${journeyId}`);
            return null;
        }

        console.info(`[MapSnapshot] Map snapshot captured for journey: ${journeyId}`);

        return snapshotUri;
    } catch (error) {
        console.error(`[MapSnapshot] takeSnapshot map snapshot failed for journey ${journeyId}:`, error);
        return null;
    }
};
