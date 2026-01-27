import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import MapView, {
    Camera,
    EdgePadding,
    LatLng,
    Point,
    // MapPolyline,
    Region,
    SnapshotOptions,
} from 'react-native-maps';

import { IconType } from '../components/AnimatedMapPin.tsx';
import {
    MultimodalTravelMode_multimodalTravelMode,
    VehicleVariant_vehicleVariant,
} from '@/readOnly/api/types/Enums.gen';
import { circleData, markerData, MultiRouteData, polygonData, polylineData, routeData, zoneData } from './MapType.tsx';
import { percentageHeightToDp, percentageWidthToDp } from '@/helpers/utils/Utils.bs';
import GMapView from './MapView.tsx';

import {
    addMarker,
    animateCamera,
    moveMarker,
    addPolyline,
    hidePolyline,
    updateCalloutText,
    updateMarkerEditOption,
    removeMarker,
    cancelMarkerAnimation,
    rotateMarker,
    removeAllZone,
    removePolygon,
    addZone,
    removeZone,
    addPolygon,
    addCircle,
    removeCircle,
    getCamera,
    buildRoute,
    updateRoute,
    clearRoute,
    removeRoute,
    changeAutoAnimationToCurrentLocation,
    moveCameraToCurrentLocation,
    fitToMapElements,
    addMapPadding,
    onMapReady,
    onPanDrag,
    updateMarkerRef,
    updatePolylineRef,
    useMapPadding,
    setMarkerVisibility,
    removeNearbyMarkers,
    updateNearbyMarkers,
    removeAllPolylines,
    removeAllMarkers,
    multiModalBuildRoute,
    hasPolyline,
    hasMarker,
    getMarkerArray,
    hasRoute,
    updatePolyline,
    multiModalRemoveRoute,
    addMarkersFromArray,
    multimodalRemoveMarker,
    hasPolylineWithoutRouteId,
    hasMarkerWithoutRouteId,
    hasPolygonWithoutRouteId,
    toggleMarkerCalloutVisibility,
    turnOffAllCallouts,
    updateMarkersEta,
    fitToCoordinates,
    updateNearbyClusterMarkers,
} from './MapUtils.ts';
import { useAppSelector } from '../state/hooks.ts';
import { selectCurrentLocationCoords } from '../state/client/session.ts';
import { StyleProp, ViewStyle, Dimensions } from 'react-native';
import { nearbyDriverRes } from '@/typescript/state/server/nearbyDriversApi.ts';
import { useSerializedFitToCoordinates } from './helpers/useSerializedMapFitToCoordinates.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList.tsx';
import { StaticMarker } from '../tracking/trackingTypes.ts';
// import { props } from '../../screens/ongoingRideFlow/components/RideStatusPill.gen';
// import { options } from '../../helpers/externalModules/GMap/ReactMap.gen';

export type MapRef = {
    animateCamera: ({
        lat,
        lon,
        zoom,
        duration,
    }: {
        lat: number | undefined;
        lon: number | undefined;
        zoom: number;
        duration: number | undefined;
    }) => Promise<void>;
    addMarkersFromArray: ({
        markersArray,
        routeId,
        forceUpdate,
    }: {
        markersArray: markerData[];
        routeId: string | undefined;
        forceUpdate: boolean | undefined;
    }) => void;
    addMarker: ({
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
        coordinate: LatLng;
        id: string;
        zIndex: number | undefined;
        anchor: Point | undefined;
        rotateEnabled: boolean | undefined;
        rotation: number | undefined;
        children: React.ReactNode | undefined;
        style: StyleProp<ViewStyle> | undefined;
        title: string | undefined;
        onClick: (() => void) | undefined;
        showEditIcon: boolean | undefined;
        iconType: IconType;
        vehicleVariant: VehicleVariant_vehicleVariant | undefined;
        multimodalVariant: string | undefined;
        markerOnPress: ((markerId: string) => void) | undefined;
    }) => void;
    moveMarker: ({
        markerId,
        newPosition,
        animationDuration,
        rotation,
        rotationDuration,
    }: {
        markerId: string;
        newPosition: LatLng;
        animation: boolean;
        animationDuration: number | undefined;
        rotation: number | undefined;
        rotationDuration: number | undefined;
    }) => Promise<void>;
    getMarkers: () => Map<string, markerData>;
    addPolyline: ({
        id,
        coordinates,
        visible,
        strokeColor,
        strokeColors,
        strokeWidth,
        lineDashPattern,
    }: {
        visible: boolean | undefined;
        coordinates: LatLng[];
        strokeColor: string | undefined;
        strokeColors: string[] | undefined;
        id: string;
        strokeWidth: number | undefined;
        extendPath: boolean | undefined;
        lineDashPattern: number[] | undefined;
    }) => Promise<void>;
    addPolygon: ({
        id,
        coordinates,
        strokeWidth,
        strokeColor,
        fillColor,
        visible,
        lineDashPattern,
        tappable,
        onPress,
    }: {
        coordinates: LatLng[];
        id: string;
        strokeWidth: number | undefined;
        strokeColor: string | undefined;
        fillColor: string | undefined;
        visible: boolean | undefined;
        lineDashPattern: number[] | undefined;
        tappable: boolean | undefined;
        onPress: () => void;
    }) => void;
    addCircle: ({
        id,
        center,
        radius,
        strokeWidth,
        strokeColor,
        fillColor,
        visible,
    }: {
        id: string;
        center: LatLng;
        radius: number;
        strokeWidth: number | undefined;
        strokeColor: string | undefined;
        fillColor: string | undefined;
        visible: boolean | undefined;
    }) => void;
    removeCircle: ({ circleId }: { circleId: string }) => void;
    setCenterView: React.Dispatch<React.SetStateAction<React.ReactNode>>;
    mapReady: boolean;
    isMapDragged: boolean;
    changeAutoAnimationToCurrentLocation: (value: boolean) => void;
    currentRegion: React.MutableRefObject<{
        region: Region;
        isGesture: boolean;
    }>;
    setCurrentLocationMarkerVisibility: React.Dispatch<React.SetStateAction<boolean>>;
    /**
     * Padding applied to the `mapPadding` prop of `GMapView`.
     *
     * Pass this value directly to:
     * `<GMapView mapPadding={staticMapPadding} />`
     *
     * This controls the visible region of the map and prevents
     * UI elements (headers, bottom sheets, etc.) from overlapping
     * the map content.
     *
     * The padding updates smoothly when `addStaticMapPadding` is called.
     */
    staticMapPadding: EdgePadding;
    /**
     * Updates the padding applied to the `mapPadding` prop of `GMapView`.
     *
     * This padding is rendered directly by the map component
     *
     * Only the provided edges are updated.
     * All unspecified edges default to `0`.
     */
    addStaticMapPadding: (params: Partial<EdgePadding>) => void;
    /**
     * Applies additional padding for map fitting logic only.
     *
     * This function does NOT modify the `mapPadding` prop of `GMapView`.
     * Instead, it triggers `fitToMapElements`, which internally calls
     * `fitToCoordinates` using:
     *
     * - the currently rendered `staticMapPadding`, and
     * - the additional padding values provided here.
     *
     * Use this when the map needs to refit its visible region
     * without changing the rendered padding.
     *
     * ⚠️ Do NOT use this to visually move the map above UI elements
     * such as a bottom sheet. For layout-related padding,
     * use `addStaticMapPadding` instead.
     */
    addMapPadding: (params: Partial<EdgePadding>) => void;
    moveCameraToCurrentLocation: () => void;
    getCamera: () => Promise<Camera | null>;
    fitToCoordinates: (params: { coordinates: LatLng[]; duration: number | undefined }) => void;
    fitToCoordinatesSerialized: (params: { coordinates: LatLng[]; duration: number | undefined }) => void;
    fitToMapElements: (params: { duration: number | undefined }) => void;
    buildRoute: (routeId: string, polylineId: string, markersIds: string[]) => void;
    updateRoute: ({ routeId, coordinate }: { routeId: string; coordinate: LatLng }) => Promise<boolean>;
    rotateMarker: ({
        markerId,
        startLatLng,
        endLatLng,
        duration,
    }: {
        markerId: string;
        startLatLng: LatLng;
        endLatLng: LatLng;
        duration: number | undefined;
    }) => Promise<void>;
    removeMarker: (markerId: string) => void;
    cancelMarkerAnimation: (markerId: string) => void;
    clearRoute: () => void;
    removePolygon: ({ polygonId }: { polygonId: string }) => void;
    removeAllZone: () => void;
    removeZone: ({ zoneId }: { zoneId: string }) => void;
    addZone: ({ zoneId, polygonId, markersIds }: { zoneId: string; polygonId: string; markersIds: string[] }) => void;
    hidePolyline: (polylineId: string) => void;
    updateCalloutText: (markerId: string, text: string) => void;
    updateMarkerEditOption: (markerId: string, showEditIcon: boolean) => void;
    removeRoute: (routeId: string) => void;
    setMarkerVisibility: (markerId: string, visible: boolean) => void;
    toggleMarkerCalloutVisibility: (markerId: string) => void;
    turnOffAllCallouts: () => void;
    updateMarkersEta: (allStaticMarkers: StaticMarker[]) => void;
    removeNearbyMarkers: () => void;
    removeAllPolylines: () => void;
    updateNearbyMarkers: (
        nearbyDrivers: nearbyDriverRes,
        vehicleVariant: string | undefined,
        forceUpdate: boolean,
    ) => void;
    updateNearbyClusterMarkers: (
        nearbyDrivers: nearbyDriverRes,
        forceUpdate: boolean,
        shouldCluster: boolean,
        navigation: NativeStackNavigationProp<MainNavigationParamList>,
        travelMode: MultimodalTravelMode_multimodalTravelMode,
    ) => void;
    removeAllMarkers: () => void;
    multiModalBuildRoute: (routeId: string, polylineId: string[], markersIds: string[]) => void;
    multiModalRemoveRoute: (routeId: string) => void;
    updatePolyline: (params: {
        polylineId: string;
        newCoordinates: LatLng[];
        strokeColor: string | undefined;
        strokeWidth: number | undefined;
    }) => void;
    hasMarker: (routeId: string, markerId: string) => boolean;
    getMarkerArray: (routeId: string) => string[];
    hasRoute: (routeId: string) => boolean;
    hasPolylineWithoutRouteId: (polylineId: string) => boolean;
    hasMarkerWithoutRouteId: (markerId: string) => boolean;
    hasPolygonWithoutRouteId: (polygonId: string) => boolean;
    hasPolyline: (routeId: string, polyline: polylineData) => boolean;
    multimodalRemoveMarker: (routeId: string, markerId: string) => void;
    takeSnapshot: (config: SnapshotOptions) => Promise<string>;
    mapId: string;
};
export interface GlobalMapProps {
    initialCoordinate: LatLng | undefined;
    hidden: boolean | undefined;
    animatedCircle: React.ReactNode | undefined;
    mapId: string;
    fitToMapElementFlag: boolean | undefined;
    zoomLevel: number | undefined;
    onPress: () => void;
}

const GlobalMapComponent__ = (
    {
        initialCoordinate,
        hidden,
        animatedCircle,
        mapId,
        zoomLevel = 13.5,
        fitToMapElementFlag = true,
        onPress = () => {},
    }: GlobalMapProps,
    ref: React.Ref<MapRef>,
) => {
    const initialEdgePadding: EdgePadding = {
        top: percentageHeightToDp(3),
        right: percentageWidthToDp(8),
        bottom: percentageHeightToDp(3),
        left: percentageWidthToDp(8),
        // top: 3,
        // right: 8,
        // bottom: 3,
        // left: 8,
    };
    const autoAnimationToCurrentLocation = useRef(false);
    const fitToMapElementFlagRef = useRef<boolean | undefined>(fitToMapElementFlag);
    const fallbackCoordinate: LatLng = { latitude: 10.0, longitude: 10.0 };

    // Validate that initialCoordinate has both latitude and longitude as valid numbers
    const isValidCoordinate = (coord: LatLng | undefined): coord is LatLng => {
        return (
            coord !== undefined &&
            coord !== null &&
            typeof coord.latitude === 'number' &&
            typeof coord.longitude === 'number' &&
            !isNaN(coord.latitude) &&
            !isNaN(coord.longitude)
        );
    };

    const _initialCoordinate = isValidCoordinate(initialCoordinate) ? initialCoordinate : fallbackCoordinate;

    const initialCamera: Camera = useMemo(
        () => ({
            center: {
                latitude: _initialCoordinate.latitude,
                longitude: _initialCoordinate.longitude,
            },
            pitch: 0,
            heading: 0,
            altitude: 0,
            zoom: zoomLevel,
        }),
        [],
    );

    const initialRegion: { region: Region; isGesture: boolean } = {
        region: {
            latitude: _initialCoordinate.latitude,
            longitude: _initialCoordinate.longitude,
            latitudeDelta: 0.0,
            longitudeDelta: 0.0,
        },
        isGesture: false,
    };

    const initialMarkers = new Map<string, markerData>();

    const [mapPadding, setMapPadding] = useState(initialEdgePadding);
    const mapPaddingRef = useRef(mapPadding);

    const defaultHorizontalBetweenPadding = 60;
    const defaultVerticalBetweenPadding = 100;
    const currentRegion = useRef(initialRegion);
    const [currentLocationMarkerVisibility, setCurrentLocationMarkerVisibility] = useState<boolean>(false);
    const [centerView, setCenterView] = useState<React.ReactNode>(null);
    const [mapReady, setMapReady] = useState(false);
    const [isMapDragged, setIsMapDragged] = useState(false);
    // --------------------- Marker Funcitons intintlized ----------------------------------
    const [markers, setMarkers] = useState(initialMarkers);
    const markersRef = useRef(markers);

    useEffect(() => {
        // CRITICAL: Don't replace markersRef entirely - preserve refs that were stored via updateMarkerRef
        // Only sync data changes (coordinate, rotation, etc.) while keeping existing refs
        markers.forEach((markerData, key) => {
            const existingData = markersRef.current.get(key);
            if (existingData) {
                // Preserve the ref, update everything else
                const hasExistingRef = !!existingData.ref;
                markersRef.current.set(key, { ...markerData, ref: existingData.ref });
                if (key === 'routeStart') {
                    console.info(
                        '[MARKER_FLICKER][MapComponent] Sync - preserving ref for:',
                        key,
                        'hasRef:',
                        hasExistingRef,
                    );
                }
            } else {
                // New marker, no existing ref
                markersRef.current.set(key, markerData);
                if (key === 'routeStart') {
                    console.info('[MARKER_FLICKER][MapComponent] Sync - new marker, no existing ref for:', key);
                }
            }
        });
        // Remove markers that no longer exist in state
        markersRef.current.forEach((_, key) => {
            if (!markers.has(key)) {
                markersRef.current.delete(key);
            }
        });
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [markers]);

    const mapRef = useRef<MapView>(null);

    const lastNearbyDriversRef = useRef<nearbyDriverRes | null>(null);
    const checkZoomLevelRef = useRef<boolean>(false);
    const travelModeRef = useRef<MultimodalTravelMode_multimodalTravelMode | null>(null);
    const [currentZoom, setCurrentZoom] = useState(zoomLevel);

    const handleRegionChangeComplete = (region: Region) => {
        const zoom = Math.log2(360 * (Dimensions.get('window').width / 256 / region.longitudeDelta)) + 1;
        setCurrentZoom(zoom);
    };

    const { fitToCoordinatesSerialized } = useSerializedFitToCoordinates(mapPaddingRef, mapRef);

    // --------------------- Polygon State intintlized ---------------------------------------------------------------------

    const initialPolygons = new Map<string, polygonData>();
    const [polygons, setPolygons] = useState(initialPolygons);

    // --------------------- Zone states ---------------------------------------------------------------------------
    const initialZones = new Map<string, zoneData>();
    const zonesRef = useRef(initialZones);

    // --------------------- polyline states intintlized ---------------------------------------------------------------------
    const initialPolylines = new Map<string, polylineData>();
    const [polylines, setPolylines] = useState(initialPolylines);

    // --------------------- Route states ---------------------------------------------------------------------------

    const initialRoutes = new Map<string, routeData>();
    const routesRef = useRef(initialRoutes);

    // --------------------- Route states ---------------------------------------------------------------------------

    const initialMultiRoutes = new Map<string, MultiRouteData>();
    const multiRoutesRef = useRef(initialMultiRoutes);

    //---------------------------------Map Padding states --------------------------------------------------------------
    const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);

    // -----------------------------------------Circle states -----------------------------------------

    const initialCircles = new Map<string, circleData>();
    const [circles, setCircles] = useState(initialCircles);

    const { staticMapPadding, addStaticMapPadding } = useMapPadding();

    useImperativeHandle(ref, () => {
        return {
            animateCamera: props => {
                return animateCamera({
                    mapRef,
                    _initialCoordinate,
                    ...props,
                });
            },
            addMarkersFromArray: props => {
                return addMarkersFromArray({
                    multiRoutesRef,
                    setMarkers,
                    ...props,
                });
            },
            addMarker: props => {
                return addMarker({
                    setMarkers,
                    ...props,
                });
            },
            moveMarker: props => {
                return moveMarker({
                    markersRef,
                    ...props,
                });
            },
            getMarkers: () => {
                return markersRef.current;
            },
            addPolyline: props => {
                return addPolyline({
                    setPolylines,
                    ...props,
                });
            },
            addPolygon: props => {
                return addPolygon({
                    setPolygons,
                    ...props,
                });
            },
            addCircle: props => {
                return addCircle({
                    setCircles,
                    ...props,
                });
            },
            removeCircle: props => {
                return removeCircle({
                    setCircles,
                    ...props,
                });
            },
            removeRoute: routeId => {
                return removeRoute(setPolylines, setMarkers, routesRef, routeId);
            },
            setCenterView: setCenterView,
            mapReady: mapReady,
            isMapDragged: isMapDragged,
            changeAutoAnimationToCurrentLocation: value => {
                return changeAutoAnimationToCurrentLocation({
                    autoAnimationToCurrentLocation,
                    value,
                });
            },
            currentRegion: currentRegion,
            setCurrentLocationMarkerVisibility: setCurrentLocationMarkerVisibility,
            staticMapPadding: staticMapPadding,
            addStaticMapPadding: addStaticMapPadding,
            addMapPadding: padding => {
                return addMapPadding(
                    padding,
                    mapPaddingRef,
                    defaultVerticalBetweenPadding,
                    defaultHorizontalBetweenPadding,
                    setMapPadding,
                );
            },
            moveCameraToCurrentLocation: () => {
                return moveCameraToCurrentLocation(mapRef, currentPosition, _initialCoordinate);
            },
            getCamera: () => {
                return getCamera({
                    mapRef,
                });
            },
            fitToCoordinates: params => {
                return fitToCoordinates(params, mapPaddingRef, mapRef);
            },
            fitToCoordinatesSerialized: params => {
                return fitToCoordinatesSerialized(params);
            },
            fitToMapElements: options => {
                return fitToMapElements(options, setPolylines, mapPaddingRef, mapRef);
            },
            buildRoute: (routeId: string, polylineId: string, markersIds: string[]) => {
                return buildRoute(routesRef, routeId, polylineId, markersIds);
            },
            updateRoute: props => {
                return updateRoute({
                    routesRef,
                    polylines,
                    setPolylines,
                    setMarkers,
                    markers,
                    ...props,
                });
            },
            rotateMarker: props => {
                return rotateMarker({
                    markers,
                    ...props,
                });
            },
            removeMarker: props => {
                return removeMarker(setMarkers, props);
            },
            cancelMarkerAnimation: props => {
                return cancelMarkerAnimation(markers, props);
            },
            clearRoute: () => {
                return clearRoute({
                    setPolylines,
                    setMarkers,
                    routesRef,
                });
            },
            removePolygon: props => {
                return removePolygon({
                    setPolygons,
                    ...props,
                });
            },
            addZone: props => {
                return addZone({
                    zonesRef,
                    ...props,
                });
            },
            removeAllZone: () => {
                return removeAllZone({
                    setMarkers,
                    setPolygons,
                    zonesRef,
                });
            },
            removeZone: props => {
                return removeZone({
                    setPolygons,
                    setMarkers,
                    zonesRef,
                    ...props,
                });
            },
            hidePolyline: props => {
                return hidePolyline(setPolylines, props);
            },
            updateCalloutText: (markerId: string, text: string) => {
                return updateCalloutText(markersRef, markerId, text);
            },
            updateMarkerEditOption: (markerId: string, showEditIcon: boolean) => {
                return updateMarkerEditOption(setMarkers, markerId, showEditIcon);
            },
            setMarkerVisibility: (markerId: string, visible: boolean) => {
                return setMarkerVisibility(setMarkers, markerId, visible);
            },
            toggleMarkerCalloutVisibility: (markerId: string) => {
                return toggleMarkerCalloutVisibility(setMarkers, markerId);
            },
            turnOffAllCallouts: () => {
                return turnOffAllCallouts(setMarkers);
            },
            updateMarkersEta: (allStaticMarkers: StaticMarker[]) => {
                return updateMarkersEta(setMarkers, allStaticMarkers);
            },
            removeNearbyMarkers: () => {
                return removeNearbyMarkers(setMarkers, mapRef);
            },
            removeAllPolylines: () => {
                return removeAllPolylines(setPolylines);
            },
            updateNearbyMarkers: (
                nearbyDrivers: nearbyDriverRes,
                vehicleVariant: string | undefined,
                forceUpdate: boolean,
            ) => {
                lastNearbyDriversRef.current = nearbyDrivers;
                checkZoomLevelRef.current = false;
                return updateNearbyMarkers(setMarkers, nearbyDrivers, vehicleVariant, forceUpdate, mapRef);
            },
            updateNearbyClusterMarkers: (
                nearbyDrivers: nearbyDriverRes,
                forceUpdate: boolean,
                shouldCluster: boolean,
                navigation: NativeStackNavigationProp<MainNavigationParamList>,
                travelMode: MultimodalTravelMode_multimodalTravelMode,
            ) => {
                lastNearbyDriversRef.current = nearbyDrivers;
                checkZoomLevelRef.current = true;
                travelModeRef.current = travelMode;
                return updateNearbyClusterMarkers(
                    setMarkers,
                    nearbyDrivers,
                    forceUpdate,
                    mapRef,
                    shouldCluster,
                    currentZoom,
                    markersRef.current,
                    navigation,
                    travelMode,
                );
            },
            removeAllMarkers: () => {
                removeAllMarkers(setMarkers);
            },
            multiModalBuildRoute: (routeId: string, polylineId: string[], markersIds: string[]) => {
                return multiModalBuildRoute(routeId, polylineId, markersIds, multiRoutesRef);
            },
            multiModalRemoveRoute: routeId => {
                return multiModalRemoveRoute(
                    routeId,
                    multiRoutesRef,
                    hidePolyline,
                    removeMarker,
                    setPolylines,
                    setMarkers,
                );
            },
            updatePolyline: props => {
                return updatePolyline({
                    setPolylines: setPolylines,
                    polylineId: props.polylineId,
                    newCoordinates: props.newCoordinates,
                    strokeColor: props.strokeColor,
                    strokeWidth: props.strokeWidth,
                });
            },
            hasMarker: (routeId: string, markerId: string) => {
                return hasMarker(multiRoutesRef, routeId, markerId);
            },
            getMarkerArray: (routeId: string) => {
                return getMarkerArray(multiRoutesRef, routeId);
            },
            hasRoute: (routeId: string) => {
                return hasRoute(multiRoutesRef, routeId);
            },
            hasPolylineWithoutRouteId: (polylineId: string) => {
                return hasPolylineWithoutRouteId(polylines, polylineId);
            },
            hasPolygonWithoutRouteId: (polygonId: string) => {
                return hasPolygonWithoutRouteId(polygons, polygonId);
            },
            hasMarkerWithoutRouteId: (markerId: string) => {
                return hasMarkerWithoutRouteId(markers, markerId);
            },
            hasPolyline: (routeId: string, polyline: polylineData) => {
                return hasPolyline(multiRoutesRef, routeId, polyline);
            },
            multimodalRemoveMarker: (routeId: string, markerId: string) => {
                return multimodalRemoveMarker(setMarkers, markerId, multiRoutesRef, routeId);
            },
            takeSnapshot: config => {
                if (!mapRef.current) {
                    return Promise.reject(new Error('Map ref not available'));
                }
                return mapRef.current.takeSnapshot(config);
            },
            mapId: mapId,
        };
    }, []);

    // UseEffects for current location moving
    const currentLocation = useAppSelector(selectCurrentLocationCoords);
    useEffect(() => {
        if (currentLocation) {
            const userCurrLocation: LatLng = {
                latitude: currentLocation?.coords?.latitude,
                longitude: currentLocation?.coords?.longitude,
            };
            setCurrentPosition(userCurrLocation);

            // Animate the camera to the current location if auto animation is enabled
            if (autoAnimationToCurrentLocation.current) {
                animateCamera({
                    _initialCoordinate,
                    mapRef,
                    lat: userCurrLocation.latitude,
                    lon: userCurrLocation.longitude,
                    zoom: 17,
                    duration: undefined,
                });
            }
        }
    }, [currentLocation]);

    // UseEffect for fitToMapElements with mapPadding
    useEffect(() => {
        mapPaddingRef.current = mapPadding;

        if (fitToMapElementFlagRef.current) {
            fitToMapElements({ duration: 500 }, setPolylines, mapPaddingRef, mapRef);
        }
    }, [mapPadding.bottom, mapPadding.left, mapPadding.right, mapPadding.top]);

    return (
        <GMapView
            polylines={polylines}
            markers={markers}
            polygons={polygons}
            circles={circles}
            initialCamera={initialCamera}
            setCurrentRegion={currentRegion}
            mapRef={mapRef}
            onMapReady={onMapReady}
            onPanDrag={onPanDrag}
            setIsMapDragged={setIsMapDragged}
            onPress={onPress}
            hidden={hidden}
            centerView={centerView}
            markersRef={markersRef}
            updateMarkerRef={updateMarkerRef}
            updatePolylineRef={updatePolylineRef}
            currentLocationMarkerVisibility={currentLocationMarkerVisibility} // change late
            mapPadding={staticMapPadding}
            animatedCircle={animatedCircle}
            setMapReady={setMapReady}
            setPolylines={setPolylines}
            MapId={mapId}
            onRegionChangeComplete={handleRegionChangeComplete}
        />
    );
};

const MapComponent = forwardRef<MapRef, GlobalMapProps>(GlobalMapComponent__);

export default MapComponent;
