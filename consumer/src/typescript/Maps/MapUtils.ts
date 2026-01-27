/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-let */

import MapView, { EdgePadding, FitToOptions, LatLng, MapPolyline, NativeAirMapsModule } from 'react-native-maps';
import * as React from 'react';
import { Camera } from 'react-native-maps';
import { AnimatedMapPinRef, getVehicleImageKeyFromVariant, IconType } from '../components/AnimatedMapPin';
import {
    MultimodalTravelMode_multimodalTravelMode,
    ServiceTierType_serviceTierType,
    VehicleVariant_vehicleVariant,
} from '../../readOnly/api/types/Enums.gen';
import { circleData, markerData, MultiRouteData, polygonData, polylineData, routeData, zoneData } from './MapType';
import { computeHeading } from '../utils/common';
import { getGridSize, buildcluster, updateClusterMarkers, buildAndroidClusterMarkers } from '../utils/busTracking';
import { animateCameraOptions, latLng } from '../../helpers/externalModules/GMap/ReactMap.gen';
import { Dimensions, findNodeHandle, NativeModules, Platform, StyleProp, ViewStyle } from 'react-native';
import { COORD_ON_PATH_THRESHOLD_IN_M } from '../constants/common';
import { setMapIsMoved } from '@/typescript/state/client/maps';
import { percentageHeightToDp, percentageWidthToDp } from '@/helpers/utils/Utils.bs';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';
import { throttle } from 'lodash';
import { nearbyDriverRes } from '@/typescript/state/server/nearbyDriversApi.ts';
import { AppDispatchType } from '../state/hooks';
import { StaticMarker } from '../tracking/trackingTypes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';

const enableDebugLogs = false;
const MAX_POSSIBLE_DRIVERS_PER_BUCKET = 500;

// DEBUG: Marker flickering investigation
const MARKER_FLICKER_DEBUG = false;
let updateMarkerRefCount = 0;
let moveMarkerCount = 0;

const debugLog = (...args: (string | number | LatLng | boolean | null | object)[]): void => {
    if (enableDebugLogs) {
        console.info('useMapFunction', ...args);
    }
};

export const animateCamera = async ({
    mapRef,
    _initialCoordinate,
    lat,
    lon,
    zoom,
    duration = 500,
}: {
    mapRef: React.MutableRefObject<MapView | null>;
    _initialCoordinate: LatLng | undefined;
    lat: number | undefined;
    lon: number | undefined;
    zoom: number;
    duration: number | undefined;
}): Promise<void> => {
    if (mapRef.current) {
        // const camera = await mapRef.current.getCamera(); // Removing this function as this was causing delay in recentering location
        const newCamera: Camera = {
            center: {
                latitude: lat ?? _initialCoordinate?.latitude ?? 0,
                longitude: lon ?? _initialCoordinate?.longitude ?? 0,
            },
            pitch: 0,
            heading: 0,
            altitude: 0,
            zoom: zoom,
        };

        const options: animateCameraOptions = { duration };
        mapRef.current.animateCamera(newCamera, options);
    } else {
        console.error('Map ref is not available');
    }
};

// ------------- Marker Fucntiions ----------------

export const addMarkersFromArray = ({
    multiRoutesRef,
    setMarkers,
    markersArray,
    routeId,
    forceUpdate = false,
}: {
    multiRoutesRef: React.MutableRefObject<Map<string, MultiRouteData>>;
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
    markersArray: markerData[];
    routeId: string | undefined;
    forceUpdate: boolean | undefined;
}) => {
    debugLog('addMarkersFromArray', markersArray);
    setMarkers(currMarkers => {
        const newMarkers = new Map(currMarkers);
        markersArray.forEach(marker => {
            const condition = routeId !== undefined ? !hasMarker(multiRoutesRef, routeId, marker.id) : true;
            if (forceUpdate || (condition && !newMarkers.has(marker.id))) {
                newMarkers.set(marker.id, marker);
            }
        });
        return newMarkers;
    });
};

export const addMarker = ({
    setMarkers,
    coordinate,
    id,
    zIndex,
    anchor,
    rotateEnabled,
    rotation,
    children,
    onClick,
    showEditIcon,
    style,
    title,
    iconType,
    vehicleVariant,
    multimodalVariant,
    markerOnPress,
}: {
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
    coordinate: LatLng;
    id: string;
    zIndex: number | undefined;
    /* eslint-disable myCustomPlugin/enforce-optional-params */
    anchor?: { x: number; y: number };
    rotateEnabled: boolean | undefined;
    rotation: number | undefined;
    children: React.ReactNode | null;
    onClick: (() => void) | undefined;
    showEditIcon: boolean | undefined;
    style: StyleProp<ViewStyle> | undefined;
    title: string | undefined;
    iconType: IconType;
    vehicleVariant: VehicleVariant_vehicleVariant | undefined;
    multimodalVariant: string | undefined;
    markerOnPress: ((markerId: string) => void) | undefined;
}) => {
    debugLog('addMarker', id, coordinate);
    setMarkers(currMarkers => {
        const newMarkers = new Map(currMarkers);
        const markerData: markerData = {
            id,
            markerKey: id,
            coordinate,
            zIndex: zIndex || 0,
            anchor: anchor || { x: 0.5, y: 0.5 },
            rotation: rotation || 0.0,
            rotationEnabled: rotateEnabled || false,
            visible: true,
            title: title || '',
            description: '',
            children: children || null,
            style: style || {},
            pinIconType: iconType,
            onClick,
            showEditIcon,
            vehicleVariant,
            multimodalVariant,
            ref: undefined,
            calloutText: undefined,
            calloutOnPress: undefined,
            markerOnPress: markerOnPress,
            showCallout: undefined,
            busStopEtaCallout: undefined,
            displayCalloutOnPress: undefined,
            primaryEtaMinutes: undefined,
            secondaryEtaMinutes: undefined,
        };
        newMarkers.set(id, markerData);
        return newMarkers;
    });
};

export const moveMarker = async ({
    markersRef,
    setMarkers,
    markerId,
    newPosition,
    animationDuration = 2000,
    rotation,
    rotationDuration,
}: {
    markersRef?: React.MutableRefObject<Map<string, markerData>>;
    setMarkers?: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
    markerId: string;
    newPosition: LatLng;
    animation: boolean;
    animationDuration: number | undefined;
    rotation: number | undefined;
    rotationDuration: number | undefined;
}) => {
    // DEBUG: Track moveMarker calls - log for routeStart AND vehicle markers
    const shouldDebugLog = MARKER_FLICKER_DEBUG && (markerId === 'routeStart' || markerId.includes('-vehicle'));

    if (shouldDebugLog) {
        moveMarkerCount++;
        console.info(
            '[MARKER_FLICKER][MapUtils] moveMarker #' + moveMarkerCount,
            'markerId:',
            markerId,
            'to:',
            newPosition,
        );
    }
    debugLog('moveMarker', markerId, newPosition);

    // PREFERRED PATH: Use markersRef directly - no React re-renders triggered
    if (markersRef) {
        const markers = markersRef.current;
        const markerData = markers.get(markerId);

        if (shouldDebugLog) {
            console.info(
                '[MARKER_FLICKER][MapUtils] moveMarker - markersRef path',
                'markerData exists:',
                !!markerData,
                'hasRef:',
                !!markerData?.ref,
                'markersRef.current size:',
                markers.size,
                'keys:',
                Array.from(markers.keys()).join(', '),
            );
        }

        if (markerData) {
            const newRotation = rotation !== undefined ? rotation : markerData.rotation;

            // Use imperative ref to animate the marker - no React re-render needed
            if (markerData.ref) {
                if (shouldDebugLog) {
                    console.info('[MARKER_FLICKER][MapUtils] moveMarker using REF (no state update)');
                }
                markerData.ref.moveMarker(newPosition, animationDuration, rotation, rotationDuration);
            } else {
                if (shouldDebugLog) {
                    console.info('[MARKER_FLICKER][MapUtils] moveMarker - REF IS NULL! Cannot animate marker');
                }
            }

            // Update the markerData in the Map directly (mutation) - this doesn't trigger React
            markerData.coordinate = newPosition;
            markerData.rotation = newRotation;
        } else {
            if (shouldDebugLog) {
                console.info('[MARKER_FLICKER][MapUtils] moveMarker - MARKER DATA NOT FOUND in markersRef!');
            }
        }
        return;
    }

    // FALLBACK: Use setMarkers (triggers re-renders, but backwards compatible)
    if (setMarkers) {
        setMarkers(markers => {
            const markerData = markers.get(markerId);
            if (markerData) {
                const newRotation = rotation !== undefined ? rotation : markerData.rotation;

                if (markerData.ref) {
                    markerData.ref.moveMarker(newPosition, animationDuration, rotation, rotationDuration);
                }

                markerData.coordinate = newPosition;
                markerData.rotation = newRotation;
            }
            return markers;
        });
    }
};

// export const getMarkers = ({
//   markers,
// }: {
//   markers: Map<string, markerData>;
// }): Map<string, markerData> => {
//   return markers;
// };
export const getMarkers = ({
    markers,
    setMarkers,
}: {
    markers: Map<string, markerData>;
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
}): Map<string, markerData> => {
    let marker = markers;
    setMarkers(prev => {
        marker = prev;
        return prev;
    });
    return marker;
};

// ---- polyline functions ------------------------------

export const addPolyline = async ({
    setPolylines,
    id,
    coordinates,
    visible = true,
    strokeColor = '#00000000',
    strokeColors = [],
    strokeWidth = 4.5,
    lineDashPattern = undefined,
}: {
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>;
    id: string;
    coordinates: LatLng[];
    visible: boolean | undefined;
    strokeColor: string | undefined;
    strokeColors: string[] | undefined;
    strokeWidth: number | undefined;
    lineDashPattern: number[] | undefined;
}): Promise<void> => {
    debugLog('addPolyline', id);
    // Check if polyline with this id already exists before updating
    setPolylines(prevPolylines => {
        const existingPolyline = prevPolylines.get(id);

        // Only update if polyline data has changed
        if (
            existingPolyline &&
            JSON.stringify(existingPolyline.coordinates) === JSON.stringify(coordinates) &&
            existingPolyline.visible === visible &&
            existingPolyline.strokeColor === strokeColor &&
            JSON.stringify(existingPolyline.strokeColors) === JSON.stringify(strokeColors) &&
            existingPolyline.strokeWidth === strokeWidth
        ) {
            return prevPolylines; // No changes, return the previous state
        }

        // Update or add new polyline data
        const newPolylines = new Map(prevPolylines);
        const polylineData = {
            id,
            coordinates,
            visible,
            strokeColor,
            strokeColors,
            strokeWidth,
            lineDashPattern,
            ref: null, // Initialize as null instead of undefined
        };
        newPolylines.set(id, polylineData);

        return newPolylines;
    });
};
export const hidePolyline = (
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
    polylineId: string,
): void => {
    debugLog('removePolyline', polylineId);
    setPolylines(prevPolylines => {
        if (prevPolylines.has(polylineId)) {
            const polyline = prevPolylines.get(polylineId);

            if (polyline) {
                const updatedPolyline = {
                    ...polyline,
                    visible: false,
                    strokeColor: '#00000000', // Transparent color
                    strokeColors: [],
                };

                const newPolylines = new Map(prevPolylines);
                newPolylines.set(polylineId, updatedPolyline);
                return newPolylines;
            }
        }

        return prevPolylines;
    });
};

export const updatePolylineRef = (
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
    ref: MapPolyline | null,
    polylineId: string,
): void => {
    setPolylines(prevPolylines => {
        let polylineData = prevPolylines.get(polylineId);
        if (polylineData && ref) {
            polylineData = { ...polylineData, ref: ref };
            prevPolylines.set(polylineId, polylineData);
            return prevPolylines;
        } else {
            return prevPolylines;
        }
    });
};

export const updatePolyline = ({
    setPolylines,
    polylineId,
    newCoordinates,
    strokeColor,
    strokeWidth,
}: {
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>;
    polylineId: string;
    newCoordinates: LatLng[];
    strokeColor?: string;
    strokeWidth?: number;
}) => {
    debugLog('updatePolyline', polylineId, newCoordinates);
    setPolylines(polylines => {
        const polylineData = polylines.get(polylineId);
        if (polylineData) {
            polylineData.coordinates = newCoordinates;
            if (strokeColor) {
                polylineData.strokeColor = strokeColor;
            }
            if (strokeWidth) {
                polylineData.strokeWidth = strokeWidth;
            }
            polylines.set(polylineId, polylineData);
        } else {
            console.error('updatePolyline: Polyline does not exist with ID', polylineId);
        }
        return new Map(polylines);
    });
};

//  ----------------------------- Marker Fucntions ----------------------------

export const updateMarkerRef = (
    markersRef: React.MutableRefObject<Map<string, markerData>> | null,
    ref: AnimatedMapPinRef | null,
    markerId: string,
): void => {
    // DEBUG: Track updateMarkerRef calls
    if (MARKER_FLICKER_DEBUG && (markerId === 'routeStart' || markerId === 'routeStart_pin')) {
        updateMarkerRefCount++;
        console.info(
            '[MARKER_FLICKER][MapUtils] updateMarkerRef #' + updateMarkerRefCount,
            'markerId:',
            markerId,
            'hasRef:',
            !!ref,
        );
    }
    debugLog('updateMarkerRef', markerId);

    // CRITICAL FIX: Use markersRef directly to avoid triggering React state updates
    // This prevents re-render cascades from ref callbacks
    if (markersRef && ref) {
        const markerData = markersRef.current.get(markerId);
        if (markerData) {
            if (MARKER_FLICKER_DEBUG && (markerId === 'routeStart' || markerId === 'routeStart_pin')) {
                console.info('[MARKER_FLICKER][MapUtils] updateMarkerRef - USING markersRef directly (no setMarkers)');
            }
            // Mutate the ref directly - no React state update needed for refs
            markerData.ref = ref;
        } else {
            if (MARKER_FLICKER_DEBUG && (markerId === 'routeStart' || markerId === 'routeStart_pin')) {
                console.info(
                    '[MARKER_FLICKER][MapUtils] updateMarkerRef - markerData not found, CREATING minimal entry with ref',
                );
            }
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            markersRef.current.set(markerId, {
                id: markerId,
                coordinate: { latitude: 0, longitude: 0 }, // Placeholder, will be overwritten by sync
                ref: ref,
            } as markerData);
        }
    }
};

export const updateCalloutText = (
    markersRef: React.MutableRefObject<Map<string, markerData>>,
    markerId: string,
    text: string,
) => {
    const markerData = markersRef.current.get(markerId);
    if (markerData) {
        debugLog('updateCalloutText', text);
        // Skip if text is exactly the same
        if (markerData.title === text) {
            return;
        }
        // Use imperative ref to update text - no React re-render needed
        markerData.ref?.updateText(text);
        // Also update the cached title for future comparisons
        markerData.title = text;
    }
};

export const rotateMarker = async ({
    markers,
    markerId,
    startLatLng,
    endLatLng,
    duration = 0,
}: {
    markers: Map<string, markerData>;
    markerId: string;
    startLatLng: LatLng;
    endLatLng: LatLng;
    duration: number | undefined;
}) => {
    const markerData = markers.get(markerId);
    if (markerData) {
        const angle = computeHeading(startLatLng, endLatLng);
        debugLog('rotateMarker', markerId, angle);
        markerData.ref?.rotateMarker(angle, duration);
    } else {
        console.error('rotateMarker: Marker does not exist with ID', markerId);
    }
};
export const updateMarkerEditOption = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    markerId: string,
    showEditIcon: boolean,
): void => {
    debugLog('updateMarker', markerId, 'showEditIcon: ', showEditIcon);
    setMarkers(prevMarkers => {
        debugLog('All Markers:', Array.from(prevMarkers), 'updateMarker', markerId);
        let markerData = prevMarkers.get(markerId);
        if (markerData) {
            markerData = { ...markerData, showEditIcon };
            prevMarkers.set(markerId, markerData);
            return prevMarkers;
        } else {
            return prevMarkers;
        }
    });
};

const POS_EPS_DEG = 0.00001; // ~1 m latitude
const ROT_EPS_DEG = 5; // ignore <5° bearing changes
const MAX_PER_BUCKET = 500; // for zIndex calculation, same as before

function areNearbyMarkersUpdated(
    nearby: nearbyDriverRes,
    markers: Map<string, markerData>,
    vehicleVariant: string | undefined,
): boolean {
    if (!nearby) return true;
    for (const bucket of nearby.buckets) {
        for (const d of bucket.driverInfo) {
            if (
                vehicleVariant &&
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                !d.applicableServiceTierTypes.includes(vehicleVariant as ServiceTierType_serviceTierType)
            ) {
                continue;
            }
            const m = markers.get(d.driverId);
            if (
                !m ||
                Math.abs(m.coordinate.latitude - d.lat) > POS_EPS_DEG ||
                Math.abs(m.coordinate.longitude - d.lon) > POS_EPS_DEG ||
                Math.abs((m.rotation ?? 0) - (d.bearing ?? -1)) > ROT_EPS_DEG
            ) {
                return false;
            }
        }
    }
    return true;
}

export const updateNearbyMarkers = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    nearbyDrivers: nearbyDriverRes,
    vehicleVariant: string | undefined,
    forceUpdate: boolean,
    mapRef: React.RefObject<MapView | null>,
) => {
    const processedMarkers: Array<{
        id: string;
        latitude: number;
        longitude: number;
        rotation: number;
        zIndex: number;
        vehicleVariant: string;
    }> = [];

    nearbyDrivers.buckets.forEach((bucket, bi) => {
        bucket.driverInfo.forEach((d, di) => {
            if (
                vehicleVariant &&
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                !d.applicableServiceTierTypes.includes(vehicleVariant as ServiceTierType_serviceTierType)
            )
                return;

            processedMarkers.push({
                id: d.driverId,
                latitude: d.lat,
                longitude: d.lon,
                rotation: d.bearing ?? -1,
                zIndex: bi * MAX_POSSIBLE_DRIVERS_PER_BUCKET + di,
                vehicleVariant: getVehicleImageKeyFromVariant(bucket.variant),
            });
        });
    });

    if (Platform.OS === 'android') {
        try {
            const nativeTag = findNodeHandle(mapRef.current);
            if (nativeTag) {
                NativeAirMapsModule.updateNearbyMarkersNative(nativeTag, JSON.stringify(processedMarkers))
                    .then(() => {
                        console.info('Native marker update completed successfully');
                    })
                    .catch((error: Error) => {
                        console.error('Native marker update failed:', error);
                    });
                return;
            } else {
                console.warn('Native updateNearbyMarkersNative method not available, using React markers');
            }
        } catch (error) {
            console.error('Error calling native updateNearbyMarkersNative:', error);
        }
    } else {
        setMarkers(prev => {
            if (!forceUpdate && areNearbyMarkersUpdated(nearbyDrivers, prev, vehicleVariant)) {
                return prev;
            }
            const next = new Map(prev);
            const seen = new Set<string>();

            // Process driver buckets (Taxi)
            nearbyDrivers.buckets.forEach((bucket, bi) => {
                bucket.driverInfo.forEach((d, di) => {
                    if (
                        vehicleVariant &&
                        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                        !d.applicableServiceTierTypes.includes(vehicleVariant as ServiceTierType_serviceTierType)
                    )
                        return;
                    const id = d.driverId;
                    seen.add(id);

                    const lat = d.lat,
                        lon = d.lon,
                        rot = d.bearing ?? -1;
                    const z = bi * MAX_PER_BUCKET + di;

                    const m = next.get(id);
                    if (m) {
                        if (
                            Math.abs(m.coordinate.latitude - lat) > POS_EPS_DEG ||
                            Math.abs(m.coordinate.longitude - lon) > POS_EPS_DEG ||
                            Math.abs((m.rotation ?? 0) - rot) > ROT_EPS_DEG ||
                            m.zIndex !== z
                        ) {
                            next.set(id, {
                                ...m,
                                coordinate: { latitude: lat, longitude: lon },
                                rotation: rot,
                                zIndex: z,
                            });
                        }
                    } else {
                        next.set(id, {
                            id,
                            markerKey: id,
                            coordinate: { latitude: lat, longitude: lon },
                            zIndex: bi * MAX_POSSIBLE_DRIVERS_PER_BUCKET + di,
                            anchor: { x: 0.5, y: 0.5 },
                            rotation: rot,
                            rotationEnabled: true,
                            visible: true,
                            title: '',
                            description: '',
                            children: null,
                            style: {},
                            pinIconType: 'nearBy',
                            onClick: undefined,
                            showEditIcon: false,
                            vehicleVariant: bucket.variant,
                            ref: undefined,
                            calloutText: undefined,
                            calloutOnPress: undefined,
                            multimodalVariant: undefined,
                            markerOnPress: undefined,
                            showCallout: undefined,
                            displayCalloutOnPress: undefined,
                            busStopEtaCallout: undefined,
                            primaryEtaMinutes: undefined,
                            secondaryEtaMinutes: undefined,
                        });
                    }
                });
            });

            // Remove markers that are no longer present
            prev.forEach(m => {
                if (m.pinIconType === 'nearBy' && !seen.has(m.markerKey)) {
                    next.delete(m.markerKey);
                }
            });

            return next;
        });
    }
};

export const removeNearbyMarkers = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    mapRef: React.RefObject<MapView | null>,
) => {
    const processedMarkers: Array<{
        id: string;
        latitude: number;
        longitude: number;
        rotation: number;
        zIndex: number;
        vehicleVariant: string;
    }> = [];

    if (Platform.OS === 'android') {
        try {
            const nativeTag = findNodeHandle(mapRef.current);
            if (nativeTag) {
                // Send same empty array to native
                NativeAirMapsModule.updateNearbyMarkersNative(nativeTag, JSON.stringify(processedMarkers))
                    .then(() => {
                        console.info('Native marker removal completed successfully');
                    })
                    .catch((error: Error) => {
                        console.error('Native marker removal failed:', error);
                    });
                return;
            } else {
                console.warn(
                    'Native updateNearbyMarkersNative method not available, falling back to React implementation',
                );
            }
        } catch (error) {
            console.error('Error calling native updateNearbyMarkersNative:', error);
        }
    } else {
        setMarkers(prev => {
            const next = new Map(prev);
            const seen = new Set<string>();

            processedMarkers.forEach(marker => {
                seen.add(marker.id);
            });

            prev.forEach(m => {
                if (m.pinIconType === 'nearBy') {
                    next.delete(m.markerKey);
                }
            });

            return next;
        });
    }
};

export const removeMarker = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    markerId: string,
) => {
    debugLog('removeMarker', markerId);
    setMarkers(currMarkers => {
        if (currMarkers.has(markerId)) {
            const newMarkers = new Map(currMarkers);
            newMarkers.delete(markerId);
            return newMarkers;
        } else {
            console.error('removeMarker: Marker does not exist with ID', markerId);
            return currMarkers;
        }
    });
};

export const cancelMarkerAnimation = (markers: Map<string, markerData>, markerId: string) => {
    debugLog('cancelMarkerAnimation', markerId);
    const markerData = markers.get(markerId);
    if (markerData) {
        markerData.ref?.cancelAnimation();
    }
};

export const setMarkerVisibility = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    markerId: string,
    visible: boolean,
) => {
    debugLog('setMarkerVisibility => ', markerId);
    setMarkers(currMarkers => {
        if (currMarkers.has(markerId)) {
            const newMarkers = new Map(currMarkers);
            const markerData = currMarkers.get(markerId);
            const opacity = visible ? 1.0 : 0.0;
            if (markerData && opacity !== markerData.opacity) {
                const newData = { ...markerData, opacity };
                newMarkers.set(markerId, newData);
                return newMarkers;
            } else {
                return currMarkers;
            }
        } else {
            console.error('removeMarker: Marker does not exist with ID', markerId);
            return currMarkers;
        }
    });
};

export const toggleMarkerCalloutVisibility = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    markerId: string,
) => {
    debugLog('toggleMarkerCalloutVisibility => ', markerId);
    setMarkers(currMarkers => {
        const clickedMarker = currMarkers.get(markerId);
        if (!clickedMarker) {
            console.error('Marker not found:', markerId);
            return currMarkers;
        }
        const newShowState = !clickedMarker.showCallout;
        const newMarkers = new Map<string, markerData>();
        currMarkers.forEach((m, id) => {
            if (id === markerId) {
                newMarkers.set(id, {
                    ...m,
                    showCallout: newShowState,
                });
            } else if (m.showCallout) {
                newMarkers.set(id, {
                    ...m,
                    showCallout: false,
                });
            } else {
                newMarkers.set(id, m);
            }
        });
        return newMarkers;
    });
};

export const turnOffAllCallouts = (setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>) => {
    debugLog('turnOffAllCallouts');
    setMarkers(currMarkers => {
        let anyCalloutOpen = false;
        currMarkers.forEach(m => {
            if (m.showCallout) anyCalloutOpen = true;
        });
        if (!anyCalloutOpen) return currMarkers;
        const newMarkers = new Map<string, markerData>();
        currMarkers.forEach((m, id) => {
            if (m.showCallout) {
                newMarkers.set(id, { ...m, showCallout: false });
            } else {
                newMarkers.set(id, m);
            }
        });
        return newMarkers;
    });
};

export const updateMarkersEta = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    allStaticMarkers: StaticMarker[],
) => {
    setMarkers(currMarkers => {
        const updated = new Map(currMarkers);
        let changed = false;
        allStaticMarkers.forEach(newMarker => {
            const existing = currMarkers.get(newMarker.id);
            if (!existing) return;
            const etaChanged =
                existing.primaryEtaMinutes !== newMarker.primaryEtaMinutes ||
                existing.secondaryEtaMinutes !== newMarker.secondaryEtaMinutes;
            if (etaChanged) {
                updated.set(newMarker.id, {
                    ...existing,
                    primaryEtaMinutes: newMarker.primaryEtaMinutes,
                    secondaryEtaMinutes: newMarker.secondaryEtaMinutes,
                });
                changed = true;
            }
        });

        return changed ? updated : currMarkers;
    });
};

// --------------------- Polygon Funcitons intintlized -----------------------------------------------------------------
export const addPolygon = ({
    setPolygons,
    id,
    coordinates,
    strokeWidth = 3,
    strokeColor = '#000',
    fillColor = '#000',
    visible = true,
    lineDashPattern = [],
    tappable = false,
    onPress,
}: {
    setPolygons: React.Dispatch<React.SetStateAction<Map<string, polygonData>>>;
    id: string;
    coordinates: LatLng[];
    strokeWidth: number | undefined;
    strokeColor: string | undefined;
    fillColor: string | undefined;
    visible: boolean | undefined;
    lineDashPattern: number[] | undefined;
    tappable: boolean | undefined;
    onPress: () => void;
}): void => {
    setPolygons(prevPolygons => {
        const newPolygons = new Map(prevPolygons);
        const polygonData = {
            id,
            coordinates,
            strokeWidth,
            strokeColor,
            fillColor,
            visible,
            lineDashPattern,
            tappable,
            onPress,
        };
        newPolygons.set(id, polygonData);
        return newPolygons;
    });
};

export const removePolygon = ({
    setPolygons,
    polygonId,
}: {
    setPolygons: React.Dispatch<React.SetStateAction<Map<string, polygonData>>>;
    polygonId: string;
}) => {
    setPolygons(prevPolygons => {
        if (prevPolygons.has(polygonId)) {
            const newPolygons = new Map(prevPolygons);
            newPolygons.delete(polygonId);
            return newPolygons;
        } else {
            return prevPolygons;
        }
    });
};

//----------------------- Zone functions--------------------------------------

export const addZone = ({
    zonesRef,
    zoneId,
    polygonId,
    markersIds,
}: {
    zonesRef: React.MutableRefObject<Map<string, zoneData>>;
    zoneId: string;
    polygonId: string;
    markersIds: string[];
}): void => {
    const zoneData: zoneData = {
        id: zoneId,
        polygonId,
        markersIds,
    };
    zonesRef.current.set(zoneId, zoneData);
};
export const removeZone = ({
    setPolygons,
    setMarkers,
    zonesRef,
    zoneId,
}: {
    setPolygons: React.Dispatch<React.SetStateAction<Map<string, polygonData>>>;
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
    zonesRef: React.MutableRefObject<Map<string, zoneData>>;
    zoneId: string;
}) => {
    const zoneData = zonesRef.current.get(zoneId);
    if (zoneData) {
        removePolygon({ setPolygons: setPolygons, polygonId: zoneData.polygonId });
        zoneData.markersIds.forEach(markerId => removeMarker(setMarkers, markerId));
        zonesRef.current.delete(zoneId);
    } else {
        console.error('Zone does not exist with ID', zoneId);
    }
};

export const removeAllZone = ({
    setPolygons,
    setMarkers,
    zonesRef,
}: {
    setPolygons: React.Dispatch<React.SetStateAction<Map<string, polygonData>>>;
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
    zonesRef: React.MutableRefObject<Map<string, zoneData>>;
}) => {
    zonesRef.current.forEach(zoneData => {
        removeZone({ zoneId: zoneData.id, setPolygons, setMarkers, zonesRef });
    });
};

// ---------------------- circle functions --------------------------------

export const addCircle = ({
    setCircles,
    id,
    center,
    radius,
    strokeWidth = 3,
    strokeColor = '#FFFFFF',
    fillColor = '#000000',
    visible = true,
}: {
    setCircles: React.Dispatch<React.SetStateAction<Map<string, circleData>>>;
    id: string;
    center: latLng;
    radius: number;
    strokeWidth: number | undefined;
    strokeColor: string | undefined;
    fillColor: string | undefined;
    visible: boolean | undefined;
}): void => {
    setCircles(prevCircles => {
        const newCircles = new Map(prevCircles);
        const circleData: circleData = {
            id,
            center,
            radius,
            strokeWidth,
            strokeColor,
            fillColor,
            visible,
        };
        newCircles.set(id, circleData);
        return newCircles;
    });
};

export const removeCircle = ({
    setCircles,
    circleId,
}: {
    setCircles: React.Dispatch<React.SetStateAction<Map<string, circleData>>>;
    circleId: string;
}): void => {
    setCircles(prevCircles => {
        if (prevCircles.has(circleId)) {
            const newCircles = new Map(prevCircles);
            newCircles.delete(circleId);
            return newCircles;
        }
        return prevCircles;
    });
};

// -------------------- routes fucntions -----------------------------------
export const buildRoute = (
    routesRef: React.MutableRefObject<Map<string, routeData>>,
    routeId: string,
    polylineId: string,
    markersIds: string[],
): void => {
    debugLog('buildRoute', routeId, polylineId, ...markersIds);
    const routeData: routeData = {
        id: routeId,
        markersIds,
        polylineId,
    };
    routesRef.current.set(routeId, routeData);
};

export const clearRoute = ({
    routesRef,
    setPolylines,
    setMarkers,
}: {
    routesRef: React.MutableRefObject<Map<string, routeData>>;
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>;
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
}): void => {
    debugLog('clearRoute', routesRef.current);
    routesRef.current.forEach(routeData => {
        hidePolyline(setPolylines, routeData.polylineId);
        routeData.markersIds.forEach(markerId => {
            if (markerId) {
                removeMarker(setMarkers, markerId);
            }
        });
    });
    routesRef.current = new Map<string, routeData>();
};

export const removeRoute = (
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    routesRef: React.MutableRefObject<Map<string, routeData>>,
    routeId: string,
) => {
    const routeData = routesRef.current.get(routeId);
    if (routeData) {
        hidePolyline(setPolylines, routeData.polylineId);
        routeData.markersIds.forEach(markerId => removeMarker(setMarkers, markerId));
        routesRef.current.delete(routeId);
    } else {
        console.error('Route does not exist with ID', routeId);
    }
};

export const updateRoute = async ({
    routesRef,
    polylines,
    setPolylines,
    setMarkers,
    markers,
    routeId,
    coordinate,
}: {
    routesRef: React.MutableRefObject<Map<string, routeData>>;
    polylines: Map<string, polylineData>;
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>;
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>;
    markers: Map<string, markerData>;
    routeId: string;
    coordinate: LatLng;
}): Promise<boolean> => {
    debugLog('updateRoute', routeId, coordinate);
    const routeData = routesRef.current?.get(routeId);
    const { MapUtil } = NativeModules;
    if (routeData) {
        const polylineData = polylines.get(routeData.polylineId);

        if (polylineData) {
            let position;
            try {
                position = await MapUtil.isCoordinateOnPath(
                    polylineData.coordinates,
                    coordinate,
                    COORD_ON_PATH_THRESHOLD_IN_M,
                );
            } catch (error) {
                console.error('Error while calling isCoordinateOnPath: ', error, coordinate);
            }

            if (position && position >= 0) {
                setPolylines(prevPolylines => {
                    const newPolylines = new Map(prevPolylines);

                    const polyline = newPolylines.get(routeData.polylineId);
                    if (polyline) {
                        const updatedPolyline = {
                            ...polyline,
                            coordinates: polyline.coordinates.slice(position),
                        };

                        newPolylines.set(routeData.polylineId, updatedPolyline);

                        const startPosition = updatedPolyline.coordinates[0];
                        if (startPosition) {
                            const startMarkerId = routeData.markersIds[0];
                            if (startMarkerId) {
                                moveMarker({
                                    setMarkers: setMarkers,
                                    markerId: startMarkerId,
                                    newPosition: startPosition,
                                    animation: true,
                                    animationDuration: 2000,
                                    rotation: undefined,
                                    rotationDuration: undefined,
                                });

                                const secondPoint = updatedPolyline.coordinates[1];
                                if (secondPoint) {
                                    rotateMarker({
                                        markers: markers,
                                        markerId: startMarkerId,
                                        startLatLng: startPosition,
                                        endLatLng: secondPoint,
                                        duration: undefined,
                                    });
                                }
                            } else {
                                console.error('updateRoute: Start marker does not exist');
                            }
                        } else {
                            removeRoute(setPolylines, setMarkers, routesRef, routeId);
                        }
                    } else {
                        console.error('updateRoute: Polyline does not exist with ID', routeData.polylineId);
                    }
                    return newPolylines;
                });

                return true;
            }
        }
    }
    return false;
};

// ---------------------- Maps functions -----------------------------------

export const onMapReady = (setMapReady: React.Dispatch<React.SetStateAction<boolean>>): void => {
    setMapReady(true);
};

export const onPanDrag = (
    setIsMapDragged: React.Dispatch<React.SetStateAction<boolean>>,
    MapId: string,
    dispatch: AppDispatchType,
) => {
    dispatch(setMapIsMoved({ id: MapId, payload: true }));
    setIsMapDragged(true);
};

export const addMapPadding = (
    padding: Partial<{
        left: number;
        top: number;
        right: number;
        bottom: number;
    }> = { left: undefined, top: undefined, right: undefined, bottom: undefined },
    mapPaddingRef: React.MutableRefObject<EdgePadding>,
    defaultVerticalBetweenPadding: number,
    defaultHorizontalBetweenPadding: number,
    setMapPadding: React.Dispatch<React.SetStateAction<EdgePadding>>,
): void => {
    const {
        left = mapPaddingRef.current.left,
        top = mapPaddingRef.current.top,
        right = mapPaddingRef.current.right,
        bottom = mapPaddingRef.current.bottom,
    } = padding;

    // Adjust vertical padding if it exceeds screen height
    const screenHeight = Dimensions.get('screen').height;
    const totalVerticalPadding = top + bottom;

    let ntop: number, nbottom: number;

    if (totalVerticalPadding + defaultVerticalBetweenPadding > screenHeight) {
        const excessPadding = totalVerticalPadding - screenHeight + defaultVerticalBetweenPadding;

        if (top > bottom) {
            ntop = Math.max(top - excessPadding, 0);
            nbottom = bottom;
        } else {
            ntop = top;
            nbottom = Math.max(bottom - excessPadding, 0);
        }
    } else {
        ntop = top;
        nbottom = bottom;
    }

    // Adjust horizontal padding if it exceeds screen width
    const screenWidth = Dimensions.get('screen').width;
    const totalHorizontalPadding = left + right;

    let nright: number, nleft: number;

    if (totalHorizontalPadding + defaultHorizontalBetweenPadding > screenWidth) {
        const excessPadding = totalHorizontalPadding - screenWidth + defaultVerticalBetweenPadding;
        if (left > right) {
            nleft = Math.max(left - excessPadding, 0);
            nright = right;
        } else {
            nleft = left;
            nright = Math.max(right - excessPadding, 0);
        }
    } else {
        nright = right;
        nleft = left;
    }

    const newMapPadding: EdgePadding = {
        top: ntop,
        right: nright,
        bottom: nbottom,
        left: nleft,
    };

    debugLog('addMapPadding:', newMapPadding);
    mapPaddingRef.current = newMapPadding;
    setMapPadding(newMapPadding);
};

export const fitToCoordinates = (
    params: { coordinates: LatLng[]; duration: number | undefined },
    mapPaddingRef: React.RefObject<EdgePadding>,
    mapRef: React.RefObject<MapView | null>,
): void => {
    const { coordinates, duration } = params;

    const fitToCoordinatesOptions: FitToOptions = {
        edgePadding: mapPaddingRef.current,
        animated: true,
        duration: duration,
    };

    if (coordinates.length > 0 && mapRef.current) {
        debugLog('fitToCoordinates', coordinates.length, fitToCoordinatesOptions);
        mapRef.current.fitToCoordinates(coordinates, fitToCoordinatesOptions);
    }
};

export const fitToMapElements = (
    options: { duration: number | undefined } = { duration: undefined },
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
    mapPaddingRef: React.MutableRefObject<EdgePadding>,
    mapRef: React.MutableRefObject<MapView | null>,
): void => {
    const { duration = 500 } = options;
    setPolylines(oldPolyline => {
        let newFocusableCoordinates: LatLng[] = [];

        oldPolyline.forEach(value => {
            if (value.visible) {
                newFocusableCoordinates = newFocusableCoordinates.concat(value.coordinates);
            }
        });
        if (newFocusableCoordinates.length > 0) {
            debugLog('fitToMapElements', newFocusableCoordinates, duration, ' MapPadding: ', mapPaddingRef.current);
            fitToCoordinates(
                {
                    coordinates: newFocusableCoordinates,
                    duration: duration,
                },
                mapPaddingRef,
                mapRef,
            );
        }
        return oldPolyline;
    });
};
// Get camera
export const getCamera = async ({ mapRef }: { mapRef: React.RefObject<MapView | null> }): Promise<Camera | null> => {
    if (mapRef.current) {
        return await mapRef.current.getCamera();
    } else {
        console.error('Error getCamera: Map ref is not available');
        return null;
    }
};

export const changeAutoAnimationToCurrentLocation = ({
    autoAnimationToCurrentLocation,
    value,
}: {
    autoAnimationToCurrentLocation: React.MutableRefObject<boolean>;
    value: boolean;
}): void => {
    autoAnimationToCurrentLocation.current = value;
};

export const moveCameraToCurrentLocation = (
    mapRef: React.MutableRefObject<MapView | null>,
    currentPosition: LatLng | null,
    _initialCoordinate?: LatLng,
) => {
    debugLog('moveCameraToCurrentLocation: ', currentPosition);
    if (currentPosition) {
        animateCamera({
            _initialCoordinate,
            mapRef,
            lat: currentPosition?.latitude,
            lon: currentPosition?.longitude,
            zoom: 17,
            duration: undefined,
        }).catch(err => console.error('Camera animation failed', err));
    }
};

export const useMapPadding = (duration = 100) => {
    const initialEdgePadding: EdgePadding = {
        top: percentageHeightToDp(3),
        right: percentageWidthToDp(8),
        bottom: percentageHeightToDp(3),
        left: percentageWidthToDp(8),
    };

    const [staticMapPadding, setStaticMapPadding] = React.useState(initialEdgePadding);
    const [mapPaddingValue, setMapPaddingValue] = React.useState(initialEdgePadding);

    duration = Platform.OS === 'ios' ? duration + 200 : duration;
    const addStaticMapPadding = React.useCallback(
        (params: Partial<EdgePadding> = { top: undefined, right: undefined, bottom: undefined, left: undefined }) => {
            debugLog('addStaticMapPadding', params);
            const newMapPadding: EdgePadding = {
                top: params.top ?? 0,
                right: params.right ?? 0,
                bottom: params.bottom ?? 0,
                left: params.left ?? 0,
            };
            setMapPaddingValue(newMapPadding);
        },
        [],
    );

    const sharedValues = {
        left: useSharedValue(initialEdgePadding.left),
        right: useSharedValue(initialEdgePadding.right),
        top: useSharedValue(initialEdgePadding.top),
        bottom: useSharedValue(initialEdgePadding.bottom),
    };

    const animateSharedValues = (newPadding: EdgePadding) => {
        const animationConfig = { duration };
        Object.entries(newPadding).forEach(([key, value]) => {
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            sharedValues[key as keyof EdgePadding].value = withTiming(value, animationConfig);
        });
    };

    const setStaticMapPaddingThrottled = React.useCallback(
        throttle(newPadding => {
            setStaticMapPadding(newPadding);
        }, 16), // ~60 FPS (16ms)
        [],
    );

    useAnimatedReaction(
        () => ({
            left: sharedValues.left.value,
            right: sharedValues.right.value,
            top: sharedValues.top.value,
            bottom: sharedValues.bottom.value,
        }),
        (newPadding, prevPadding) => {
            const hasChanged = Object.keys(newPadding).some(
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                key => newPadding[key as keyof EdgePadding] !== prevPadding?.[key as keyof EdgePadding],
            );

            if (hasChanged) {
                runOnJS(setStaticMapPaddingThrottled)(newPadding);
            }
        },
    );

    React.useEffect(() => {
        animateSharedValues(mapPaddingValue);
    }, [mapPaddingValue]);

    return {
        staticMapPadding,
        addStaticMapPadding,
    };
};

export const removeAllPolylines = (
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
): void => {
    debugLog('removeAllPolylines');
    setPolylines(() => new Map<string, polylineData>());
};

export const removeAllMarkers = (setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>) => {
    setMarkers(() => new Map<string, markerData>());
};

export const multiModalBuildRoute = (
    routeId: string,
    polylineId: string[],
    markersIds: string[],
    routeRef: React.MutableRefObject<Map<string, MultiRouteData>>,
): void => {
    if (routeRef) {
        debugLog('buildRoute', routeId, polylineId, ...markersIds);
        const routeData: MultiRouteData = {
            id: routeId,
            markersIds,
            polylineId,
        };
        routeRef.current?.set(routeId, routeData);
    }
};

export const hasRoute = (
    multiRouteRef: React.MutableRefObject<Map<string, MultiRouteData>>,
    routeId: string,
): boolean => {
    return multiRouteRef.current.has(routeId);
};

export const hasMarker = (
    multiRouteRef: React.MutableRefObject<Map<string, MultiRouteData>>,
    routeId: string,
    markerId: string,
): boolean => {
    for (const routeData of multiRouteRef.current.values()) {
        if (routeData.id === routeId) {
            return routeData.markersIds.includes(markerId);
        }
    }
    return false;
};
export const getMarkerArray = (
    multiRouteRef: React.MutableRefObject<Map<string, MultiRouteData>>,
    routeId: string,
): string[] => {
    const routeData = multiRouteRef.current.get(routeId);
    return routeData ? routeData.markersIds : [];
};
export const hasPolyline = (
    multiRouteRef: React.MutableRefObject<Map<string, MultiRouteData>>,
    routeId: string,
    polyline: polylineData,
): boolean => {
    for (const routeData of multiRouteRef.current.values()) {
        if (routeData.id === routeId) {
            return routeData.polylineId.includes(polyline.id);
        }
    }
    return false;
};
export const hasPolylineWithoutRouteId = (polylines: Map<string, polylineData>, polylineId: string): boolean => {
    return polylines.has(polylineId);
};
export const hasMarkerWithoutRouteId = (markers: Map<string, markerData>, markerId: string): boolean => {
    return markers.has(markerId);
};

export const hasPolygonWithoutRouteId = (polygons: Map<string, polygonData>, polygonId: string): boolean => {
    return polygons.has(polygonId);
};

export const multiModalRemoveRoute = (
    routeId: string,
    multiRouteRef: React.MutableRefObject<Map<string, MultiRouteData>>,
    hidePolyline: (
        setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
        polylineId: string,
    ) => void,
    removeMarker: (setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>, markerId: string) => void,
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
) => {
    const routeData = multiRouteRef.current.get(routeId);
    if (routeData) {
        routeData.polylineId.forEach(polylineId => hidePolyline(setPolylines, polylineId));
        routeData.markersIds.length && routeData.markersIds.map(id => removeMarker(setMarkers, id));
        multiRouteRef.current.delete(routeId);
    }
};

export const multimodalRemoveMarker = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    markerId: string,
    multiRouteRef: React.MutableRefObject<Map<string, MultiRouteData>>,
    routeId: string,
) => {
    removeMarker(setMarkers, markerId);
    const routeData = multiRouteRef.current.get(routeId);
    if (routeData) {
        routeData.markersIds = routeData.markersIds.filter(id => id !== markerId);
    }
};

export const updateNearbyClusterMarkers = (
    setMarkers: React.Dispatch<React.SetStateAction<Map<string, markerData>>>,
    nearbyDrivers: nearbyDriverRes,
    _forceUpdate: boolean,
    mapRef: React.RefObject<MapView | null>,
    shouldCluster: boolean,
    currentZoom: number,
    currentMarkers: Map<string, markerData>,
    navigation: NativeStackNavigationProp<MainNavigationParamList>,
    travelMode: MultimodalTravelMode_multimodalTravelMode,
) => {
    const CLUSTERING_ZOOM_THRESHOLD = 18;
    const isClusteringEnabled = shouldCluster && currentZoom < CLUSTERING_ZOOM_THRESHOLD;
    const gridSize = getGridSize(currentZoom);
    const clusters = buildcluster(nearbyDrivers, isClusteringEnabled, gridSize);

    if (Platform.OS === 'android') {
        const processedMarkers = buildAndroidClusterMarkers(clusters, travelMode);

        console.info('Processed nearby markers count:', processedMarkers.length);
        try {
            const nativeTag = findNodeHandle(mapRef.current);
            if (nativeTag) {
                NativeAirMapsModule.updateNearbyMarkersNative(nativeTag, JSON.stringify(processedMarkers)).catch(
                    (error: Error) => console.error('Native marker update failed:', error),
                );
            }
        } catch (error) {
            console.error('Error calling native updateNearbyMarkersNative:', error);
        }
    } else {
        updateClusterMarkers(currentMarkers, setMarkers, clusters, navigation, moveMarker);
    }
};
