import { Platform } from 'react-native';
import {
    type ParsedEventLoggingConfig,
    DEFAULT_EVENT_LOGGING_CONFIG,
    type AppMonitorConfig,
} from '@/typescript/types/AppMonitorConfig';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import AppMonitorAPI, { EventPayload } from 'react-native-app-monitor';

class AppMonitor {
    // Temprorary Purpose until App Monitor for IOS gets Completed
    static id = '';
    static addMetric(metricName: string, metricValue: number): void {
        try {
            AppMonitorAPI.addMetric(metricName, metricValue);
        } catch (error) {
            console.error('Error adding metric:', error);
        }
    }

    static addEvent(
        eventType: string,
        eventName: string,
        eventPayload: {
            [key: string]:
                | string
                | number
                | boolean
                | object
                | undefined
                | null
                | { [key: string]: string | number | boolean | object | undefined | null };
        },
    ): void {
        try {
            const sanitizedPayload = sanitizeEventPayload(eventPayload);
            AppMonitorAPI.addEvent(eventType, eventName, sanitizedPayload);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    }

    static addLog(
        logLevel: string,
        logMessage: string,
        tag: string,
        labels: { [key: string]: string } | undefined,
    ): void {
        try {
            AppMonitorAPI.addLog(logLevel, logMessage, tag, labels ?? {});
        } catch (error) {
            console.error('Error adding log:', error);
        }
    }

    static getSessionId(): string {
        try {
            // Temprorary Purpose until App Monitor for IOS gets Completed
            if (Platform.OS == 'ios') {
                return this.id;
            }
            return AppMonitorAPI.getSessionId();
        } catch (error) {
            console.error('Error getting session ID:', error);
            return '';
        }
    }

    static replaceUserId(userId: string): Promise<boolean> {
        return AppMonitorAPI.replaceUserId(userId);
    }

    static resetUserId(): void {
        AppMonitorAPI.resetUserId();
    }

    static generateNewSession(): string {
        // Temprorary Purpose until App Monitor for IOS gets Completed
        this.id = Math.random().toString();
        if (Platform.OS == 'ios') {
            this.id = Math.random().toString();
            return this.id;
        }
        return AppMonitorAPI.generateNewSession();
    }

    /**
     * Get full AppMonitor configuration from native
     * @returns Typed AppMonitorConfig object
     */
    static async getCurrentConfiguration(): Promise<AppMonitorConfig> {
        const defaultConfig: AppMonitorConfig = {
            version: 1,
            eventLoggingConfig: DEFAULT_EVENT_LOGGING_CONFIG,
        };

        try {
            if (Platform.OS === 'android') {
                const configString = AppMonitorAPI.getCurrentConfiguration();
                return safeJsonParse<AppMonitorConfig>(configString, defaultConfig, 'AppMonitorConfig');
            }
            // iOS fallback - AppMonitor not fully implemented on iOS yet
            return defaultConfig;
        } catch (error) {
            console.error('[AppMonitor] Error getting configuration:', error);
            return defaultConfig;
        }
    }

    /**
     * Get parsed event logging config (the small part of AppMonitor config)
     * @returns ParsedEventLoggingConfig
     */
    static async getEventLoggingConfig(): Promise<ParsedEventLoggingConfig> {
        try {
            const fullConfig = await this.getCurrentConfiguration();
            console.info('[AppMonitor] Configuration fetched, extracting event logging config...');

            const eventConfig = fullConfig.eventLoggingConfig || DEFAULT_EVENT_LOGGING_CONFIG;

            if (eventConfig) {
                console.info('[AppMonitor] ✅ Event logging config loaded successfully');
                return {
                    ...eventConfig,
                    isValid: true,
                };
            } else {
                console.warn('[AppMonitor] ⚠️ Using default event logging config');
                return {
                    ...DEFAULT_EVENT_LOGGING_CONFIG,
                    isValid: false,
                };
            }
        } catch (error) {
            console.error('[AppMonitor] ❌ Error getting event logging config:', error);
            return {
                ...DEFAULT_EVENT_LOGGING_CONFIG,
                isValid: false,
            };
        }
    }
}

function sanitizeEventPayload(payload: {
    [key: string]:
        | string
        | number
        | boolean
        | object
        | undefined
        | null
        | { [key: string]: string | number | boolean | object | undefined | null };
}): EventPayload {
    return Object.entries(payload).reduce<EventPayload>((acc, [key, value]) => {
        if (value === undefined || value === null) {
            return acc;
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return { ...acc, [key]: value };
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            const nested = Object.entries(value).reduce<{ [key: string]: string | number | boolean }>(
                (nestedAcc, [nestedKey, nestedValue]) => {
                    if (
                        nestedValue !== undefined &&
                        nestedValue !== null &&
                        (typeof nestedValue === 'string' ||
                            typeof nestedValue === 'number' ||
                            typeof nestedValue === 'boolean')
                    ) {
                        return { ...nestedAcc, [nestedKey]: nestedValue };
                    }
                    return nestedAcc;
                },
                {},
            );

            if (Object.keys(nested).length > 0) {
                return { ...acc, [key]: nested };
            }
        }

        return acc;
    }, {});
}

export default AppMonitor;
