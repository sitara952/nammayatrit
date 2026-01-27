import {
    cachedLocationObject,
    cachedDestinations,
    tripVehicle,
    tripLocationObject,
    Trip,
    LocationListItemState,
} from '../types/LocationCachingObject';
import { checkTitleAndSubtitle, getLocationFromLocationEntity } from '@/src-v2/utils/location';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { adjacentGeohash, decodeGeoHash, encodeGeoHash } from './GeoHash';
import { setCachedDestinations } from '@/typescript/state/client/user';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { RootState } from '@/typescript/state/store';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';

const GEOHASH_PRECISION = 8;
const MAX_ENTRIES_PER_GEOHASH = 4;
const MAX_TOTAL_CACHED_ITEMS = 150;

type NeighborsCache = {
    key: string;
    neighbors: string[];
};
// eslint-disable-next-line functional/no-let
let smartNeighborsCache: NeighborsCache | null = null;

/**
 * Gets smart neighbors for a geohash cell optimized for precision 8 (19m x 38m cells).
 *
 * Priority 1: Own cell (returned first, check separately for early return)
 * Priority 2: Based on position within cell (left or right half of 38m width):
 *   - If in LEFT half: top, bottom, left, top-left, bottom-left
 *   - If in RIGHT half: top, bottom, right, top-right, bottom-right
 *
 * @param lng - Longitude of the location (used to determine left/right half)
 * @param srcGeoHash - The geohash of the location
 * @returns Array of geohashes [ownCell, top, bottom, horizontal, top-horizontal, bottom-horizontal]
 */
export const getSmartNeighbors = (lng: number, srcGeoHash: string, onlyIncludeSelf: boolean): string[] => {
    if (onlyIncludeSelf) {
        return [srcGeoHash];
    }

    const cellCenter = decodeGeoHash(srcGeoHash);
    const isInRightHalf = lng > cellCenter.longitude;

    // Check cache
    const cacheKey = `${srcGeoHash}_${isInRightHalf}`;
    if (smartNeighborsCache?.key === cacheKey) {
        return smartNeighborsCache.neighbors;
    }

    const northCell = adjacentGeohash(srcGeoHash, 'n');
    const southCell = adjacentGeohash(srcGeoHash, 's');

    const horizontalDirection = isInRightHalf ? 'e' : 'w';
    const horizontalCell = adjacentGeohash(srcGeoHash, horizontalDirection);
    const topHorizontalCell = adjacentGeohash(northCell, horizontalDirection);
    const bottomHorizontalCell = adjacentGeohash(southCell, horizontalDirection);

    const neighbors = [
        northCell, // Top
        southCell, // Bottom
        horizontalCell, // Left or Right
        topHorizontalCell, // Top-Left or Top-Right
        bottomHorizontalCell, // Bottom-Left or Bottom-Right
    ];

    // eslint-disable-next-line functional/immutable-data
    smartNeighborsCache = { key: cacheKey, neighbors };

    return neighbors;
};

export const getScoreForSorting = (recencyDate: string, freq: number) => {
    try {
        const freqWeight = 0.85;
        const recencyWeight = 1 - freqWeight;
        const recentDate = new Date(recencyDate);
        const currentDate = new Date(Date.now());
        const timeDiffInSec = Math.abs(recentDate.getTime() - currentDate.getTime()) / 1000;
        const recencyScore = 1 - timeDiffInSec / (timeDiffInSec + 1);
        const normalizedFreq = freq / (freq + 1);
        const scoreForSorting = freqWeight * normalizedFreq + recencyWeight * recencyScore;
        return scoreForSorting;
    } catch (err) {
        console.error('ERROR in calculating sortingScore!!!!', err);
        return 0;
    }
};

const getUpdatedCachedTrips = (
    srcGeohash: string,
    destGeohash: string,
    destination: location,
    allCachedDestinations: cachedDestinations[],
    source: location | null | undefined,
    vehicle: tripVehicle | undefined,
    recencyDate: string | undefined = new Date().toISOString(),
): cachedDestinations[] => {
    try {
        const currentCachedDestinations = allCachedDestinations.filter(v => v.srcGeoHash === srcGeohash);
        if (currentCachedDestinations.length > 0 && currentCachedDestinations[0]) {
            const newSuggestions: cachedLocationObject[] = (() => {
                const updatedSuggestions: cachedLocationObject[] = currentCachedDestinations[0].recentTrips
                    .filter(
                        v =>
                            v.destination.title === destination.title &&
                            v.destination.subtitle === destination.subtitle,
                    )
                    .map(v => ({
                        ...v,
                        freq: v.freq + 1,
                        recencyDate,
                        destGeohash: destGeohash,
                    }));
                if (updatedSuggestions.length > 0) {
                    return currentCachedDestinations[0].recentTrips
                        .filter(
                            v =>
                                v.destination.title !== destination.title ||
                                v.destination.subtitle !== destination.subtitle,
                        )
                        .concat(updatedSuggestions);
                } else {
                    const newCachedDestinationObj: cachedLocationObject = {
                        destination: {
                            ...destination,
                            isTrip: undefined,
                            sourceLocation: undefined,
                            vehicleImage: undefined,
                            vehicleVariant: vehicle ? (vehicle?.vehicleVariant ?? undefined) : undefined,
                            vehicleVariantName: undefined,
                        },
                        source: source ?? undefined,
                        vehicleVariant: vehicle,
                        freq: 1,
                        recencyDate,
                        destGeohash: destGeohash,
                    };
                    return currentCachedDestinations[0].recentTrips.length > MAX_ENTRIES_PER_GEOHASH
                        ? [
                              ...currentCachedDestinations[0].recentTrips.filter(
                                  v =>
                                      v.destination.title !== destination.title &&
                                      v.destination.subtitle !== destination.subtitle,
                              ),
                              newCachedDestinationObj,
                          ]
                        : currentCachedDestinations[0].recentTrips.concat(newCachedDestinationObj);
                }
            })();
            const newCachedDestinationObj: cachedDestinations = {
                ...currentCachedDestinations[0],
                recentTrips: newSuggestions,
            };
            return allCachedDestinations.filter(v => v.srcGeoHash !== srcGeohash).concat(newCachedDestinationObj);
        } else {
            const newSuggestionObj: cachedLocationObject = {
                destination: {
                    ...destination,
                    isTrip: undefined,
                    sourceLocation: undefined,
                    vehicleImage: undefined,
                    vehicleVariant: undefined,
                    vehicleVariantName: undefined,
                },
                source: source ?? undefined,
                vehicleVariant: vehicle,
                freq: 1,
                recencyDate,
                destGeohash: destGeohash,
            };
            const newCachedDestinationObj: cachedDestinations = {
                srcGeoHash: srcGeohash,
                suggestedDestination: [],
                recentTrips: [newSuggestionObj],
            };
            if (allCachedDestinations.length > MAX_TOTAL_CACHED_ITEMS) {
                return allCachedDestinations.slice(1).concat(newCachedDestinationObj);
            } else {
                return allCachedDestinations.concat(newCachedDestinationObj);
            }
        }
    } catch (err) {
        console.error('ERROR in updating recent trips!!!!', err);
        return [];
    }
};

const getUpdatedCachedDestinations = (
    srcGeohash: string,
    destGeohash: string,
    destination: location,
    allCachedDestinations: cachedDestinations[],
): cachedDestinations[] => {
    try {
        const currentCachedDestinations = allCachedDestinations.filter(v => v.srcGeoHash === srcGeohash);
        if (currentCachedDestinations.length > 0 && currentCachedDestinations[0]) {
            const newSuggestions: cachedLocationObject[] = (() => {
                const updatedSuggestions: cachedLocationObject[] = currentCachedDestinations[0].suggestedDestination
                    .filter(
                        v =>
                            v.destination.title === destination.title &&
                            v.destination.subtitle === destination.subtitle,
                    )
                    .map(v => ({
                        ...v,
                        freq: v.freq + 1,
                        recencyDate: new Date().toISOString(),
                        destGeohash: destGeohash,
                    }));
                if (updatedSuggestions.length > 0) {
                    return currentCachedDestinations[0].suggestedDestination
                        .filter(
                            v =>
                                v.destination.title !== destination.title ||
                                v.destination.subtitle !== destination.subtitle,
                        )
                        .concat(updatedSuggestions);
                } else {
                    const newEntry: cachedLocationObject = {
                        destination: {
                            ...destination,
                            isTrip: undefined,
                            sourceLocation: undefined,
                            vehicleImage: undefined,
                            vehicleVariant: undefined,
                            vehicleVariantName: undefined,
                        },
                        source: undefined,
                        vehicleVariant: undefined,
                        freq: 1,
                        recencyDate: new Date().toISOString(),
                        destGeohash: destGeohash,
                    };
                    return currentCachedDestinations[0].suggestedDestination.length > MAX_ENTRIES_PER_GEOHASH
                        ? [
                              ...currentCachedDestinations[0].suggestedDestination
                                  .slice()
                                  .sort(
                                      (v1, v2) =>
                                          getScoreForSorting(v2.recencyDate, v2.freq) -
                                          getScoreForSorting(v1.recencyDate, v1.freq),
                                  )
                                  .slice(0, -1),
                              newEntry,
                          ]
                        : currentCachedDestinations[0].suggestedDestination.concat(newEntry);
                }
            })();
            const newCachedDestinationObj: cachedDestinations = {
                ...currentCachedDestinations[0],
                suggestedDestination: newSuggestions,
            };
            return allCachedDestinations.filter(v => v.srcGeoHash !== srcGeohash).concat(newCachedDestinationObj);
        } else {
            const newSuggestionObj: cachedLocationObject = {
                destination: {
                    ...destination,
                    isTrip: undefined,
                    sourceLocation: undefined,
                    vehicleImage: undefined,
                    vehicleVariant: undefined,
                    vehicleVariantName: undefined,
                },
                source: undefined,
                vehicleVariant: undefined,
                freq: 1,
                recencyDate: new Date().toISOString(),
                destGeohash: destGeohash,
            };
            const newCachedDestinationObj: cachedDestinations = {
                srcGeoHash: srcGeohash,
                suggestedDestination: [newSuggestionObj],
                recentTrips: [],
            };
            if (allCachedDestinations.length > MAX_TOTAL_CACHED_ITEMS) {
                return allCachedDestinations.slice(1).concat(newCachedDestinationObj);
            } else {
                return allCachedDestinations.concat(newCachedDestinationObj);
            }
        }
    } catch (err) {
        console.error('ERROR in updating suggestions!!!!', err);
        return [];
    }
};

export const updateCacheTripFromArray = (
    locationArray: cachedLocationObject[],
    authToken: string | null,
    allCachedDestinations: cachedDestinations[],
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
) => {
    const updatedCachedDestinations = locationArray.reduce((acc, v) => {
        if (!v.source?.lat || !v.source?.lng || !v.destination.lat || !v.destination.lng) {
            return acc;
        }
        const srcGeohash = encodeGeoHash(v.source.lat, v.source.lng, GEOHASH_PRECISION);
        const destGeohash = encodeGeoHash(v.destination.lat, v.destination.lng, GEOHASH_PRECISION);
        const tripVehicle: tripVehicle = {
            vehicleVariant: v.destination?.vehicleVariant,
            vehicleImage: v.destination?.vehicleImage,
            vehicleVariantName: v.destination?.vehicleVariantName,
        };
        return getUpdatedCachedTrips(srcGeohash, destGeohash, v.destination, acc, v.source, tripVehicle);
    }, allCachedDestinations);
    dispatch(setCachedDestinations({ id: authToken, payload: updatedCachedDestinations }));
};

export const updateSuggestedTrips = async (
    destination: location | null | undefined,
    source: location | null | undefined,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
    authToken: string | null,
    allCachedDestinations: cachedDestinations[],
    vehicle: tripVehicle | undefined,
) => {
    if (!source || !destination || !destination.lat || !destination.lng || !source.lat || !source.lng) return;
    const srcGeohash = encodeGeoHash(source.lat, source.lng, GEOHASH_PRECISION);
    const destGeohash = encodeGeoHash(destination.lat, destination.lng, GEOHASH_PRECISION);
    const newCachedTrips = getUpdatedCachedTrips(
        srcGeohash,
        destGeohash,
        destination,
        allCachedDestinations,
        source,
        vehicle,
    );
    dispatch(setCachedDestinations({ id: authToken, payload: newCachedTrips }));
};

export const updateSuggestedDestinations = async (
    currentLoc: location | null | undefined,
    destination: location | null | undefined,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
    authToken: string | null,
    allCachedDestinations: cachedDestinations[],
) => {
    try {
        if (currentLoc && currentLoc.lat && currentLoc.lng && destination && destination.lat && destination.lng) {
            const srcGeohash = encodeGeoHash(currentLoc.lat, currentLoc.lng, GEOHASH_PRECISION);
            const destGeohash = encodeGeoHash(destination.lat, destination.lng, GEOHASH_PRECISION);
            const newCachedDestinations = getUpdatedCachedDestinations(
                srcGeohash,
                destGeohash,
                destination,
                allCachedDestinations,
            );
            dispatch(setCachedDestinations({ id: authToken, payload: newCachedDestinations }));
        }
    } catch (err) {
        console.error('ERROR in storing Suggestions!!!!', err);
    }
};

export const getSuggestedTrips = (
    currentLocation: location | null,
    allCachedTrips: cachedDestinations[],
): tripLocationObject[] => {
    if (
        !currentLocation ||
        !currentLocation.lat ||
        !currentLocation.lng ||
        !allCachedTrips ||
        !Array.isArray(allCachedTrips)
    )
        return [];

    const srcGeoHash = encodeGeoHash(currentLocation.lat, currentLocation.lng, GEOHASH_PRECISION);

    const processTrips = (trips: cachedLocationObject[]): tripLocationObject[] => {
        const sorted = [...trips].sort(
            (v1, v2) => getScoreForSorting(v2.recencyDate, v2.freq) - getScoreForSorting(v1.recencyDate, v1.freq),
        );
        const uniqueData = filterDuplicateCachedLocations(sorted);
        return uniqueData
            .filter(v => checkTitleAndSubtitle(v.destination))
            .slice(0, 30)
            .map(v => ({
                ...v.destination,
                vehicleVariant: v.vehicleVariant?.vehicleVariant,
                vehicleVariantName: v.vehicleVariant?.vehicleVariantName,
                vehicleImage: v.vehicleVariant?.vehicleImage,
                isTrip: true,
                sourceLocation: v.source,
            }));
    };

    const getTripBody = (possibleHashes: string[]) => {
        return allCachedTrips
            .filter(v => v && possibleHashes.includes(v.srcGeoHash))
            .reduce<
                cachedLocationObject[]
            >((acc, v) => (v?.recentTrips && Array.isArray(v.recentTrips) ? [...acc, ...v.recentTrips] : acc), []);
    };

    // Priority 1: Check own cell first
    const srcSelfHash = getSmartNeighbors(currentLocation.lng, srcGeoHash, true);
    const selfCellTrips = getTripBody(srcSelfHash);

    if (selfCellTrips.length > 0) {
        return processTrips(selfCellTrips);
    }

    // Priority 2 : Check all neighbors (top/bottom + horizontal)
    const srcNeighborsHash = getSmartNeighbors(currentLocation.lng, srcGeoHash, false);
    const neighborTrips = getTripBody(srcNeighborsHash);

    return processTrips(neighborTrips);
};

export const getSuggestionDestinations = (
    currentLocation: location | null,
    allCachedDestinations: cachedDestinations[],
): location[] => {
    try {
        if (currentLocation?.lat && currentLocation.lng && Array.isArray(allCachedDestinations)) {
            const srcGeoHash = encodeGeoHash(currentLocation.lat, currentLocation.lng, GEOHASH_PRECISION);

            const processDestinations = (destinations: cachedLocationObject[]): location[] => {
                const allSuggestedDestinationWithHash = destinations.map(v => {
                    if (v && !Object.hasOwn(v, 'destGeohash') && v.destination?.lat && v.destination?.lng) {
                        return {
                            ...v,
                            destGeohash: encodeGeoHash(v.destination.lat, v.destination.lng, GEOHASH_PRECISION),
                        };
                    }
                    return v;
                });
                const sorted = [...allSuggestedDestinationWithHash].sort(
                    (v1, v2) =>
                        getScoreForSorting(v2.recencyDate, v2.freq) - getScoreForSorting(v1.recencyDate, v1.freq),
                );
                const uniqueData = filterDuplicateCachedLocations(sorted);
                return uniqueData
                    .filter(v => checkTitleAndSubtitle(v.destination))
                    .slice(0, 30)
                    .map(v => v.destination);
            };

            const getDestBody = (possibleHashes: string[]) => {
                return allCachedDestinations
                    .filter(v => v && possibleHashes.includes(v.srcGeoHash))
                    .reduce<
                        cachedLocationObject[]
                    >((acc, v) => (v?.suggestedDestination && Array.isArray(v.suggestedDestination) ? [...acc, ...v.suggestedDestination] : acc), []);
            };

            // Priority 1: Check own cell first
            const srcSelfHash = getSmartNeighbors(currentLocation.lng, srcGeoHash, true);
            const selfCellDestinations = getDestBody(srcSelfHash);

            if (selfCellDestinations.length > 0) {
                return processDestinations(selfCellDestinations);
            }

            // Priority 2 : Check all neighbors (top/bottom + horizontal)
            const srcNeighborsHash = getSmartNeighbors(currentLocation.lng, srcGeoHash, false);
            const neighborDestinations = getDestBody(srcNeighborsHash);

            return processDestinations(neighborDestinations);
        }
        return [];
    } catch (err) {
        console.error('ERROR in fetching suggestions!!!!', err);
        return [];
    }
};

export function isOneWayBooking(tag: string | undefined) {
    return tag == 'ONE_WAY' || tag == 'DRIVER_OFFER';
}

const filterDuplicateCachedLocations = (cachedLocations: cachedLocationObject[]) => {
    return cachedLocations.reduce<{
        items: cachedLocationObject[];
        geohashes: Set<string>;
        titleSubtitles: Set<string>;
    }>(
        (acc, v) => {
            const titleSubtitleKey = `${v.destination.title}|${v.destination.subtitle}`;
            if (v && v.destGeohash && !acc.geohashes.has(v.destGeohash) && !acc.titleSubtitles.has(titleSubtitleKey)) {
                return {
                    items: [...acc.items, v],
                    geohashes: new Set([...acc.geohashes, v.destGeohash]),
                    titleSubtitles: new Set([...acc.titleSubtitles, titleSubtitleKey]),
                };
            }
            return acc;
        },
        { items: [], geohashes: new Set<string>(), titleSubtitles: new Set<string>() },
    ).items;
};

export const convertTripToCachedLocation = (trip: Trip) => {
    const location: cachedLocationObject = {
        destination: {
            lat: trip.destLat,
            lng: trip.destLong,
            placeId: trip.destinationAddress.placeId,
            title: trip.destination.split(',')[0],
            subtitle: trip.destination
                .split(',')
                .slice(1)
                .map(v => v.trim())
                .join(', '),
            formattedAddress: trip.destination,
            tag: 'RECENTS',
            addressComponents: trip.destinationAddress,
            serviceable: undefined,
            serviceabilityCity: undefined,
            specialLocation: undefined,
            locationType: undefined,
            distanceFromCurrentLocation: undefined,
            isTrip: true,
            hotSpotInfo: undefined,
            sourceLocation: {
                lat: trip.sourceLat,
                lng: trip.sourceLong,
                placeId: trip.sourceAddress.placeId,
                title: trip.source.split(',')[0],
                subtitle: trip.source.split(',').slice(1).join(','),
                formattedAddress: trip.source,
                tag: 'RECENTS',
                addressComponents: trip.sourceAddress,
                serviceable: undefined,
                serviceabilityCity: undefined,
                specialLocation: undefined,
                locationType: undefined,
                distanceFromCurrentLocation: undefined,
                hotSpotInfo: undefined,
            },
            vehicleImage: undefined,
            vehicleVariant: trip.vehicleVariant,
            vehicleVariantName: trip.serviceTierNameV2,
        },
        source: {
            lat: trip.sourceLat,
            lng: trip.sourceLong,
            placeId: trip.sourceAddress.placeId,
            title: trip.source.split(',')[0],
            subtitle: trip.source.split(',').slice(1).join(','),
            formattedAddress: trip.source,
            tag: 'RECENTS',
            addressComponents: trip.sourceAddress,
            serviceable: undefined,
            serviceabilityCity: undefined,
            specialLocation: undefined,
            locationType: undefined,
            distanceFromCurrentLocation: undefined,
            hotSpotInfo: undefined,
        },
        vehicleVariant: {
            vehicleImage: undefined,
            vehicleVariant: trip.vehicleVariant,
            vehicleVariantName: trip.serviceTierNameV2,
        },
        freq: trip.frequencyCount ?? 0,
        recencyDate: trip.recencyDate ?? '',
        destGeohash: encodeGeoHash(trip.destLat, trip.destLong, 7),
    };
    return location;
};

export const convertLocationListToCachedLocation = (locationList: LocationListItemState) => {
    const location: cachedLocationObject = {
        destination: {
            lat: locationList.lat,
            lng: locationList.lon,
            placeId: locationList.placeId,
            title: locationList.title,
            subtitle: locationList.subTitle,
            formattedAddress: locationList.address,
            tag: 'RECENTS',
            addressComponents: locationList.fullAddress,
            serviceable: undefined,
            serviceabilityCity: undefined,
            specialLocation: undefined,
            locationType: undefined,
            distanceFromCurrentLocation: undefined,
            isTrip: true,
            sourceLocation: undefined,
            vehicleImage: undefined,
            vehicleVariant: undefined,
            vehicleVariantName: undefined,
            hotSpotInfo: undefined,
        },
        source: undefined,
        vehicleVariant: undefined,
        freq: locationList.frequencyCount ?? 0,
        recencyDate: locationList.recencyDate ?? '',
        destGeohash: encodeGeoHash(locationList.lat ?? 0, locationList.lon ?? 0, 7),
    };
    return location;
};

export const updateSuggestedTripFromMyRides = (
    bookingList: bookingAPIEntity[],
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
    userToken: string | null,
    cachedLocationObjects: cachedDestinations[],
) => {
    const cachedLocations: (cachedLocationObject | undefined)[] = bookingList.map(booking => {
        if (
            booking.status === 'COMPLETED' &&
            booking.bookingDetails.TAG !== 'RENTAL' &&
            booking.bookingDetails.TAG !== 'INTER_CITY'
        ) {
            const source: location = getLocationFromLocationEntity(booking.fromLocation);
            const destination: location = getLocationFromLocationEntity(booking.bookingDetails._0.toLocation);
            const tripVehicle: tripVehicle = {
                vehicleVariant: booking.vehicleServiceTierType,
                vehicleVariantName: booking.vehicleServiceTierType,
                vehicleImage: booking.vehicleIconUrl,
            };

            const cachedItem: cachedLocationObject = {
                destination: { ...destination, ...tripVehicle, isTrip: true, sourceLocation: source },
                source,
                recencyDate: booking.rideStartTime ?? '',
                freq: 0,
                destGeohash: '',
                vehicleVariant: undefined,
            };
            return cachedItem;
        }
        return undefined;
    });
    const filteredCachedLocation: cachedLocationObject[] = cachedLocations.filter(v => v != undefined);
    updateCacheTripFromArray(filteredCachedLocation, userToken, cachedLocationObjects, dispatch);
};
