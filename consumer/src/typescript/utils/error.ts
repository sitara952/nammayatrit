import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
export type ErrorObject = {
    errorCode: string;
    errorMessage: string;
    errorPayload: string;
};

export type ResErrorType = {
    Error: string;
    RE_EXN_ID: string;
    _1: {
        errorMessage: string;
        errorPayload: string;
        errorType: string;
    };
};

const DEFAULT_ERROR_OBJECT: ErrorObject = {
    errorCode: '',
    errorMessage: '',
    errorPayload: '',
};

export const decodeError = (resError: ResErrorType): ErrorObject => {
    const errorPayload = resError._1.errorPayload?.toString() ?? '';

    return safeJsonParse<ErrorObject>(errorPayload, DEFAULT_ERROR_OBJECT, 'errorDecoding');
};

/**
 * API error data structure
 */
export interface ApiErrorData {
    errorCode: string | undefined;
    message: string | undefined;
    data:
        | {
              errorCode: string | undefined;
              [key: string]: unknown;
          }
        | undefined;
    error:
        | {
              data:
                  | {
                        errorCode: string | undefined;
                        [key: string]: unknown;
                    }
                  | undefined;
              [key: string]: unknown;
          }
        | undefined;
    [key: string]: unknown;
}

/**
 * Type for API errors that can be used across the application
 * Compatible with RTK Query error structure
 */
export type ApiError = FetchBaseQueryError | SerializedError;

/**
 * Extract error code from API error response
 * Handles various error structures that might be returned by the API
 */
export const getErrorCode = (err: ApiError): string | undefined => {
    // Handle FetchBaseQueryError case
    if ('status' in err && err.data) {
        // Try to parse the error data as JSON string first
        if (typeof err.data === 'string') {
            const parsed = safeJsonParse<{ errorCode: string | undefined }>(
                err.data,
                { errorCode: undefined },
                'getErrorCode',
            );
            return parsed['errorCode'];
        }

        // If data is already an object, check for errorCode directly
        if (typeof err.data === 'object' && err.data !== null) {
            const data = err.data;
            if ('errorCode' in data) {
                const errorCode = data['errorCode'];
                if (typeof errorCode === 'string') {
                    return errorCode;
                }
            }
        }
    }
    return undefined;
};
