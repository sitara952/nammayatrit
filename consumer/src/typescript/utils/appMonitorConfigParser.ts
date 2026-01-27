/**
 * AppMonitor Configuration Parser
 * Utilities for parsing and working with AppMonitor config
 */

import { LogInterface } from './logger';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import {
    type AppMonitorConfig,
    type EventLoggingConfig,
    type ParsedEventLoggingConfig,
    DEFAULT_EVENT_LOGGING_CONFIG,
} from '../types/AppMonitorConfig';

/**
 * Convert string interface name to LogInterface enum
 */
function stringToLogInterface(name: string): LogInterface | null {
    const mapping: Record<string, LogInterface> = {
        CleverTap: LogInterface.CleverTap,
        Firebase: LogInterface.Firebase,
        Meta: LogInterface.Meta,
        Clarity: LogInterface.Clarity,
        NammaYatri: LogInterface.NammaYatri,
    };
    return mapping[name] ?? null;
}

/**
 * Parse raw config (from JSON) to typed config with enums
 */
function parseRawEventLoggingConfig(rawConfig: unknown): EventLoggingConfig | null {
    if (!rawConfig || typeof rawConfig !== 'object') {
        return null;
    }

    const hasProperty = <K extends string>(obj: object, key: K): obj is object & Record<K, unknown> => {
        return key in obj;
    };

    if (
        !hasProperty(rawConfig, 'availableInterfaces') ||
        !Array.isArray(rawConfig.availableInterfaces) ||
        !hasProperty(rawConfig, 'exclusionConfig') ||
        typeof rawConfig.exclusionConfig !== 'object' ||
        rawConfig.exclusionConfig === null ||
        !hasProperty(rawConfig, 'fallbackInterfaces') ||
        !Array.isArray(rawConfig.fallbackInterfaces)
    ) {
        return null;
    }

    // Convert string arrays to LogInterface enum arrays
    const availableInterfaces = rawConfig.availableInterfaces
        .map((name: unknown) => (typeof name === 'string' ? stringToLogInterface(name) : null))
        .filter((iface): iface is LogInterface => iface !== null);

    const fallbackInterfaces = rawConfig.fallbackInterfaces
        .map((name: unknown) => (typeof name === 'string' ? stringToLogInterface(name) : null))
        .filter((iface): iface is LogInterface => iface !== null);

    // Convert exclusion config
    const exclusionPatterns = Object.entries(rawConfig.exclusionConfig).map(([pattern, interfaces]) => {
        if (Array.isArray(interfaces)) {
            const parsedInterfaces = interfaces
                .map((name: unknown) => (typeof name === 'string' ? stringToLogInterface(name) : null))
                .filter((iface): iface is LogInterface => iface !== null);
            return [pattern, parsedInterfaces] as const;
        }
        return [pattern, []] as const;
    });

    const exclusionConfig = Object.fromEntries(exclusionPatterns);

    const rawEvents =
        hasProperty(rawConfig, 'rawEvents') && Array.isArray(rawConfig.rawEvents)
            ? rawConfig.rawEvents
                  .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
                  .map(name => name.toLowerCase())
            : [];

    return {
        availableInterfaces,
        exclusionConfig,
        fallbackInterfaces,
        rawEvents,
    };
}

/**
 * Parse AppMonitor configuration from JSON string
 */
export function parseAppMonitorConfig(configString: string): ParsedEventLoggingConfig {
    const fullConfig = safeJsonParse<AppMonitorConfig>(
        configString,
        { version: 1, eventLoggingConfig: DEFAULT_EVENT_LOGGING_CONFIG },
        'AppMonitorConfig',
    );

    const rawEventConfig = fullConfig.eventLoggingConfig;
    if (!rawEventConfig) {
        console.warn('[AppMonitorConfig] No eventLoggingConfig found, using default');
        return {
            ...DEFAULT_EVENT_LOGGING_CONFIG,
            isValid: false,
        };
    }

    const parsedConfig = parseRawEventLoggingConfig(rawEventConfig);
    if (parsedConfig) {
        return {
            ...parsedConfig,
            isValid: true,
        };
    }

    console.warn('[AppMonitorConfig] Invalid eventLoggingConfig structure, using default');
    return {
        ...DEFAULT_EVENT_LOGGING_CONFIG,
        isValid: false,
    };
}

/**
 * Check if an event name matches a wildcard pattern
 * Supports * wildcard (e.g., "pressable_click_*" matches "pressable_click_home")
 * Optimized for simple prefix/suffix matching
 */
export function matchesPattern(eventName: string, pattern: string): boolean {
    // Convert to lowercase for case-insensitive matching
    const lowerEvent = eventName.toLowerCase();
    const lowerPattern = pattern.toLowerCase();

    // No wildcard - exact match
    if (!lowerPattern.includes('*')) {
        return lowerEvent === lowerPattern;
    }

    // Pattern with wildcard - convert to simple string matching
    // "prefix_*" -> check if event starts with "prefix_"
    // "*_suffix" -> check if event ends with "_suffix"
    // "*" -> matches everything
    // "prefix_*_suffix" -> check prefix and suffix

    if (lowerPattern === '*') {
        return true; // Match everything
    }

    const parts = lowerPattern.split('*');

    // Check if event starts with first part and ends with last part
    if (parts.length === 2) {
        const [prefix, suffix] = parts;
        if (prefix && suffix) {
            // Both prefix and suffix: "prefix_*_suffix"
            return lowerEvent.startsWith(prefix) && lowerEvent.endsWith(suffix);
        }
        if (prefix) {
            // Only prefix: "prefix_*"
            return lowerEvent.startsWith(prefix);
        }
        if (suffix) {
            // Only suffix: "*_suffix"
            return lowerEvent.endsWith(suffix);
        }
    }

    // Multiple wildcards - fall back to regex (rare case)
    const regexPattern = lowerPattern.replaceAll(/[.+?^${}()|[\]\\]/g, String.raw`\$&`).replaceAll(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(lowerEvent);
}

// const LOG_PREFIX = '[EventFilter]';

export function getInterfacesForEvent(eventName: string, config: EventLoggingConfig): LogInterface[] {
    const availableInterfaces = config.availableInterfaces;

    // console.info(`${LOG_PREFIX} evaluating`, {
    //     eventName,
    //     totalPatterns: Object.keys(config.exclusionConfig).length,
    //     availableInterfaces: availableInterfaces.map(i => LogInterface[i]),
    //     fallbackInterfaces: config.fallbackInterfaces.map(i => LogInterface[i]),
    // });

    for (const [pattern, exclusions] of Object.entries(config.exclusionConfig)) {
        const matches = matchesPattern(eventName, pattern);

        // console.info(`${LOG_PREFIX} patternCheck`, {
        //     eventName,
        //     pattern,
        //     exclusions: exclusions.map(i => LogInterface[i]),
        //     matches,
        // });

        if (matches) {
            const result = availableInterfaces.filter(iface => !exclusions.includes(iface));
            // console.info(`${LOG_PREFIX} matched`, {
            //     eventName,
            //     pattern,
            //     resultInterfaces: result.map(i => LogInterface[i]),
            // });
            return result;
        }
    }

    // console.info(`${LOG_PREFIX} noMatchFallback`, {
    //     eventName,
    //     fallbackInterfaces: config.fallbackInterfaces.map(i => LogInterface[i]),
    // });
    return config.fallbackInterfaces;
}
