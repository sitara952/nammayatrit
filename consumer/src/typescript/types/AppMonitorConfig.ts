/**
 * TypeScript types for AppMonitor Configuration
 */

import { LogInterface } from '../utils/logger';

/**
 * Event Logging Configuration
 * Controls which events go to which logging interfaces
 */
export interface EventLoggingConfig {
    /** List of all available logging interfaces */
    availableInterfaces: LogInterface[];

    /**
     * Exclusion patterns mapping
     * Key: Event name pattern (supports wildcards like "pressable_click_*")
     * Value: Array of interface enums to exclude for matching events
     */
    exclusionConfig: {
        [eventPattern: string]: LogInterface[];
    };

    /**
     * Fallback interfaces to use when no pattern matches
     * These interfaces will receive events that don't match any exclusion pattern
     */
    fallbackInterfaces: LogInterface[];

    /**
     * Event names that should be logged without screen context to ALL interfaces
     * These events will use raw event names (e.g., "ny_user_ride_completed")
     * instead of screen-context-prefixed names (e.g., "homeTab_homeScreen__ny_user_ride_completed")
     */
    rawEvents: string[];
}

/**
 * Full AppMonitor Configuration
 * Contains all configuration sections including event logging
 */
export interface AppMonitorConfig {
    version: number;
    eventLoggingConfig?: EventLoggingConfig;
    [key: string]: unknown;
}

/**
 * Parsed Event Logging Config with validation status
 */
export interface ParsedEventLoggingConfig extends EventLoggingConfig {
    /** Indicates if this is a valid parsed config or default/fallback */
    isValid: boolean;
}

/**
 * Default event logging configuration
 */
export const DEFAULT_EVENT_LOGGING_CONFIG: EventLoggingConfig = {
    availableInterfaces: [
        LogInterface.CleverTap,
        LogInterface.Firebase,
        LogInterface.Meta,
        LogInterface.Clarity,
        LogInterface.NammaYatri,
    ],
    exclusionConfig: {},
    fallbackInterfaces: [LogInterface.Firebase],
    rawEvents: [],
};
