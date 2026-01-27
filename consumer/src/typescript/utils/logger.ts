import AppMonitor from '@/src-v2/modules/AppMonitor/AppMonitor';
import * as CleverTapLogger from './cleverTap';
import * as FirebaseLogger from './firebase';
import * as MetaLogger from './meta';
import * as MoEngageLogger from './moengage';
import * as Clarity from '@microsoft/react-native-clarity';
import { GestureResponderEvent } from 'react-native';
import { BottomSheetStage } from '@/typescript/state/client/session';
import { store } from '@/typescript/state/store';
import { selectEventLoggingConfig, selectRawEvents } from '@/typescript/state/client/appMonitorConfig';
import { getInterfacesForEvent } from './appMonitorConfigParser';
import { EventName, ScreenRoute, LogInterface, EventPrefix, type AdEventPayload, EventSuffix } from './loggerEnums';
import { selectAuth } from '@/typescript/state/client/auth';
import { adImpressionTracker } from './adImpressionTracker';
import { queueDebugNotification } from './debugNotificationManager';

// Firebase Analytics Constants
const FIREBASE_MAX_EVENT_NAME_LENGTH = 40;
// const FIREBASE_RESERVED_PREFIXES = ['firebase_', 'google_'];
const FIREBASE_RESERVED_NAMES = new Set([
    'app_clear_data',
    'app_exception',
    'app_remove',
    'app_update',
    'error',
    'first_open',
    'first_visit',
    'in_app_purchase',
    'notification_dismiss',
    'notification_foreground',
    'notification_open',
    'notification_receive',
    'os_update',
    'screen_view',
    'session_start',
    'user_engagement',
]);

/**
 * Global state for tracking current screen route context
 * Used to automatically tag all events with their screen context
 */
const screenContext: { currentRoute: string | undefined } = {
    currentRoute: undefined,
};

/**
 * Set the current screen route for event context tagging
 * Called automatically by logScreenEvent
 */
const setCurrentScreenRoute = (screenRoute: string): void => {
    // eslint-disable-next-line functional/immutable-data
    screenContext.currentRoute = screenRoute;
};

/**
 * Get the current screen route context
 * Used internally by event logging functions
 */
const getCurrentScreenRoute = (): string | undefined => {
    return screenContext.currentRoute;
};

// Re-export loggerEnums.ts
export { EventName, ScreenRoute, LogInterface, EventPrefix } from './loggerEnums';
export type { AdEventPayload } from './loggerEnums';

const DEFAULT_LOG_INTERFACES: LogInterface[] = [
    LogInterface.CleverTap,
    LogInterface.Firebase,
    LogInterface.Meta,
    LogInterface.Clarity,
    LogInterface.NammaYatri,
    LogInterface.MoEngage,
];

/**
 * Get the active logging interfaces for a given event
 * Applies exclusion pattern matching from AppMonitor config
 * @param eventName - The event name to check against exclusion patterns
 * @returns Array of LogInterface enums that should receive this event
 */
const getActiveInterfacesForEvent = (eventName: string): LogInterface[] => {
    try {
        // Get the current event logging config from Redux store
        const state = store.getState();
        const eventLoggingConfig = selectEventLoggingConfig(state);

        // If config is not loaded or invalid, use all interfaces
        if (!eventLoggingConfig?.isValid) {
            return DEFAULT_LOG_INTERFACES;
        }

        // Get filtered interfaces based on exclusion patterns
        return getInterfacesForEvent(eventName, eventLoggingConfig);
    } catch (error) {
        console.error('[Logger] Error getting active interfaces:', error);
        // Fallback to all interfaces on error
        return DEFAULT_LOG_INTERFACES;
    }
};

/**
 * Whitelisted events for MoEngage integration
 * Only these events will be forwarded to MoEngage
 */
const MOENGAGE_WHITELISTED_EVENTS = new Set<string>([
    EventName.NY_APP_STARTED,
    EventName.NY_USER_ONBOARDED,
    EventName.NY_USER_FIRST_RIDE_COMPLETED,
    EventName.NY_RIDER_RIDE_COMPLETED,
    EventName.DRIVER_ASSIGNED,
    EventName.APP_REMOVE,
    EventName.NY_USER_SOURCE_AND_DESTINATION,
    EventName.NY_USER_REQUEST_QUOTES,
    EventName.NOTIFICATION_RECEIVE,
    EventName.NOTIFICATION_RECIEVE,
    EventName.NOTIFICATION_OPEN,
    EventName.NY_USER_APP_VERSION,
    EventName.METRO_TICKET_PAYMENT_SUCCESSFUL,
    ScreenRoute.SERVICE_TAB_HOME_SCREEN,
]);

// For UI components that use testID as event names (Pressable, TouchableOpacity, etc.)
// Note: Accepts strings for backwards compatibility (testID values) but only logs EventName enum values
// Use EventName enum for type-safe event logging or logPrefixEvent for prefix-based events
export const withLogEvent =
    (fn: (event: GestureResponderEvent) => void, eventPrefix: EventPrefix, suffix: string) =>
    (event: GestureResponderEvent) => {
        try {
            fn && fn(event);
        } finally {
            // Use a fallback suffix if invalid to ensure event is logged
            const hasValidSuffix = typeof suffix === 'string' && suffix.length > 0;
            const effectiveSuffix = hasValidSuffix ? suffix : 'unknown';
            const eventName = `${eventPrefix}_${effectiveSuffix.toLowerCase()}`;
            logEventUtilInternal(eventName, undefined);
        }
    };

/**
 * Log screen navigation events for Clarity analytics
 * Composes screen name with optional bottom sheet stage for context
 * Also sets the global screen route context for subsequent event tagging
 * @param screenRoute - The screen route enum value
 * @param bottomSheetStage - The bottom sheet stage enum value (optional)
 * @param props - Additional event properties
 * @param interfaces - Target logging interfaces
 */
export const logScreenEvent = (
    screenRoute: ScreenRoute,
    bottomSheetStage: BottomSheetStage | undefined,
    props: { [key: string]: string | object | number | boolean | undefined | null } | undefined,
    interfaces: LogInterface[] | undefined,
): void => {
    // Compose screen name with bottom sheet stage for HOME_TAB_HOME_SCREEN
    const composedScreenName =
        screenRoute === ScreenRoute.HOME_TAB_HOME_SCREEN && bottomSheetStage !== undefined
            ? `${screenRoute}_${BottomSheetStage[bottomSheetStage]}`
            : screenRoute;

    // Set the current screen route for subsequent event context tagging
    setCurrentScreenRoute(composedScreenName);

    logEventUtilInternal(composedScreenName, props, interfaces, true);
};

// Type-safe event logging - only accepts EventName enum values
export const logEvent: (
    eventName: EventName,
    props?: { [key: string]: string | object | number | boolean | undefined | null },
    interfaces?: LogInterface[],
) => void = (eventName, props, interfaces) => {
    logEventUtilInternal(eventName, props, interfaces, false);
};

/**
 * Log events with dynamic suffixes using type-safe prefixes
 * Composes prefix + suffix for events that follow a pattern
 * @param prefix - Type-safe event prefix from EventPrefix enum
 * @param suffix - Dynamic suffix (e.g., mode, variant, etc.)
 * @param props - Additional event properties
 * @param interfaces - Target logging interfaces
 * @example logPrefixEvent(EventPrefix.MT_HOME, 'bus') -> logs 'mt_home_bus'
 */
export const logPrefixEvent: (
    prefix: EventPrefix,
    suffix: string,
    props?: { [key: string]: string | object | number | boolean | undefined | null },
    interfaces?: LogInterface[],
) => void = (prefix, suffix, props, interfaces) => {
    const hasValidSuffix = typeof suffix === 'string' && suffix.length > 0;
    if (!hasValidSuffix) {
        return;
    }
    const eventName = `${prefix}${suffix.toLowerCase()}`;
    logEventUtilInternal(eventName, props, interfaces, false);
};

export const logSuffixEvent: (
    prefix: string,
    suffix: EventSuffix,
    props?: { [key: string]: string | object | number | boolean | undefined | null },
    interfaces?: LogInterface[],
) => void = (prefix, suffix, props, interfaces) => {
    const hasValidPrefix = typeof prefix === 'string' && prefix.length > 0;
    if (!hasValidPrefix) {
        return;
    }
    const eventName = `${prefix.toLowerCase()}_${suffix}`;
    logEventUtilInternal(eventName, props, interfaces, false);
};

export const logPrefixSuffixEvent: (
    prefix: string,
    middle: EventSuffix | EventPrefix,
    suffix: string,
    props?: { [key: string]: string | object | number | boolean | undefined | null },
    interfaces?: LogInterface[],
) => void = (prefix, middle, suffix, props, interfaces) => {
    const hasValidPrefix = typeof prefix === 'string' && prefix.length > 0;
    if (!hasValidPrefix) {
        return;
    }
    const eventName = `${prefix.toLowerCase()}_${middle.toLowerCase()}_${suffix.toLowerCase()}`;
    logEventUtilInternal(eventName, props, interfaces, false);
};
/**
 * Log ad events (ad_impression, ad_click) to AppMonitor
 *
 * For impressions, implements session-based deduplication:
 * - Same screen + same session = Skip (already logged)
 * - Same screen + new session = Log (new app session)
 * - Different screen + same session = Log (different context)
 *
 * For clicks, always logs (no deduplication)
 *
 * @param eventType - Type of ad event (ad_impression or ad_click)
 * @param payload - Ad event payload (campaign_id, view_unit_id, etc.)
 */
export const logAdEvent = (eventType: EventName.AD_IMPRESSION | EventName.AD_CLICK, payload: AdEventPayload): void => {
    try {
        const screen = getCurrentScreenRoute() || 'unknown';
        console.info(`[logAdEvent] ========== AD EVENT START ==========`);
        console.info(`[logAdEvent] Event type: ${eventType}`);
        console.info(`[logAdEvent] Screen: ${screen}`);

        // For impressions, check session-based deduplication
        if (eventType === EventName.AD_IMPRESSION) {
            console.info(`[logAdEvent] This is an IMPRESSION event - checking for duplicates`);
            const state = store.getState();
            const auth = selectAuth(state);
            const sessionId = auth.sessionId;
            console.info(`[logAdEvent] Session ID from Redux: ${sessionId}`);
            console.info(`[logAdEvent] Full auth state:`, JSON.stringify(auth));

            // Skip if already logged in this session for this screen
            const shouldLog = adImpressionTracker.shouldLogImpression(screen, sessionId);
            console.info(`[logAdEvent] shouldLogImpression returned: ${shouldLog}`);

            if (!shouldLog) {
                console.info(`[logAdEvent] ❌ FINAL DECISION: Skipping duplicate impression for ${screen}`);
                console.info(`[logAdEvent] ========== AD EVENT END (SKIPPED) ==========`);
                return;
            }
            console.info(`[logAdEvent] ✅ FINAL DECISION: Will log impression`);
        }

        const fullPayload = {
            ...payload,
            screen, // Add screen from context
        };

        // Send directly to AppMonitor only (not to other analytics platforms)
        // AppMonitor will add userId, sessionId, timestamp when storing the event
        console.info(`[logAdEvent] → Logging ${eventType} to AppMonitor with payload:`, JSON.stringify(fullPayload));
        AppMonitor.addEvent(eventType, eventType, fullPayload);
        console.info(`[logAdEvent] ========== AD EVENT END (LOGGED) ==========`);
    } catch (error) {
        console.error('[logAdEvent] ❌ ERROR:', error);
        console.info(`[logAdEvent] ========== AD EVENT END (ERROR) ==========`);
    }
};

/*
 * Sanitizes event name for Firebase Analytics compliance
 * If length > 40, creates 'warn_' + first 20 chars and checks against reserved names
 */
const sanitizeFirebaseEventName = (eventName: string): string => {
    if (eventName.length > FIREBASE_MAX_EVENT_NAME_LENGTH) {
        const truncatedName = `warn_${eventName.slice(0, 30)}`;
        return FIREBASE_RESERVED_NAMES.has(truncatedName) ? `ny_${truncatedName}` : truncatedName;
    }
    return eventName;
};

/**
 * Compose event name with screen route context
 * Appends current screen route as prefix if available and not a screen event
 * @param eventName - The base event name
 * @param isScreenEvent - Whether this is a screen navigation event (to avoid double-tagging)
 * @returns The composed event name with screen context
 * Note: Uses underscore separator for Firebase compatibility (Firebase rejects [ and ] characters)
 */
const composeEventNameWithScreenContext = (eventName: string, isScreenEvent: boolean): string => {
    const screenRoute = getCurrentScreenRoute();

    // Don't append screen context if:
    // 1. This is a screen event itself (already screen-specific)
    // 2. No screen route is set yet
    if (isScreenEvent || !screenRoute) {
        return eventName;
    }

    // Append screen route as prefix: ${screenRoute}__${eventName}
    // Using double underscore to clearly separate screen context from event name
    // Firebase-safe format (no brackets)
    return `${screenRoute}__${eventName}`;
};

/**
 * Internal utility for logging events with screen context and exclusion filtering
 * Handles both EventName enum values and ScreenRoute string values
 * @param eventName - Event name (EventName or ScreenRoute string)
 * @param props - Event properties
 * @param interfaces - Target logging interfaces (optional, will be filtered by exclusion config)
 * @param isScreenEvent - Whether this is a screen navigation event
 */
const logEventUtilInternal: (
    eventName: string,
    props?: { [key: string]: string | object | number | boolean | undefined | null },
    interfaces?: LogInterface[],
    isScreenEvent?: boolean,
) => void = (eventName, props, interfaces, isScreenEvent = false) => {
    // IMPORTANT: Apply exclusion filtering BEFORE adding screen context
    // This ensures patterns like "pressable_click_*" match correctly
    // Get the allowed interfaces from AppMonitor config
    const allowedInterfaces = getActiveInterfacesForEvent(eventName);

    // If interfaces are explicitly provided, intersect them with allowed interfaces
    // This ensures AppMonitor exclusion config is always respected
    const activeInterfaces = interfaces
        ? interfaces.filter(iface => allowedInterfaces.includes(iface))
        : allowedInterfaces;

    // Check if this event should be logged without screen context
    // (applies to CleverTap, Firebase, Meta, Clarity - NOT AppMonitor)
    const normalizedEventName = eventName.toLowerCase();
    const state = store.getState();
    const rawEvents = selectRawEvents(state);
    const shouldUseRawEventName = rawEvents.includes(normalizedEventName);

    // Compose event name with screen context
    // AppMonitor always gets the full composed name for better context
    const composedEventName = composeEventNameWithScreenContext(eventName, isScreenEvent);

    for (const medium of activeInterfaces) {
        switch (medium) {
            case LogInterface.CleverTap: {
                const eventNameForInterface = shouldUseRawEventName ? eventName : composedEventName;
                try {
                    CleverTapLogger.logEvent(eventNameForInterface, props);
                } catch (error) {
                    console.error('Error logging event in CleverTap:', error);
                }
                break;
            }
            case LogInterface.Firebase: {
                try {
                    // eslint-disable-next-line functional/no-let
                    let finalEventName: string;
                    if (shouldUseRawEventName) {
                        finalEventName = eventName;
                    } else {
                        finalEventName = sanitizeFirebaseEventName(composedEventName);
                    }
                    FirebaseLogger.logEvent(finalEventName, props);
                } catch (error) {
                    console.error('Error logging event in Firebase:', error);
                }
                break;
            }
            case LogInterface.Meta: {
                const eventNameForInterface = shouldUseRawEventName ? eventName : composedEventName;
                try {
                    MetaLogger.logEvent(eventNameForInterface, props);
                } catch (error) {
                    console.error('Error logging event in Meta:', error);
                }
                break;
            }
            case LogInterface.Clarity: {
                const eventNameForInterface = shouldUseRawEventName ? eventName : composedEventName;
                try {
                    if (isScreenEvent) {
                        Clarity.setCurrentScreenName(eventNameForInterface);
                    } else {
                        Clarity.sendCustomEvent(eventNameForInterface);
                    }
                } catch (error) {
                    console.error('Error logging event in Clarity:', error);
                }
                break;
            }
            case LogInterface.NammaYatri:
                // AppMonitor ALWAYS logs with full screen context, regardless of rawEvents config
                try {
                    AppMonitor.addEvent('flow_event', composedEventName, {
                        event: composedEventName,
                        payload: props,
                    });
                } catch (error) {
                    console.error('Error logging event in AppMonitor:', error);
                }
                break;
            case LogInterface.MoEngage:
                try {
                    // Check if the event is in the MoEngage whitelist
                    if (MOENGAGE_WHITELISTED_EVENTS.has(eventName)) {
                        MoEngageLogger.logEvent(eventName, props);
                    }
                } catch (error) {
                    console.error('Error logging event in MoEngage:', error);
                }
                break;
        }
    }

    // Queue debug notification if enabled (for all environments)
    queueDebugNotification(composedEventName);
};
