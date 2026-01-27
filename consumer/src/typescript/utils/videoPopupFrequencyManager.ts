import { PopupFrequency } from '@/src-v2/systems/configs/types';
import { MMKVKey, getStringItem, setStringItem } from './MMKV';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

type PopupTimestampMap = Record<string, number>;

/**
 * Get the stored timestamps for all popups
 */
const getPopupTimestamps = (): PopupTimestampMap => {
    const storedData = getStringItem(MMKVKey.VIDEO_POPUP_LAST_SHOWN);
    if (!storedData) {
        return {};
    }
    return safeJsonParse(storedData, {}, 'VIDEO_POPUP_LAST_SHOWN');
};

/**
 * Store the timestamp map
 */
const setPopupTimestamps = (timestamps: PopupTimestampMap): void => {
    setStringItem(MMKVKey.VIDEO_POPUP_LAST_SHOWN, JSON.stringify(timestamps));
};

/**
 * Get the start of today in milliseconds (00:00:00)
 */
const getStartOfDay = (date: Date = new Date()): number => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.getTime();
};

/**
 * Calculate milliseconds for different frequency types
 */
const getFrequencyMilliseconds = (frequency: PopupFrequency): number | null => {
    switch (frequency) {
        case 'daily':
            return 24 * 60 * 60 * 1000; // 1 day
        case 'weekly':
            return 7 * 24 * 60 * 60 * 1000; // 7 days
        case 'monthly':
            return 30 * 24 * 60 * 60 * 1000; // 30 days
        default:
            return null;
    }
};

/**
 * Determine if a popup should be shown based on its frequency setting
 * @param popupId Unique identifier for the popup
 * @param frequency How often the popup should be shown
 * @returns true if the popup should be shown, false otherwise
 */
export const shouldShowPopup = (popupId: string, frequency: PopupFrequency): boolean => {
    // Always disabled
    if (frequency === 'disabled') {
        return false;
    }

    // Always show
    if (frequency === 'always') {
        return true;
    }

    const timestamps = getPopupTimestamps();
    const lastShownTimestamp = timestamps[popupId];

    // Never shown before
    if (!lastShownTimestamp) {
        return true;
    }

    // Show only once
    if (frequency === 'once') {
        return false;
    }

    const now = Date.now();

    // For daily frequency, check if it's a new day
    if (frequency === 'daily') {
        const lastShownDay = getStartOfDay(new Date(lastShownTimestamp));
        const currentDay = getStartOfDay();
        return currentDay > lastShownDay;
    }

    // For weekly and monthly, check if enough time has passed
    const frequencyMs = getFrequencyMilliseconds(frequency);
    if (frequencyMs !== null) {
        return now - lastShownTimestamp >= frequencyMs;
    }

    return false;
};

/**
 * Mark a popup as shown by storing the current timestamp
 * @param popupId Unique identifier for the popup
 */
export const markPopupAsShown = (popupId: string): void => {
    const timestamps = getPopupTimestamps();
    const updatedTimestamps = { ...timestamps, [popupId]: Date.now() };
    setPopupTimestamps(updatedTimestamps);
};

/**
 * Reset the timestamp for a specific popup (useful for testing)
 * @param popupId Unique identifier for the popup
 */
export const resetPopupTimestamp = (popupId: string): void => {
    const timestamps = getPopupTimestamps();
    const { [popupId]: _, ...updatedTimestamps } = timestamps;
    setPopupTimestamps(updatedTimestamps);
};

/**
 * Clear all popup timestamps (useful for testing)
 */
export const clearAllPopupTimestamps = (): void => {
    setPopupTimestamps({});
};
