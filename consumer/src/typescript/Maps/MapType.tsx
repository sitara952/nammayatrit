import { Camera, Region, LatLng, MapPolyline, Point } from 'react-native-maps';
import { AnimatedMapPinProps, AnimatedMapPinRef, IconType } from '../components/AnimatedMapPin';
import { StyleProp, ViewStyle } from 'react-native';
import {
    MultimodalTravelMode_multimodalTravelMode,
    VehicleVariant_vehicleVariant,
} from '@/readOnly/api/types/Enums.gen';
import { latLng } from '@/helpers/externalModules/GMap/ReactMap.gen';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';

export type polylineData = {
    id: string;
    coordinates: LatLng[];
    visible: boolean;
    strokeColor: string;
    strokeColors: string[];
    strokeWidth: number;
    lineDashPattern: number[] | undefined;
    ref: MapPolyline | null;
};

export type markerData = AnimatedMapPinProps & {
    id: string;
    coordinate: LatLng;
    children: React.ReactNode | null;
    zIndex: number | undefined;
    anchor: Point;
    rotation: number;
    rotationEnabled: boolean;
    visible: boolean;
    title: string;
    description: string;
    style: StyleProp<ViewStyle>;
    ref: AnimatedMapPinRef | undefined;
};

export type polygonData = {
    id: string;
    coordinates: LatLng[];
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    visible: boolean;
    lineDashPattern: number[];
    onPress: () => void;
    tappable: boolean;
};

export type zoneData = {
    id: string;
    polygonId: string;
    markersIds: string[];
};

export type routeData = {
    id: string;
    markersIds: string[];
    polylineId: string;
};

export type MultiRouteData = {
    id: string;
    markersIds: string[];
    polylineId: string[];
};

export type mmEstimateRouteType = {
    legMode: MultimodalTravelMode_multimodalTravelMode | undefined;
    coordinates: latLng[];
    marker: string[] | undefined;
    color: string | undefined;
    journeyLegOrder: number;
    stops: fRFSStationAPI[] | undefined;
    lastStop: fRFSStationAPI | undefined;
    lineDashPattern: number[] | undefined;
    fullStopsList: fRFSStationAPI[] | undefined;
    wayPoints: latLng[] | undefined;
};

export type circleData = {
    id: string;
    center: LatLng;
    radius: number;
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    visible: boolean;
};

export interface EdgePadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type CurrentRegion = {
    region: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    isGesture: boolean;
};

export type NativeProcessedMarkers = {
    id: string;
    latitude: number;
    longitude: number;
    rotation: number | undefined;
    zIndex: number;
    vehicleVariant: string | undefined;
    clusterCount: number;
    isCluster: boolean;
    animationDuration: number;
    shouldAnimate: boolean;
    size: number;
    title: string;
    rotationEnabled: boolean;
    routeCode: string | undefined;
    action: string | undefined;
};

export interface MapContextInterface {
    addPolyline: (params: {
        visible: boolean | undefined;
        coordinates: LatLng[];
        strokeColor: string | undefined;
        strokeColors: string[] | undefined;
        id: string;
        strokeWidth: number | undefined;
        extendPath: boolean | undefined;
        lineDashPattern: number[] | undefined;
    }) => Promise<void>;
    removeRoute: (routeId: string) => void;
    clearRoute: () => void;
    addMarker: (params: {
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
    getMarkers: () => Map<string, markerData>;
    hasMarker: (routeId: string, markerId: string) => boolean;
    getMarkerArray: (routeId: string) => string[];
    hasRoute: (routeId: string) => boolean;
    hasPolyline: (routeId: string, polyline: polylineData) => boolean;
    setCenterView: (render: (children: React.ReactElement) => React.ReactElement) => void;
    mapReady: boolean;
    changeAutoAnimationToCurrentLocation: (state: boolean) => void;
    addPolygon: (params: {
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
    addCircle: (params: {
        id: string;
        center: LatLng;
        radius: number;
        strokeWidth: number | undefined;
        strokeColor: string | undefined;
        fillColor: string | undefined;
        visible: boolean | undefined;
    }) => void;
    currentRegion: CurrentRegion;
    setCurrentLocationMarkerVisibility: React.Dispatch<React.SetStateAction<boolean>>;
    moveCameraToCurrentLocation: () => void;
    animateCamera: (params: {
        lat: number | undefined;
        lon: number | undefined;
        zoom: number;
        duration: number | undefined;
    }) => Promise<void>;
    getCamera: () => Promise<Camera | null>;
    fitToCoordinates: (params: { coordinates: LatLng[]; duration: number | undefined }) => void;
    fitToCoordinatesSerialized: (params: { coordinates: LatLng[]; duration: number | undefined }) => void;
    fitToMapElements: (params: { duration: number | undefined }) => void;
    buildRoute: (routeId: string, polylineId: string, markersIds: string[]) => void;
    multiModalBuildRoute: (routeId: string, polylineId: string[], markersIds: string[]) => void;
    multiModalRemoveRoute: (routeId: string) => void;
    updateRoute: (params: { routeId: string; coordinate: LatLng }) => Promise<boolean>;
    rotateMarker: (params: {
        markerId: string;
        startLatLng: LatLng;
        endLatLng: LatLng;
        duration: number | undefined;
    }) => Promise<void>;
    moveMarker: (params: {
        markerId: string;
        newPosition: LatLng;
        animation: boolean;
        animationDuration: number | undefined;
        rotation: number | undefined;
        rotationDuration: number | undefined;
    }) => Promise<void>;
    updatePolyline: (params: {
        polylineId: string;
        newCoordinates: LatLng[];
        strokeColor: string | undefined;
        strokeWidth: number | undefined;
    }) => void;
    cancelMarkerAnimation: (markerId: string) => void;
    updateCalloutText: (markerId: string, text: string) => void;
    updateMarkerEditOption: (markerId: string, showEditIcon: boolean) => void;
    removeMarker: (markerId: string) => void;
    removePolygon: (polygonId: string) => void;
    removeCircle: (circleId: string) => void;
    staticMapPadding: EdgePadding;
    addStaticMapPadding: (params: Partial<EdgePadding>) => void;
    addMapPadding: (params: Partial<EdgePadding>) => void;
    addZone: (params: { zoneId: string; polygonId: string; markersIds: string[] }) => void;
    removeZone: (zoneId: string) => void;
    removeAllZone: () => void;
    isMapDragged: boolean;
    hidePolyline: (polylineId: string) => void;
}

export interface MapUtilsInterface extends MapContextInterface {
    onMapReady: (event?: object) => void;
    onPanDrag: () => void;
    updatePolylineRef: (polylineId: string, ref: MapPolyline | null) => void;
    updateMarkerRef: (markerId: string, ref: AnimatedMapPinRef | null) => void;
    updateMarkerEditOption: (markerId: string, showEditIcon: boolean) => void;
    polylines: Map<string, polylineData>;
    markers: Map<string, markerData>;
    polygons: Map<string, polygonData>;
    centerView: React.ReactNode;
    currentLocationMarkerVisibility: boolean;
    initialCamera: Camera;
    setCurrentPosition: (position: LatLng) => void;
    setCurrentRegion: (region: { region: Region; isGesture: boolean }) => void;
    setIsMapDragged: React.Dispatch<React.SetStateAction<boolean>>;
    circles: Map<string, circleData>;
}
