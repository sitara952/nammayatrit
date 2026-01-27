import { getFirestore, doc, setDoc, increment } from '@react-native-firebase/firestore';
import { MMKVKey, getBoolItem, setBoolItem } from './MMKV';

export type MetricType = 'installs' | 'signups' | 'logins';

// In-memory lock to prevent race conditions during concurrent calls
const pendingRecords: Set<MetricType> = new Set();

/**
 * Records a marketing metric (install, signup or login) for a given campaign ID in Firestore.
 * Uses atomic increments to handle concurrency.
 * Includes both MMKV persistence and in-memory lock to prevent duplicates.
 *
 * @param campaignId The ID of the campaign to track (collected from deep link or referrer).
 * @param metric The metric to record ('installs', 'signups', or 'logins').
 */
export const recordCampaignMetric = async (campaignId: string, metric: MetricType) => {
    if (!campaignId) return;

    // In-memory lock check - prevents race condition when called multiple times quickly
    if (pendingRecords.has(metric)) {
        console.info(`[MarketingTracking] ${metric} recording already in progress.`);
        return;
    }

    // Prevent duplicate recording on the same device (persisted check)
    const mmkvKey =
        metric === 'installs'
            ? MMKVKey.IS_INSTALL_RECORDED
            : metric === 'signups'
              ? MMKVKey.IS_SIGNUP_RECORDED
              : MMKVKey.IS_LOGIN_RECORDED;
    const isRecorded = getBoolItem(mmkvKey);

    if (isRecorded) {
        console.info(`[MarketingTracking] ${metric} already recorded for this device.`);
        return;
    }

    // Acquire in-memory lock
    // eslint-disable-next-line functional/immutable-data
    pendingRecords.add(metric);

    try {
        const db = getFirestore();
        const campaignDocRef = doc(db, 'Campaigns', campaignId);

        // Atomic increment of the specified metric
        await setDoc(
            campaignDocRef,
            {
                [metric]: increment(1),
                lastUpdated: Date.now(),
            },
            { merge: true },
        );

        console.info(`[MarketingTracking] Recorded ${metric} for campaign: ${campaignId}`);

        // Mark as recorded to avoid duplicates
        setBoolItem(mmkvKey, true);
    } catch (error) {
        console.error(`[MarketingTracking] Failed to record ${metric} for campaign ${campaignId}:`, error);
    } finally {
        // Release in-memory lock
        // eslint-disable-next-line functional/immutable-data
        pendingRecords.delete(metric);
    }
};
