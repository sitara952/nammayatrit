/* eslint-disable myCustomPlugin/no-direct-json-parse */
import * as Sentry from '@sentry/react-native';
import { logger } from '../systems/logger';

export interface SafeJsonParseResult<T> {
    success: boolean;
    data: T;
    error?: Error;
}

/**
 * Safely parse JSON.  Never throws: on any parse failure (including empty/null/undefined input)
 * it returns your fallback, logs locally & sends to Sentry.
 *
 * @param raw     The raw JSON string
 * @param fallback A value of type T to return on failure
 * @param context  Optional tag to include in logs/Sentry
 */
export function safeJsonParse<T>(
    raw: string | null | undefined,
    fallback: T,
    context: string | undefined = undefined,
): T {
    if (raw == null || raw.trim() === '') {
        return fallback;
    }

    try {
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        return JSON.parse(raw) as T;
    } catch (err) {
        const errorMessage = `safeJsonParse failed${context ? ` in ${context}` : ''}`;
        const snippet = raw.slice(0, 200);

        logger.logError(
            `${errorMessage}: ${err instanceof Error ? err.message : String(err)} - Snippet: ${snippet}`,
            'ParseError',
        );

        if (err instanceof Error) {
            Sentry.captureException(err, {
                tags: { operation: 'json_parse', context: context ?? 'unknown' },
                extra: { snippet: raw.slice(0, 200) },
            });
        }
        return fallback;
    }
}

/**
 * Like safeJsonParse, but also tells you whether parsing actually succeeded.
 *
 * @param raw      The raw JSON string
 * @param fallback A value of type T to return on failure
 * @param context  Optional tag to include in logs/Sentry
 */
export function safeJsonParseWithResult<T>(
    raw: string | null | undefined,
    fallback: T,
    context: string | undefined = undefined,
): SafeJsonParseResult<T> {
    if (raw == null || raw.trim() === '') {
        return { success: false, data: fallback };
    }

    try {
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const parsed = JSON.parse(raw) as T;
        return { success: true, data: parsed };
    } catch (err) {
        const errorMessage = `safeJsonParseWithResult failed${context ? ` in ${context}` : ''}`;
        const snippet = raw.slice(0, 200);

        logger.logError(
            `${errorMessage}: ${err instanceof Error ? err.message : String(err)} - Snippet: ${snippet}`,
            'ParseError',
        );

        if (err instanceof Error) {
            Sentry.captureException(err, {
                tags: { operation: 'json_parse_with_result', context: context ?? 'unknown' },
                extra: { snippet: raw.slice(0, 200) },
            });
        }
        return {
            success: false,
            data: fallback,
            error: err instanceof Error ? err : new Error(String(err)),
        };
    }
}

/**
 * Quick check if a string is valid JSON.
 */
export const isValidJsonString = (v: unknown): boolean => {
    if (typeof v !== 'string') return false;
    try {
        JSON.parse(v);
        return true;
    } catch {
        return false;
    }
};
