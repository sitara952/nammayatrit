/* eslint-disable functional/immutable-data */
/* eslint-disable myCustomPlugin/no-as-in-modified-files */
/* eslint-disable myCustomPlugin/no-any-in-modified-files */

import { ComponentConfigValues, ConfigClient } from 'config-types';

/**
 * Retrieves the nested configuration value using 'cityComponentMode' and 'componentConfig'.
 *
 * @param configManager - The configuration context.
 * @returns The nested value from configManager.get('cityComponentMode')[configManager.get('componentConfig')] or undefined.
 */
export const getCityComponentConfig = (configManager: ConfigClient): ComponentConfigValues => {
    const cityMode = configManager.get('cityComponentMode');
    const componentConfigList = configManager.get('componentConfig');
    return componentConfigList[cityMode];
};

export function deepNestedMerge<T extends object>(...sources: (T | Partial<T>)[]): T {
    const result: any = {};

    for (const source of sources) {
        if (!source) continue;

        for (const key of Object.keys(source)) {
            const value = (source as any)[key];

            // Skip undefined (no override)
            if (value === undefined || value === null) {
                continue;
            }

            const prev = result[key];

            // Arrays override completely
            if (Array.isArray(value)) {
                result[key] = value.slice(); // copy to avoid mutation
                continue;
            }

            // Deep merge for objects
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Merge with previous object if it exists and is object
                if (typeof prev === 'object' && prev !== null && !Array.isArray(prev)) {
                    result[key] = deepNestedMerge(prev, value);
                } else {
                    result[key] = { ...value }; // clone
                }
                continue;
            }

            // Primitive override (string, number, boolean)
            result[key] = value;
        }
    }

    return result as T;
}
