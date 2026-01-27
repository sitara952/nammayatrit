import { Platform, NativeModules } from 'react-native';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { safe } from '../utils/common';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { permissionManager } from './PermissionManager';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { getPlaceNameByEnum } from '@/api/apiTypes/GetPlaceNameApi.gen';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';
import { getPlaceAddress, getPlaceArea } from './placeUtils';
import { locationAddress } from '@/readOnly/api/types/LocationAddress.gen';
import { FamousDestProps } from '@/src-v2/systems/configs/types';
import { getAddressFromComponents } from '@/helpers/utils/Location/LocationUtils.bs';
import { tripLocationObject } from '@/src-v2/helpers/location/types/LocationCachingObject';
import { City, strings } from 'config-types';
import { MapLocationState, MOCK_CITIES } from '@/src-v2/screens/MockCity/Types';
import { MOCK_CITY_KEY } from '@/src-v2/screens/MockCity/UI';
import { storage } from '../context/OfflineSyncContext';
import { MockJourneyLocation } from '@/src-v2/screens/JourneySimulation/types';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { MMKVKey } from './MMKV';

const { LocationModule, MapUtils } = NativeModules;

export type GeolocationResponse = {
    coords: {
        latitude: number;
        longitude: number;
        altitude: number | null;
        accuracy: number;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
        speedAccuracy: number | null;
    };
    timestamp: number;
};

export const dummyLocationApiEntity: locationAPIEntity = {
    area: undefined,
    areaCode: undefined,
    building: undefined,
    city: undefined,
    country: undefined,
    door: undefined,
    extras: undefined,
    id: '',
    instructions: undefined,
    lat: 0.0,
    lon: 0.0,
    placeId: undefined,
    state: undefined,
    street: undefined,
    title: undefined,
    ward: undefined,
};

export const dummyLocationAddress = (title: string | undefined): locationAddress => ({
    area: undefined,
    areaCode: undefined,
    building: undefined,
    city: undefined,
    country: undefined,
    door: undefined,
    extras: undefined,
    instructions: undefined,
    placeId: undefined,
    state: undefined,
    street: undefined,
    title,
    ward: undefined,
});

export const getDistanceBwCordinatesInKm = (lat1: number, long1: number, lat2: number, long2: number): number => {
    const latPoint1 = toRad(lat1);
    const lngPoint1 = toRad(long1);
    const latPoint2 = toRad(lat2);
    const lngPoint2 = toRad(long2);
    const dist =
        Math.sin((latPoint2 - latPoint1) / 2.0) * Math.sin((latPoint2 - latPoint1) / 2.0) +
        Math.cos(latPoint1) *
            Math.cos(latPoint2) *
            Math.sin((lngPoint2 - lngPoint1) / 2.0) *
            Math.sin((lngPoint2 - lngPoint1) / 2.0);
    const dist1 = 2.0 * 6371.0 * Math.asin(Math.sqrt(dist));
    return dist1;
};

export const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

export const getPlaceIdByLatLon = async (
    lat: number,
    lon: number,
    locationType: 'source' | 'destination' | 'stop' | 'rental_add_edit_stop' | undefined,
) => {
    const data = await safe(
        GetLocationAndServiceability.getLocationObjectAndServiceability(
            {
                TAG: 'PlaceByLatLon',
                _0: {
                    contents: {
                        lat,
                        lon,
                    },
                    tag: '',
                },
            },
            undefined,
            undefined,
            undefined,
            locationType ?? 'destination',
        ),
    );
    return {
        ...data,
        result: data.result?.location,
    };
};

export const getPlaceNameAPIBody = (item: location): getPlaceNameByEnum => {
    if (item.placeId || item.lat === undefined || item.lng === undefined) {
        return {
            TAG: 'PlaceByPlaceId',
            _0: {
                contents: item?.placeId ?? '',
                tag: '',
            },
        };
    } else {
        return {
            TAG: 'PlaceByLatLon',
            _0: {
                contents: {
                    lat: item.lat,
                    lon: item.lng,
                },
                tag: '',
            },
        };
    }
};

export const isLocationPermissionGranted = async () => {
    const permission =
        Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    try {
        const result = await check(permission);
        if (result === RESULTS.GRANTED) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking location permission:', error);
        return false;
    }
};

export const requestLocationPermission = async (userLanguageStrings: strings) => {
    const permission =
        Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE // Use "LOCATION_ALWAYS" for background access
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION; // Use "ACCESS_COARSE_LOCATION" for approximate location

    try {
        const result = await request(permission);
        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.info('This feature is not available on this device.');
                break;
            case RESULTS.DENIED:
                console.info('The permission has been denied but can be requested again.');
                break;
            case RESULTS.LIMITED:
                console.info('The permission is granted with limitations.');
                break;
            case RESULTS.GRANTED:
                console.info('The permission is granted.');
                break;
            case RESULTS.BLOCKED:
                console.error('The permission is denied and cannot be requested again.');
                permissionManager.showPermissionBlockedToast(userLanguageStrings);
                break;
        }
        return result === RESULTS.GRANTED;
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

export const isGpsEnabled = async () => {
    if (LocationModule !== null && Platform.OS === 'android') {
        return await LocationModule.isGpsEnabled();
    }
    return true;
};

export const requestToEnableGps = async () => {
    if (LocationModule !== null && Platform.OS === 'android') {
        return await LocationModule.showGpsEnableDialog();
    }
    return true;
};

export interface LocationOptions {
    accuracy?: 'high' | 'balanced' | 'low' | 'no_power';
    timeout?: number;
    maximumAge?: number;
}

const getMockLocation = (city: City): GeolocationResponse | undefined => {
    try {
        // Try stored location first
        const storedLocation = storage.getString(`${MOCK_CITY_KEY}_location`);
        if (storedLocation) {
            const location = safeJsonParse<MapLocationState | null>(storedLocation, null, 'storedLocation');

            return location && location.lat && location.lon
                ? makeGeoLocationResp(location.lat, location.lon)
                : undefined;
        }
    } catch (e) {
        console.error('Error getting mock location:', e);
    }

    const mockCity = MOCK_CITIES.find(c => c.name === city);
    return mockCity ? makeGeoLocationResp(mockCity.coordinates.lat, mockCity.coordinates.lon) : undefined;
};

const makeGeoLocationResp = (lat: number, lon: number): GeolocationResponse => {
    return {
        coords: {
            latitude: lat,
            longitude: lon,
            altitude: null,
            accuracy: 1.0,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            speedAccuracy: null,
        },
        timestamp: Date.now(),
    };
};

export const getCurrentLocation = async (
    options: LocationOptions | undefined = undefined,
): Promise<GeolocationResponse> => {
    const selectedMockCity = storage.getString(MOCK_CITY_KEY);
    if (selectedMockCity) {
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const mockLocation = getMockLocation(selectedMockCity as City);
        if (mockLocation) {
            return mockLocation;
        }
    }

    const mockJourneyLocation = storage.getString(MMKVKey.MOCK_JOURNEY_LOCATION);
    if (mockJourneyLocation) {
        const journeyLocation = safeJsonParse<MockJourneyLocation | null>(
            mockJourneyLocation,
            null,
            'MockJourneyLocation',
        );

        if (journeyLocation)
            return makeGeoLocationResp(journeyLocation.coordinates.lat, journeyLocation.coordinates.lon);
    }

    const { MapUtils } = NativeModules;

    const accuracy = options?.accuracy ?? 'high';
    const timeout = options?.timeout ?? 15000;

    try {
        // First check if location permissions are granted
        const hasPermission = await isLocationPermissionGranted();

        if (!hasPermission) {
            throw new Error('Location permission not granted');
        }

        // On Android, check if GPS is enabled
        if (Platform.OS === 'android') {
            const gpsEnabled = await isGpsEnabled();

            if (!gpsEnabled) {
                throw new Error('GPS is not enabled');
            }
        }

        // Try to get the current location

        try {
            const result = await MapUtils.getCurrentPosition(accuracy, timeout);

            return {
                coords: {
                    latitude: result.latitude,
                    longitude: result.longitude,
                    altitude: null,
                    accuracy: result.accuracy,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: result.speed,
                    speedAccuracy: result.speedAccuracy,
                },
                timestamp: result.timestamp || Date.now(),
            };
        } catch (err) {
            console.error('Error in MapUtils.getCurrentPosition:', err);
            throw new Error('Failed to get current location');
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        throw error; // Re-throw the error so it can be caught by the caller
    }
};

// Add a new function to get the best possible location, with a fallback strategy
export const getBestPossibleLocation = async (): Promise<GeolocationResponse> => {
    try {
        // First try with high accuracy (10 second timeout)
        return await getCurrentLocation({ accuracy: 'high', timeout: 5000 });
    } catch (highAccuracyError) {
        try {
            // If high accuracy fails, try with balanced accuracy (8 second timeout)
            console.warn('High accuracy location failed, trying balanced', highAccuracyError);
            return await getCurrentLocation({ accuracy: 'balanced', timeout: 3000 });
        } catch (balancedError) {
            try {
                // If balanced fails, try with low accuracy (5 second timeout)
                console.warn('Balanced accuracy location failed, trying low', balancedError);
                return await getCurrentLocation({ accuracy: 'low', timeout: 2000 });
            } catch (lowAccuracyError) {
                // If all fail, try to get last known location
                console.error('All location attempts failed', lowAccuracyError);

                try {
                    const lastLocation = await MapUtils.getLastKnownLocation();

                    if (lastLocation && lastLocation.latitude && lastLocation.longitude) {
                        return {
                            coords: {
                                latitude: lastLocation.latitude,
                                longitude: lastLocation.longitude,
                                altitude: null,
                                accuracy: lastLocation.accuracy || 0,
                                altitudeAccuracy: null,
                                heading: null,
                                speed: lastLocation.speed,
                                speedAccuracy: lastLocation.speedAccuracy,
                            },
                            timestamp: lastLocation.timestamp || Date.now(),
                        };
                    }

                    throw new Error('No valid last known location found');
                } catch (lastLocationError) {
                    console.error('Last known location failed', lastLocationError);
                    throw new Error('Unable to get any location');
                }
            }
        }
    }
};

export const getLocationFromSavedLoc = (savedLoc: savedReqLocationAPIEntity): location => {
    const locationEntity: locationAPIEntity = {
        ...savedLoc,
        extras: undefined,
        id: savedLoc.placeId ?? '',
        instructions: undefined,
        title: undefined,
    };

    return {
        title: getPlaceArea(locationEntity),
        subtitle: getPlaceAddress(locationEntity),
        lat: savedLoc.lat,
        lng: savedLoc.lon,
        specialLocation: undefined,
        placeId: undefined,
        tag: 'AUTOCOMPLETE',
        addressComponents: getAddressFromSavedLoc(savedLoc),
        serviceable: true,
        serviceabilityCity: undefined,
        formattedAddress: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        hotSpotInfo: undefined,
    };
};

export const getAddressFromSavedLoc = (savedLoc: savedReqLocationAPIEntity): locationAddress => {
    return {
        ...savedLoc,
        extras: undefined,
        instructions: undefined,
        title: undefined,
    };
};

export const locationFromExploreSection = (famousDest: FamousDestProps): location => {
    return {
        title: famousDest.name,
        subtitle: famousDest.description,
        lat: famousDest.lat,
        lng: famousDest.lon,
        specialLocation: undefined,
        placeId: undefined,
        tag: 'AUTOCOMPLETE',
        addressComponents: getAddressFromComponents(famousDest.address, undefined, undefined) ?? undefined,
        serviceable: true,
        serviceabilityCity: undefined,
        formattedAddress: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        hotSpotInfo: undefined,
    };
};

export const locationToTripLocationObject = (location: location): tripLocationObject => {
    return {
        ...location,
        isTrip: undefined,
        sourceLocation: undefined,
        vehicleImage: undefined,
        vehicleVariant: undefined,
        vehicleVariantName: undefined,
    };
};
