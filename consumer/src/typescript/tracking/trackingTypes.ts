import React from 'react';
import { LatLng } from 'react-native-maps';
import { IconType } from '../components/AnimatedMapPin';
import { MapRef } from '../Maps/MapComponent';

export interface PolylineStyle {
    strokeColor?: string;
    strokeWidth?: number;
    lineDashPattern?: number[];
}

export interface MarkerStyle {
    iconType: IconType;
    anchor?: { x: number; y: number };
    rotation?: number;
    multimodalVariant?: string;
    blur?: boolean;
}

export interface PathConfig {
    id: string;
    coordinates: LatLng[];
    style: PolylineStyle;
    highlightUntil?: LatLng;
}

export interface TrackedEntity {
    id: string;
    pathId: string;
    captionText: string;
    location: LatLng;
    style: MarkerStyle;
    onClick?: (id: string) => void;
    showCallout: boolean | undefined;
    busStopEtaCallout:
        | ((props: {
              primaryEtaMinutes: number | undefined;
              secondaryEtaMinutes: number | undefined;
          }) => React.ReactNode)
        | undefined;
    displayCalloutOnPress: (() => void) | undefined;
    primaryEtaMinutes: number | undefined;
    secondaryEtaMinutes: number | undefined;
}

export interface StaticMarker {
    id: string;
    location: LatLng;
    style: MarkerStyle;
    title?: string;
    onClick?: () => void;
    stopName: string | undefined;
    stopCode: string | undefined;
    showCallout: boolean | undefined;
    busStopEtaCallout:
        | ((props: {
              primaryEtaMinutes: number | undefined;
              secondaryEtaMinutes: number | undefined;
          }) => React.ReactNode)
        | undefined;
    displayCalloutOnPress: (() => void) | undefined;
    primaryEtaMinutes: number | undefined;
    secondaryEtaMinutes: number | undefined;
}

export interface AutoFocusConfig {
    entityIds?: string[];
    pathIds?: string[];
    coordinates?: LatLng[];
}

export interface TrackFromUserToConfig {
    latitude: number;
    longitude: number;
    updateInterval?: number; // in seconds, default 5
    routingMode?: 'api' | 'straight-line'; // default 'api'\
    enableUpdate?: boolean; // default true
}

export interface UseLiveTrackingProps {
    paths?: PathConfig[];
    trackedEntities?: TrackedEntity[];
    staticMarkers?: StaticMarker[];
    animationDuration?: number;
    autoFocus?: AutoFocusConfig;
    isMapDragged?: boolean;
    trackFromUserTo?:
        | {
              latitude: number;
              longitude: number;
          }
        | TrackFromUserToConfig;
    trackingType?: 'live' | 'simulate-bus';
    performAutoFocusOnlyOnInit: boolean;
}

export interface UseLiveTrackingReturn {
    performAutoFocus: (forceUpdate?: boolean) => void;
    setIsAutoFocusPaused: (isAutoFocusPaused: boolean) => void;
    mapRef: React.RefObject<MapRef | null>;
    userLocationMarker: StaticMarker | null;
}
