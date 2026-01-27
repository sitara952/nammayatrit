import ReactMoE, { MoEProperties, MoEAppStatus } from 'react-native-moengage';
import { NativeModules } from 'react-native';

const { AppInfoModule } = NativeModules;

// Cached MoEngage App ID (fetched from native config)
// eslint-disable-next-line functional/no-let
let cachedMoEngageAppId: string | null = null;

/**
 * Get MoEngage App ID from native configuration
 * - iOS: Reads from Info.plist (moengage_app_id key)
 * - Android: Reads from string resource (configured via local.properties -> build.gradle)
 */
const getMoEngageAppId = async (): Promise<string> => {
    if (cachedMoEngageAppId !== null) {
        return cachedMoEngageAppId;
    }

    try {
        const appId = await AppInfoModule.getMoEngageAppId();
        const resolvedAppId = appId || '';
        cachedMoEngageAppId = resolvedAppId;
        return resolvedAppId;
    } catch (error) {
        console.error('Error fetching MoEngage App ID from native:', error);
        cachedMoEngageAppId = '';
        return '';
    }
};

/**
 * Initialize MoEngage SDK from React Native side
 * Should be called once at app startup
 */
export const initialize = async (): Promise<void> => {
    try {
        const moEngageAppId = await getMoEngageAppId();
        if (!moEngageAppId) {
            console.warn('MoEngage: App ID not configured, skipping initialization');
            return;
        }
        ReactMoE.initialize(moEngageAppId);
        ReactMoE.setAppStatus(MoEAppStatus.Install);
        ReactMoE.registerForPush();
        console.info('MoEngage React Native SDK initialized with App ID:', moEngageAppId);
    } catch (error) {
        console.error('Error initializing MoEngage React Native SDK:', error);
    }
};

/**
 * Log an event to MoEngage
 * @param eventName - The name of the event to log
 * @param props - Optional properties to attach to the event
 */
export const logEvent: (
    eventName: string,
    props?: { [key: string]: string | number | boolean | object | Date | null | undefined },
) => void = (eventName, props) => {
    try {
        const moEngageProperties = new MoEProperties();
        if (props) {
            Object.entries(props).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    moEngageProperties.addAttribute(key, value);
                }
            });
        }
        ReactMoE.trackEvent(eventName, moEngageProperties);
    } catch (error) {
        console.error('Error logging event to MoEngage:', error);
    }
};

/**
 * Set unique user identifier in MoEngage
 * Call this when user logs in
 * @param uniqueId - The unique identifier for the user (e.g., customer ID, phone number)
 */
export const setUniqueId = (uniqueId: string): void => {
    try {
        ReactMoE.identifyUser(uniqueId);
        console.info('MoEngage: User unique ID set');
    } catch (error) {
        console.error('Error setting unique ID in MoEngage:', error);
    }
};

/**
 * Logout the current user from MoEngage
 * Call this when user logs out to reset tracking
 */
export const logout = (): void => {
    try {
        ReactMoE.logout();
        console.info('MoEngage: User logged out');
    } catch (error) {
        console.error('Error logging out from MoEngage:', error);
    }
};
