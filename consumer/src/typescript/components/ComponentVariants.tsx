/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import React, { ReactElement, useContext, useMemo } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { createContext } from 'react';

// Common type aliases
type ReactElementOrNull = ReactElement | null;
type StyleType = ViewStyle | TextStyle | ImageStyle;
type OptionalStyleType = StyleType | undefined;
type NamedStylesType<T> = { [P in keyof T]: StyleType };

/**
 * Clones a React element if it exists and applies the provided style to it.
 * @param element - The React element to clone.
 * @param style - The style object to be applied.
 * @returns The cloned element with applied styles, or null if no element is provided.
 */
function createIcon(element: ReactElementOrNull, style: StyleType): ReactElementOrNull {
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    return element ? React.cloneElement(element, { style: StyleSheet.flatten(style) } as any) : null;
}

/**
 * Capitalizes the first letter of a string.
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates variant styles based on state and style configurations.
 * @param variants - Object representing the variant configuration.
 * @param state - Current state and style object.
 * @param styles - Styles object.
 * @returns A memoized object containing functions to retrieve appropriate styles based on state and style.
 */
function useVariants<T extends Record<string, unknown>>(
    variants: Record<string, readonly string[]>,
    state: Record<string, string | boolean> = {},
    styles: NamedStylesType<T>,
) {
    const isStateVariant = (key: string) => key.toLowerCase() === 'state';

    type ConditionType = ((context: Record<string, boolean>) => boolean) | null;

    const getVariantStyles = (name: string, config: NamedStylesType<T>): [ConditionType, OptionalStyleType][] => {
        const initialResult: [ConditionType, OptionalStyleType][] = [[null, config[name]]];

        const processedResults = Object.entries(variants)
            .sort(([a], [b]) => a.localeCompare(b))
            .flatMap(([variantKey, variantValues]): [ConditionType, OptionalStyleType][] => {
                if (variantValues.length === 1) {
                    return (variantValues as string[]).flatMap((value): [ConditionType, OptionalStyleType][] => {
                        const styleKey = `${name}${capitalize(variantKey)}${value}`;
                        const styleValue = config[styleKey];

                        return styleValue
                            ? [
                                  [
                                      (context: Record<string, boolean>) =>
                                          state[variantKey] === value ||
                                          (isStateVariant(variantKey)
                                              ? (context?.[value.toLowerCase()] ?? false)
                                              : false),
                                      styleValue,
                                  ],
                              ]
                            : [];
                    });
                }

                return (variantValues as string[]).flatMap((value): [ConditionType, OptionalStyleType][] =>
                    Object.entries(variants)
                        .filter(([otherKey]) => variantKey !== otherKey)
                        .flatMap(([otherKey, otherValues]): [ConditionType, OptionalStyleType][] =>
                            (otherValues as string[]).flatMap((otherValue): [ConditionType, OptionalStyleType][] => {
                                const combinedKey = `${name}${capitalize(variantKey)}${value}${capitalize(
                                    otherKey,
                                )}${otherValue}`;
                                const combinedStyleValue = config[combinedKey];

                                return combinedStyleValue
                                    ? [
                                          [
                                              (context: Record<string, boolean>) =>
                                                  (state[variantKey] === value ||
                                                      (isStateVariant(variantKey)
                                                          ? (context?.[value.toLowerCase()] ?? false)
                                                          : false)) &&
                                                  (state[otherKey] === otherValue ||
                                                      (isStateVariant(otherKey)
                                                          ? (context?.[otherValue.toLowerCase()] ?? false)
                                                          : false)),
                                              combinedStyleValue,
                                          ],
                                      ]
                                    : [];
                            }),
                        ),
                );
            });

        return [...initialResult, ...processedResults];
    };

    const createStylesMap = (config: NamedStylesType<T>) => {
        // Precompute an immutable map from each style key to its variant styles.
        const computedMap = new Map<string, [ConditionType, OptionalStyleType][]>(
            Object.keys(config).map(key => [key, getVariantStyles(key, config)]),
        );

        // Build handlers that use the precomputed map.
        const styleHandlers = Object.keys(config).reduce<
            Record<string, (context: Record<string, boolean>) => OptionalStyleType[]>
        >((acc, key) => {
            const handler = (context: Record<string, boolean>) => {
                const variantStyles = computedMap.get(key) ?? [];
                return variantStyles
                    .filter(([condition]) => condition === null || condition?.(context))
                    .map(([, style]) => style);
            };
            return { ...acc, [key]: handler };
        }, {});

        return styleHandlers;
    };

    return {
        vstyles: createStylesMap(styles),
    };
}

interface ThemeContextType {
    colors: {
        primary: string;
        text: string;
    };
    spacing: {
        medium: number;
    };
    fontSizes: {
        medium: number;
    };
}

// Define default theme
export const ThemeContext = createContext<ThemeContextType>({
    colors: {
        primary: '#007bff',
        text: '#000000',
    },
    spacing: {
        medium: 16,
    },
    fontSizes: {
        medium: 14,
    },
});

function createStyleSheet<T extends Record<string, StyleType>>(
    factory: (theme: ThemeContextType) => T,
): (theme: ThemeContextType) => NamedStylesType<T> {
    return function generateStyles(theme: ThemeContextType) {
        const styles = factory(theme);
        return StyleSheet.create(styles) as NamedStylesType<T>;
    };
}

function useStyles<T extends Record<string, StyleType>>(createStyleSheet: (theme: ThemeContextType) => T) {
    const theme = useContext(ThemeContext);
    const styles = useMemo(() => createStyleSheet(theme), [theme]);

    return { styles, theme };
}

export { createIcon, useVariants, createStyleSheet, useStyles };
