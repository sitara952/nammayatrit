/* eslint-disable myCustomPlugin/no-as-in-modified-files */
/* eslint-disable myCustomPlugin/no-any-in-modified-files */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './store';
import { selectToken } from './client/auth';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import { getStringItem, MMKVKey } from '../utils/MMKV';
import { selectNewFeatureFlags, sessionId, setNetworkState } from './client/session';
import { VERSION } from '../../version';
import { getCachedDeviceDetails, isDeviceInfoCacheInitialized } from '../utils/deviceInfoCache';

/**
 * Validates if a string follows the semantic versioning format (x.x.x)
 * @param version - The version string to validate
 * @returns true if the version is in valid x.x.x format, false otherwise
 */
const isValidVersionFormat = (version: string | undefined): boolean => {
    if (!version || version.trim() === '') {
        return false;
    }

    // Regex pattern for x.x.x format where x is a non-negative integer
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version.trim());
};

const baseQuery = fetchBaseQuery({
    baseUrl: Config['BASE_URL'],
    prepareHeaders: (headers, { getState, endpoint }) => {
        const state = getState();
        const featureFlags = selectNewFeatureFlags(state as RootState);
        const token = selectToken(state as RootState);
        if (token) {
            headers.set('token', token);
        }

        // Use cached device details for better performance (avoids async calls on every request)
        const deviceDetails = isDeviceInfoCacheInitialized()
            ? getCachedDeviceDetails()
            : DeviceInfo.getBrand() +
              '/' +
              DeviceInfo.getModel() +
              '/' +
              DeviceInfo.getSystemName() +
              ' v' +
              DeviceInfo.getSystemVersion() +
              '/' +
              DeviceInfo.getDeviceId() +
              '/' +
              DeviceInfo.getDeviceType();

        headers.set('x-rn-version', '--'); // react-version-
        headers.set('x-config-version', featureFlags.version); // firebase-version
        headers.set('x-client-version', DeviceInfo.getVersion()); //appVersion
        // Only set x-bundle-version if OTA version is in valid x.x.x format
        const otaVersion = VERSION;
        if (isValidVersionFormat(otaVersion) && otaVersion) {
            headers.set('x-bundle-version', otaVersion); //otaVersion
        }

        headers.set('x-device', deviceDetails); // deviceDetails = bBrand + "/" + bModel + "/" + bVersion + "/" + deviceRAM + "/" + dim[1] + "/" + dim[0] <> <> if not $ DS.null manufacturer then "/mf:" <> (getManufacturerName unit) else ""
        headers.set('Content-type', 'application/json');

        if (endpoint === 'authSignaturePost') {
            const authSignedPayload = getStringItem(MMKVKey.SIGN_AUTH_REQ) ?? '';
            headers.set('x-sdk-authorization', authSignedPayload);
        }
        headers.set('session_id', sessionId);
        headers.set('Accept-Encoding', 'gzip, deflate,br');
        if (__DEV__) {
            console.info('Headers:', headers);
        }
        return headers;
    },
});

const loggingBaseQuery = async (args: any, api: any, extraOptions: any) => {
    const url = typeof args === 'string' ? args : args.url;
    const method = typeof args === 'string' ? 'GET' : args.method || 'GET';

    if (__DEV__) {
        console.info(`📤 [${method}] ${url}`, typeof args !== 'string' && args.body ? args.body : '');
    }

    const start = Date.now();

    const slowNetworkTimer = setTimeout(() => {
        api.dispatch(setNetworkState('slow'));
    }, 2000);

    const result = await baseQuery(args, api, extraOptions);

    const duration = Date.now() - start;
    clearTimeout(slowNetworkTimer);
    if (duration > 2000) api.dispatch(setNetworkState('slow'));
    else {
        api.dispatch(setNetworkState('okay'));
    }

    if (__DEV__) {
        if (result.error) {
            console.info(`❌ [${method}] ${url} - Error:`, result.error);
        } else {
            console.info(`✅ [${method}] ${url} - Success:`, result.data);
        }
    }

    return result;
};

export const api = createApi({
    keepUnusedDataFor: 0,
    baseQuery: loggingBaseQuery,
    endpoints: () => ({}),
    tagTypes: [
        'RideBookingList',
        'FavoriteDrivers',
        'TransitStops',
        'Places',
        'PublicTransportData',
        'RideBookingListV2Get',
        'PickupInstructions',
    ],
});

export type RtkExtraOptions = {
    onQueryStarted: ((arg: any, api: any) => Promise<void> | void) | undefined;
    keepUnusedDataFor: number | undefined;
};
