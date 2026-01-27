import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, {
    Polyline,
    Polygon,
    Circle,
    Region,
    Camera,
    MapPolyline,
    //   MapPressEvent,
    EdgePadding,
    MapPressEvent,
    MarkerPressEvent,
} from 'react-native-maps';
import { circleData, markerData, polygonData, polylineData } from './MapType';

import AnimatedMapPin, { AnimatedMapPinRef } from '@/typescript/components/AnimatedMapPin';
import { setCurrentRegionId, setMapIsMoved } from '../state/client/maps';
import { AppDispatchType, useAppDispatch, useAppSelector } from '../state/hooks';
import CustomCurrentLocationMarker from '../components/CustomCurrentLocationMarker';
import { BottomSheetStage, selectBottomSheetStage, selectAppConfig } from '../state/client/session';
import { navigationRef } from '../navigation/RootNavigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import { navigateToBusTracking } from '../utils/busTracking';
const enableDebugLogs = false;

// DEBUG: Marker flickering investigation
const MARKER_FLICKER_DEBUG = false;
// eslint-disable-next-line functional/no-let
let markersViewComputeCount = 0;
// eslint-disable-next-line functional/no-let
let refCallbackCount = 0;
// eslint-disable-next-line functional/no-let
let mapViewRenderCount = 0;

const debugLog = (...args: (string | number)[]) => {
    if (enableDebugLogs) {
        console.info('MapView', ...args);
    }
};

type MapStyleElement = {
    elementType: string;
    featureType: string;
    stylers: { color: string }[];
};

type Props = {
    polylines: Map<string, polylineData>;
    markers: Map<string, markerData>;
    polygons: Map<string, polygonData>;
    circles: Map<string, circleData>;
    initialCamera: Camera;
    onMapReady: ((setMapReady: React.Dispatch<React.SetStateAction<boolean>>) => void) | undefined;
    onPanDrag: (
        setIsMapDragged: React.Dispatch<React.SetStateAction<boolean>>,
        MapId: string,
        dispatch: AppDispatchType,
        event: MapPressEvent,
    ) => void;
    setIsMapDragged: React.Dispatch<React.SetStateAction<boolean>>;
    // setCurrentRegion: (region: { region: Region; isGesture: boolean }) => void;
    setCurrentRegion: React.RefObject<{
        region: Region;
        isGesture: boolean;
    }>;
    centerView: React.ReactNode;
    mapRef: React.RefObject<MapView | null>;
    hidden: boolean | undefined;
    // CRITICAL FIX: Use markersRef directly instead of setMarkers to avoid re-render cascades
    markersRef: React.RefObject<Map<string, markerData>>;
    updateMarkerRef: (
        markersRef: React.RefObject<Map<string, markerData>> | null,
        ref: AnimatedMapPinRef | null,
        id: string,
    ) => void;
    updatePolylineRef: (
        setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>,
        ref: MapPolyline | null,
        polylineId: string,
    ) => void;
    currentLocationMarkerVisibility: boolean;
    mapPadding: EdgePadding;
    animatedCircle: React.ReactNode;
    setMapReady: React.Dispatch<React.SetStateAction<boolean>>;
    setPolylines: React.Dispatch<React.SetStateAction<Map<string, polylineData>>>;
    MapId: string;
    onPress: () => void;
    onRegionChangeComplete: ((region: Region) => void) | undefined;
};

const routeColor = { color: '#c2d3e6' };

const roadFill: MapStyleElement = {
    elementType: 'geometry.fill',
    featureType: 'road',
    stylers: [routeColor],
};

const roadStroke: MapStyleElement = {
    elementType: 'geometry.stroke',
    featureType: 'road',
    stylers: [routeColor],
};

const customMapTheme: MapStyleElement[] = [roadFill, roadStroke];

const MapViewComponent = React.memo(
    ({
        polylines,
        markers,
        polygons,
        circles,
        initialCamera,
        setCurrentRegion,
        onMapReady,
        onPanDrag,
        setIsMapDragged,
        onPress,
        centerView,
        mapRef,
        hidden = false,
        markersRef,
        updateMarkerRef,
        updatePolylineRef,
        currentLocationMarkerVisibility,
        mapPadding,
        animatedCircle,
        setMapReady,
        setPolylines,
        MapId,
        onRegionChangeComplete: onRegionChangeCompleteProp,
    }: Props) => {
        // DEBUG: Track MapViewComponent renders
        if (MARKER_FLICKER_DEBUG) {
            mapViewRenderCount++;
            console.info('[MARKER_FLICKER][MapViewComponent] RENDER #' + mapViewRenderCount);
        }
        debugLog('Component render');
        const dispatch = useAppDispatch();
        const bottomSheetStage = useAppSelector(selectBottomSheetStage);
        const appConfig = useAppSelector(selectAppConfig);
        const [isMapLoaded, setIsMapLoaded] = useState(false);
        const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

        // useEffect(() => {
        //   Object.entries(markers).forEach(([key, value]) => {
        //     const marker = value as markerData;
        //     if (key === 'routeStart') {
        //       const ref = marker?.ref;
        //       if (ref) {
        //         ref.redrawCallout();
        //       }
        //     }
        //   });
        // }, [distanceMoved, pickupDistance]);

        /* eslint-disable myCustomPlugin/enforce-optional-params */
        const onRegionChangeComplete = useCallback(
            (region: Region, details: { isGesture?: boolean }) => {
                setCurrentRegion.current = { region, isGesture: details.isGesture ?? false };
                dispatch(setMapIsMoved({ id: MapId, payload: false }));
                dispatch(
                    setCurrentRegionId({
                        id: MapId,
                        payload: { region, isGesture: details.isGesture ?? false },
                    }),
                );
                setIsMapDragged(false);
                onRegionChangeCompleteProp?.(region);
            },
            [onRegionChangeCompleteProp],
        );

        const getCalloutAnchor = useCallback((key: string, rotation: number): { x: number; y: number } => {
            if (key === 'routeStart') {
                if (rotation > 300) return { x: 0.5, y: -0.3 };
                if (rotation > 280) return { x: 0.9, y: 0.3 };
                if (rotation > 200) return { x: 1.0, y: 1.0 };
                if (rotation > 180) return { x: 1.0, y: 0.5 };
                if (rotation > 140) return { x: 0.7, y: -0.8 };
                if (rotation > 100) return { x: 1.8, y: -0.1 };
                if (rotation > 50) return { x: -0.1, y: 0.5 };
                if (rotation >= 35) return { x: -0.1, y: 0.2 };
            }
            return { x: 0.5, y: 0.0 };
        }, []);

        const markersView = useMemo((): (React.JSX.Element | null)[] => {
            // DEBUG: Track how often markersView is recomputed
            if (MARKER_FLICKER_DEBUG) {
                markersViewComputeCount++;
                console.info(
                    '[MARKER_FLICKER][MapView] markersView RECOMPUTED #' + markersViewComputeCount,
                    'markers count:',
                    markers.size,
                );
            }
            return Array.from(markers).map(([key, value]) => {
                if (!value.visible) return null;
                const calloutAnchor = getCalloutAnchor(key, value.rotation);
                debugLog('markersView', value.markerKey);
                return (
                    <AnimatedMapPin
                        key={key}
                        onClick={value.onClick}
                        showEditIcon={value.showEditIcon}
                        markerKey={value.markerKey}
                        opacity={value.opacity}
                        coordinate={value.coordinate}
                        pinIconType={value.pinIconType}
                        description={value.description}
                        anchor={value.anchor}
                        rotation={value.rotation}
                        style={value.style}
                        zIndex={value.zIndex || 0}
                        calloutAnchor={calloutAnchor}
                        calloutText={value.title}
                        vehicleVariant={value.vehicleVariant}
                        children={value.children}
                        multimodalVariant={value.multimodalVariant}
                        ref={ref => {
                            // DEBUG: Track ref callback calls
                            if (MARKER_FLICKER_DEBUG && (key === 'routeStart' || key === 'routeStart_pin')) {
                                refCallbackCount++;
                                console.info(
                                    '[MARKER_FLICKER][MapView] ref callback #' + refCallbackCount,
                                    'key:',
                                    key,
                                    'hasRef:',
                                    !!ref,
                                );
                            }
                            // CRITICAL FIX: Pass markersRef directly to avoid setMarkers re-render cascade
                            updateMarkerRef(markersRef, ref, key);
                        }}
                        calloutOnPress={undefined}
                        markerOnPress={value.markerOnPress}
                        showCallout={value.showCallout}
                        busStopEtaCallout={value.busStopEtaCallout}
                        displayCalloutOnPress={value.displayCalloutOnPress}
                        primaryEtaMinutes={value.primaryEtaMinutes}
                        secondaryEtaMinutes={value.secondaryEtaMinutes}
                    />
                );
            });
        }, [markers, updateMarkerRef]);

        const polylinesView = useMemo(
            () =>
                Array.from(polylines).map(([key, value]) =>
                    Platform.OS === 'ios' || value.visible ? (
                        <Polyline
                            key={key}
                            coordinates={value.coordinates}
                            strokeColor={value.strokeColor}
                            strokeColors={value.strokeColors.length === 0 ? undefined : value.strokeColors}
                            strokeWidth={value.strokeWidth}
                            lineDashPattern={value.lineDashPattern}
                            lineCap="round"
                            ref={ref => updatePolylineRef(setPolylines, ref, key)}
                        />
                    ) : null,
                ),
            [polylines, updatePolylineRef],
        );

        const polygonsView = useMemo(
            () =>
                Array.from(polygons).map(([key, value]) => (
                    <Polygon
                        key={key}
                        strokeWidth={value.strokeWidth}
                        strokeColor={value.strokeColor}
                        fillColor={value.fillColor}
                        coordinates={value.coordinates}
                    />
                )),
            [polygons],
        );

        const circlesView = useMemo(
            () =>
                Array.from(circles).map(([key, value]) => (
                    <Circle
                        key={key}
                        center={value.center}
                        radius={value.radius}
                        strokeWidth={value.strokeWidth}
                        strokeColor={value.strokeColor}
                        fillColor={value.fillColor}
                    />
                )),
            [circles],
        );

        const handleNativeEvent = useCallback(
            (event: MarkerPressEvent) => {
                const action = event.nativeEvent.action;
                const id = event.nativeEvent.id;
                const actionType = event.nativeEvent.actionType;
                if (action === 'marker-press') {
                    switch (actionType) {
                        case 'navigateToBusTracking': {
                            navigateToBusTracking(navigation, id);
                            break;
                        }
                        default:
                            break;
                    }
                }
            },
            [navigation],
        );

        return (
            <>
                <View style={[styles.container, hidden && styles.hidden]}>
                    <MapView
                        userInterfaceStyle="light"
                        accessible={false}
                        moveOnMarkerPress={false}
                        accessibilityElementsHidden={true}
                        importantForAccessibility={'no-hide-descendants'}
                        showsUserLocation={currentLocationMarkerVisibility} /// have to {currentLocationMarkerVisibility} change this
                        style={StyleSheet.absoluteFillObject}
                        initialCamera={initialCamera}
                        customMapStyle={customMapTheme}
                        googleRenderer={Platform.OS === 'android' ? 'LATEST' : 'LATEST'}
                        onRegionChangeComplete={onRegionChangeComplete}
                        zoomTapEnabled
                        onPress={onPress}
                        onMapReady={() => {
                            return onMapReady?.(setMapReady);
                        }}
                        onMapLoaded={() => setIsMapLoaded(true)}
                        // onPanDrag={_event => {
                        //     return onPanDrag?.(setIsMapDragged,MapId );
                        //   }}
                        onPanDrag={event => onPanDrag(setIsMapDragged, MapId, dispatch, event)}
                        provider="google"
                        ref={ref => {
                            mapRef.current = ref;
                        }}
                        showsMyLocationButton={false}
                        showsCompass={false}
                        showsScale={false}
                        showsIndoors={false}
                        showsIndoorLevelPicker={false}
                        onMarkerPress={event => handleNativeEvent(event)}
                        mapPadding={mapPadding}
                        rotateEnabled={false}>
                        {currentLocationMarkerVisibility &&
                            appConfig.appType === 'ride-hailing' &&
                            bottomSheetStage === BottomSheetStage.Home &&
                            navigationRef.getCurrentRoute()?.name.includes('homeScreen') && (
                                <CustomCurrentLocationMarker size={undefined} />
                            )}

                        {isMapLoaded && (
                            <>
                                {markersView}
                                {polylinesView}
                                {polygonsView}
                                {circlesView}
                                {animatedCircle}
                            </>
                        )}
                    </MapView>
                    <View style={[styles.centerMarkerView, { paddingBottom: mapPadding.bottom }]} pointerEvents="none">
                        {centerView}
                    </View>
                </View>
            </>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        zIndex: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF00',
    },
    hidden: {
        display: 'none',
    },
    centerMarkerView: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
});

export default MapViewComponent;
