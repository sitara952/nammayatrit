/* eslint-disable myCustomPlugin/no-any-in-modified-files */
import { Middleware } from 'redux';

import { isRejectedWithValue } from '@reduxjs/toolkit';
import { setToastProps, setToastVisible, ToastProps } from './client/session';
import colors from '../designSystem/colorPalette';
import { isEqual } from 'lodash';
import Config from 'react-native-config';
import { NativeModules } from 'react-native';
const { MainAppUtils } = NativeModules;
import { logger } from '@/src-v2/systems/logger';
import { FlowStatusContext } from '../context/FlowStatusContext';
import React from 'react';
import { loggingOutUser } from '../utils/common';

// Create a ref to store the FlowStatusContext value
/* eslint-disable-next-line functional/no-let */
let flowStatusContextRef: React.ContextType<typeof FlowStatusContext> | null = null;

// Export a function to set the FlowStatusContext ref
export const setFlowStatusContextRef = (context: React.ContextType<typeof FlowStatusContext>) => {
    flowStatusContextRef = context;
};

export const globalErrorHandler: Middleware =
    ({ dispatch }) =>
    next =>
    action => {
        if (isRejectedWithValue(action)) {
            console.info('Rejecting value: ', action.payload);
            try {
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                const apiUrl = (action.meta as any)?.baseQueryMeta?.request?.url || 'Unknown URL';
                logger.logError(
                    'API Failure: API url: ' +
                        apiUrl +
                        ' | Payload: ' +
                        (action.payload ? JSON.stringify(action.payload) : ''),
                    'Api',
                );
            } catch (e) {
                console.error('failed to log API failures', e);
            }
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            const errorPayload = action.payload as any;
            if (
                (errorPayload.status === 401 &&
                    (errorPayload.data.errorCode === 'INVALID_TOKEN' ||
                        errorPayload.data.errorCode === 'TOKEN_EXPIRED')) ||
                (errorPayload.status === 400 && errorPayload.data.errorCode === 'TOKEN_EXPIRED')
            ) {
                console.info('Logging out');
                dispatch(setToastVisible(false));

                loggingOutUser(dispatch, flowStatusContextRef ?? undefined);
                MainAppUtils.updateSharedPreferences({
                    REGISTERATION_TOKEN: '__failed',
                    CUSTOMER_ID: 'NO_CUSTOMER_ID',
                });
                const props = unauthorizedUserToastProps();
                dispatch(setToastProps(props));
            } else {
                if (Config['SDK_ENV'] != 'production') {
                    const errorMessage = errorFromActionPayload(action.payload);
                    const toastProps = genericErrorToastProps(
                        errorMessage == null ? 'Something went wrong' : errorMessage,
                    );
                    dispatch(setToastProps(toastProps));
                }
            }
        }
        return next(action);
    };

const unauthorizedUserToastProps = (): ToastProps => {
    return {
        visible: true,
        message: 'You seem to have logged out, please login again.',
        backgroundColor: `${colors?.primitive?.red?.danger}`,
        buttons: [],
        autoDismissAfter: 3000,
        useSpannedToast: undefined,
        bottomSpanDescription: undefined,
        spannerType: undefined,
        logo: undefined,
        dismissButton: undefined,
        onSpannedToastLoad: undefined,
        margin: undefined,
        customToast: undefined,
    };
};

export const genericErrorToastProps = (message: string): ToastProps => {
    return {
        visible: true,
        message: message,
        backgroundColor: `${colors?.primitive?.red?.danger}`,
        autoDismissAfter: 2500,
        buttons: [],
        useSpannedToast: undefined,
        bottomSpanDescription: undefined,
        spannerType: undefined,
        logo: undefined,
        dismissButton: undefined,
        onSpannedToastLoad: undefined,
        margin: undefined,
        customToast: undefined,
    };
};

const errorFromActionPayload = (payload: any): string | null => {
    if (payload && payload.data && payload.data.errorMessage) {
        return payload.data.errorMessage;
    }
    if (payload && payload.error) {
        return payload.error?.replace('TypeError:', '');
    }
    return null;
};

/**
 * Logs the differences between two states
 * This function recursively compares two objects and logs the differences between them.
 *
 * @param prevState - The previous state
 * @param nextState - The next state
 */
function logStateDifferences(prevState: any, nextState: any) {
    const compareObjects = (prev: any, next: any, path: string, acc: Record<string, any>): Record<string, any> => {
        return Object.keys(next).reduce((differences, key) => {
            const currentPath = path ? `${path}.${key}` : key;

            if (!(key in prev)) {
                return {
                    ...differences,
                    [currentPath]: {
                        a_prev: undefined,
                        b_next: next[key],
                    },
                };
            } else if (!isEqual(prev[key], next[key])) {
                if (
                    typeof prev[key] === 'object' &&
                    typeof next[key] === 'object' &&
                    !Array.isArray(prev[key]) &&
                    !Array.isArray(next[key])
                ) {
                    return compareObjects(prev[key], next[key], currentPath, differences);
                }
                return {
                    ...differences,
                    [currentPath]: {
                        a_prev: prev[key],
                        b_next: next[key],
                    },
                };
            }
            return differences;
        }, acc);
    };

    const differences =
        typeof prevState === 'object' && typeof nextState === 'object' && prevState && nextState
            ? compareObjects(prevState, nextState, '', {})
            : {};

    if (Object.keys(differences).length > 0) {
        console.table(differences);
    } else {
        console.info('%cNo State Differences', 'color: cyan');
    }
}

/**
 * Logs the state before and after the dispatch
 * Use this middleware to log the state before and after the dispatch until we get an actually
 * working Redux Devtools for React-native with Hermes as the JS engine.
 *
 * It groups the logs by the action type and logs the state before and after the dispatch.
 * If the states are identical, it logs that they are identical.
 *
 * @param logExtraInfo - If true gives extra info about the states
 */
export const createStateChangeLogger = (logExtraInfo: boolean): Middleware => {
    return api => next => (action: any) => {
        const previousState = api.getState();
        const result = next(action);
        const afterState = api.getState();

        console.groupCollapsed(`%cAction Dispatched: ${action.type}`, 'color: blue');
        logExtraInfo && console.info('%cState Before Dispatch:', 'color: orange', previousState);
        console.info('%cAction:', 'color: yellow', action);
        logExtraInfo && console.info('%cState After Dispatch:', 'color: orange', afterState);

        if (isEqual(previousState, afterState)) {
            console.info('%cStates are identical', 'color: cyan');
        } else {
            console.groupCollapsed('%cState Differences:', 'color: cyan');
            logStateDifferences(previousState, afterState);
        }
        console.groupEnd();

        console.groupEnd();
        return result;
    };
};
