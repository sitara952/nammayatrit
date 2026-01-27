import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { locationAddress } from '@/readOnly/api/types/LocationAddress.gen';

export type cachedLocationObject = {
    destination: tripLocationObject;
    source: location | undefined;
    vehicleVariant: tripVehicle | undefined;
    freq: number;
    recencyDate: string;
    destGeohash: string;
};

export type cachedDestinations = {
    srcGeoHash: string;
    suggestedDestination: cachedLocationObject[];
    recentTrips: cachedLocationObject[];
};

export type tripVehicle = {
    vehicleVariant: string | undefined;
    vehicleVariantName: string | undefined;
    vehicleImage: string | undefined;
};

export type tripLocationObject = location &
    tripVehicle & { isTrip: boolean | undefined; sourceLocation: location | undefined };

export type Trip = {
    sourceLat: number;
    source: string;
    destination: string;
    sourceAddress: locationAddress;
    destinationAddress: locationAddress;
    sourceLong: number;
    destLat: number;
    destLong: number;
    frequencyCount: number | undefined;
    recencyDate: string | undefined;
    locationScore: number | undefined;
    isSpecialZone: boolean;
    vehicleVariant: string | undefined;
    serviceTierNameV2: string | undefined;
};

export type LocationItemType = 'RECENTS' | 'PREDICTION' | 'SAVED_LOCATION' | 'SUGGESTED_DESTINATIONS';

export type LocationListItemState = {
    prefixImageUrl: string;
    postfixImageUrl: string;
    postfixImageVisibility: boolean;
    title: string;
    subTitle: string;
    placeId: string | undefined;
    lat: number | undefined;
    lon: number | undefined;
    description: string;
    tag: string;
    tagType: string | undefined;
    cardType: string | undefined;
    address: string;
    tagName: string;
    isEditEnabled: boolean;
    savedLocation: string;
    placeName: string;
    isClickable: boolean;
    alpha: number;
    fullAddress: locationAddress;
    locationItemType: LocationItemType | undefined;
    distance: string | undefined;
    showDistance: boolean | undefined;
    actualDistance: number | undefined;
    frequencyCount: number | undefined;
    recencyDate: string | undefined;
    locationScore: number | undefined;
    types: string[] | undefined;
};
