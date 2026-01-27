import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';
import { getCityFromCode } from './common';
import { locationAddress } from '@/readOnly/api/types/LocationAddress.gen';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import { Platform } from 'react-native';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.bs';
import { getPlaceNameByEnum } from '@/api/apiTypes/GetPlaceNameApi.gen';

import type { location as Location_location } from '@/readOnly/api/types/Location.gen.tsx';

const codePattern = /^[A-Za-z0-9+]+$/;

function isLikelyCode(building: string | undefined): boolean {
    return building !== undefined && codePattern.test(building);
}

export type FormatedLocation = {
    area: string;
    address: string;
    lat: number;
    lng: number;
};

export type OriginAndDestinationLatLng = {
    originLat: number;
    originLng: number;
    destinationLat: number;
    destinationLng: number;
};

function isMostlyNumbers(input: string): boolean {
    const numCount = input.replace(/[^0-9]/g, '').length;
    return numCount > input.length / 2;
}

export function getPlaceArea(
    location:
        | locationAPIEntity
        | (savedReqLocationAPIEntity & { title: string | undefined })
        | locationAddress
        | undefined,
): string {
    if (location === undefined) {
        return '';
    }
    if (location.title && !isMostlyNumbers(location.title)) {
        // if title contains mostly number then consider building, door, street and area as well
        return location.title;
    }

    const { building, door, street, area } = location;

    const components = [
        ...(area ? [area] : []),
        ...(door ? [door] : []),
        ...(building && !isLikelyCode(building) ? [building] : []),
        // Only add street if it's available and not already included as area
        ...(street && street !== area ? [street] : []),
    ].slice(0, 2);

    // If we have components, join them; otherwise try to use any available location info
    if (components.length > 0) {
        return components.join(', ');
    }

    // if area is not available, then return the full address
    return getPlaceAddress(location);
}

export const getPlaceAddress = (
    location: locationAPIEntity | locationAddress | (savedReqLocationAPIEntity & { title: string | undefined }),
) => {
    return (
        addComma(location.street) +
        addComma(location.area) +
        addComma(location.city) +
        addComma(location.state) +
        (location.country ?? '')
    );
};

const addComma = (value: string | undefined) => {
    return value ? value + ', ' : '';
};

export const convertLocationtoAddressComponents = (location: locationAPIEntity) => {
    return {
        area: location.area,
        areaCode: location.areaCode,
        building: location.building,
        city: location.city,
        country: location.country,
        door: location.door,
        extras: location.extras,
        instructions: location.instructions,
        placeId: location.placeId,
        state: location.state,
        street: location.street,
        title: location.title,
        ward: location.ward,
    };
};

export const transformLocationApiEntityToLocation = (location: locationAPIEntity | null): location | null => {
    if (!location) return null;
    return {
        title: getPlaceArea(location),
        subtitle: getPlaceAddress(location),
        lat: location.lat,
        lng: location.lon,
        placeId: location.placeId,
        formattedAddress: undefined,
        tag: 'AUTOCOMPLETE',
        addressComponents: convertLocationtoAddressComponents(location),
        specialLocation: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        serviceable: true,
        serviceabilityCity: undefined,
        hotSpotInfo: undefined,
    };
};

export type InterCityCheckResult = 'Intercity' | 'Normal' | 'Unknown';

export const checkForInterCityLegacy = (source: location | null, stops: (location | null)[]): InterCityCheckResult => {
    if (!source?.serviceabilityCity) return 'Unknown'; // if we don't know the source city, consider it normal ride.
    if (stops.every(stop => !stop?.serviceabilityCity)) return 'Unknown'; // if we don't know source of all the stop cities, consider that also as normal ride

    const sourceCity = source.serviceabilityCity;
    if (sourceCity === '*') return 'Intercity';

    return stops.some(
        stop =>
            stop?.serviceabilityCity &&
            (!isAliasMatch(stop?.serviceabilityCity, sourceCity) || stop?.serviceabilityCity === '*'),
    )
        ? 'Unknown'
        : 'Normal';
};

const purifyCityName = (city: string) => {
    city = city.trim(); // remove spaces from around
    if (city.startsWith('std')) {
        city = getCityFromCode(city);
    }
    return city.toLowerCase();
};

const cityAliases: Record<string, string[]> = {
    bangalore: ['bangalore', 'bengaluru', 'bengalooru'],
    delhi: ['delhi', 'dilli'],
    mumbai: ['mumbai', 'bombay'],
    tumkuru: ['tumkuru', 'tumkur', 'tumakuru'],
    mysore: ['mysore', 'mysuru'],
    kolkata: ['kolkata'],
};

function isAliasMatch(city1: string, city2: string): boolean {
    const normalizedCity1 = purifyCityName(city1);
    const normalizedCity2 = purifyCityName(city2);
    for (const [canonical, aliases] of Object.entries(cityAliases)) {
        if (
            (canonical === normalizedCity1 && aliases.includes(normalizedCity2)) ||
            (canonical === normalizedCity2 && aliases.includes(normalizedCity1)) ||
            normalizedCity1 === normalizedCity2
        ) {
            return true;
        }
    }
    return false;
}

export const transformLocationAddressTypeToFormatedLocation = (
    location: locationAddress,
    lat: number,
    lon: number,
): FormatedLocation => {
    return {
        area: location.area ?? '',
        address: getPlaceAddress(location),
        lat: lat ?? 0,
        lng: lon ?? 0,
    };
};

export const transformLocationAddressToFormatedLocation = (
    location: location,
    lat: number,
    lng: number,
): Array<FormatedLocation> => {
    return [
        {
            area: location.title ?? '',
            address: location.title ?? '' + location.subtitle,
            lat: lat,
            lng: lng,
        },
    ];
};

export const getAddressByLatLon = async (lat: number, lon: number): Promise<locationAddress> => {
    if (Platform.OS == 'android') {
        const data = await GetLocationAndServiceability.getLocationByGeoCoder(lat, lon);

        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        return data?.location.addressComponents as locationAddress;
    } else {
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const getBy = {
            TAG: 'PlaceByLatLon',
            _0: {
                contents: {
                    lat: lat,
                    lon: lon,
                },
                tag: 'ByLatLong',
            },
        } as getPlaceNameByEnum;
        const data = await GetLocationAndServiceability.fetchPlaceName(getBy);
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        return data.location.addressComponents as locationAddress;
    }
};

export const transformLocationToAPIEntity = (location: location): locationAPIEntity => {
    return {
        area: location.addressComponents?.area,
        areaCode: location.addressComponents?.areaCode,
        building: location.addressComponents?.building,
        city: location.addressComponents?.city,
        country: location.addressComponents?.country,
        door: location.addressComponents?.door,
        extras: location.addressComponents?.extras,
        id: '',
        instructions: location.addressComponents?.instructions,
        lat: location.lat ?? 0,
        lon: location.lng ?? 0,
        placeId: location.placeId,
        state: location.addressComponents?.state,
        street: location.addressComponents?.street,
        title: location.title,
        ward: location.addressComponents?.ward,
    };
};

export const convertMultimodalLocationToAPIEntity = (location: Location_location): locationAPIEntity => {
    return {
        area: location.address?.area,
        areaCode: location.address?.areaCode,
        building: location.address?.building,
        city: location.address?.city,
        country: location.address?.country,
        door: location.address?.door,
        extras: location.address?.extras,
        id: '',
        instructions: location.address?.instructions,
        lat: location.lat,
        lon: location.lon,
        placeId: location.id,
        state: location.address?.state,
        street: location.address?.street,
        title: location.address?.title,
        ward: location.address?.ward,
    };
};
