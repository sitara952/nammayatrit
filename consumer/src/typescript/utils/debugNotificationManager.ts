/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-let */
import { NativeModules, Platform } from 'react-native';

const { DebugNotificationModule } = NativeModules;

// In-memory state (resets on app restart)
let isEnabled = false;

// Queue for managing notifications with 1-second delay
const notificationQueue: string[] = [];
let isProcessingQueue = false;

/**
 * Enable debug notifications
 */
export const enableDebugNotifications = (): void => {
    isEnabled = true;
    console.info('[DebugNotifications] Enabled');
};

/**
 * Disable debug notifications
 */
export const disableDebugNotifications = (): void => {
    isEnabled = false;
    // Clear the queue when disabling
    notificationQueue.length = 0;
    isProcessingQueue = false;
    console.info('[DebugNotifications] Disabled');
};

/**
 * Check if debug notifications are enabled
 */
export const isDebugNotificationsEnabled = (): boolean => {
    return isEnabled;
};

/**
 * Process the notification queue with 1-second delay between notifications
 */
const processQueue = (): void => {
    if (isProcessingQueue || notificationQueue.length === 0) {
        return;
    }

    isProcessingQueue = true;

    const processNext = () => {
        if (notificationQueue.length === 0 || !isEnabled) {
            isProcessingQueue = false;
            return;
        }

        const eventName = notificationQueue.shift();
        if (eventName) {
            showNotification(eventName);
        }

        // Schedule next notification after 1 second
        if (notificationQueue.length > 0 && isEnabled) {
            setTimeout(processNext, 1000);
        } else {
            isProcessingQueue = false;
        }
    };

    processNext();
};

/**
 * Show a notification using the native module
 */
const showNotification = (eventName: string): void => {
    if (Platform.OS !== 'android') {
        return;
    }

    try {
        if (DebugNotificationModule && typeof DebugNotificationModule.showDebugNotification === 'function') {
            DebugNotificationModule.showDebugNotification(eventName);
        } else {
            console.warn('[DebugNotifications] Native module not available');
        }
    } catch (error) {
        console.error('[DebugNotifications] Error showing notification:', error);
    }
};

/**
 * Queue a debug notification for an event
 * If enabled, adds the event to the queue and processes it with 1-second delay
 */
export const queueDebugNotification = (eventName: string): void => {
    if (!isEnabled) {
        return;
    }

    if (Platform.OS !== 'android') {
        return;
    }

    // Add to queue
    notificationQueue.push(eventName);

    // Start processing if not already processing
    if (!isProcessingQueue) {
        processQueue();
    }
};
