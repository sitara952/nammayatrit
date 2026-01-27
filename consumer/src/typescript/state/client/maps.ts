/* eslint-disable functional/immutable-data */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { cloneDeep, isNull } from 'lodash';
import { Region } from 'react-native-maps';
import { nearbyDriverRes } from '@/typescript/state/server/nearbyDriversApi.ts';

export interface NearbyDrivers {
    geohash: string;
    nearbyDrivers: nearbyDriverRes | undefined;
}

interface MapState {
    mapIsMoved: boolean;
    zoomLevel: number;
    centerCoordinates: { lat: number; lng: number } | null;
    currentRegion: {
        region: Region;
        isGesture: boolean | undefined;
    };
    nearbyDrivers: NearbyDrivers;
    nearbyMarkerLocation: NearbyMarkerLocation;
    showNearbyLiveTrack: boolean;
}

export interface NearbyMarkerLocation {
    lat: number | undefined;
    lon: number | undefined;
}

type MapDict = {
    [mapId: string]: MapState;
};

export const emptyNearbyDriversRes: nearbyDriverRes = {
    buckets: [],
    serviceTierTypeToVehicleVariant: {},
    variantLevelDriverCount: {},
    vehicleDataBuckets: [],
};

export const emtpyNeabyDrivers: NearbyDrivers = {
    geohash: '',
    nearbyDrivers: emptyNearbyDriversRes,
};

const emptyMap: MapState = {
    mapIsMoved: false,
    zoomLevel: 1,
    centerCoordinates: null,
    currentRegion: {
        region: { latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0 },
        isGesture: false,
    },
    nearbyDrivers: emtpyNeabyDrivers,
    nearbyMarkerLocation: {
        lat: undefined,
        lon: undefined,
    },
    showNearbyLiveTrack: false,
};

const safeSet = (stateObj: MapDict, id: string) => {
    stateObj = stateObj || {};
    stateObj[id] = stateObj[id] || cloneDeep(emptyMap);
    return stateObj[id];
};

export type mapEntity = {
    id: string;
    payload: boolean;
};
export type mapCurrentRegion = {
    region: Region;
    isGesture: boolean | undefined;
};

type MapPayload<T> = {
    id: string | null;
    payload: T;
};
type MapPayloadAction<T> = PayloadAction<MapPayload<T>>;

const REDUCER_NAME = 'map';

const INITIAL_STATE: MapDict = {};

const mapSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setMapIsMoved: (state, action: MapPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).mapIsMoved = action.payload.payload;
            return undefined;
        },
        setCurrentRegionId: (state, action: MapPayloadAction<mapCurrentRegion>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).currentRegion = action.payload.payload;
            return undefined;
        },
        setZoomLevel: (state, action: PayloadAction<{ id: string; payload: number }>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).zoomLevel = action.payload.payload;
            return undefined;
        },
        setCenterCoordinates: (
            state,
            action: PayloadAction<{
                id: string;
                payload: { lat: number; lng: number } | null;
            }>,
        ) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).centerCoordinates = action.payload.payload;
            return undefined;
        },
        setNearbyDrivers: (
            state,
            action: PayloadAction<{ id: string; geohash: string; nearbyDrivers: nearbyDriverRes | undefined }>,
        ) => {
            if (isNull(action.payload)) {
                return state;
            }
            safeSet(state, action.payload.id).nearbyDrivers.nearbyDrivers = action.payload.nearbyDrivers;
            safeSet(state, action.payload.id).nearbyDrivers.geohash = action.payload.geohash;
            return undefined;
        },
        setNearbyMarkerLocation: (state, action: PayloadAction<{ id: string; payload: NearbyMarkerLocation }>) => {
            if (isNull(action.payload)) {
                return state;
            }
            safeSet(state, action.payload.id).nearbyMarkerLocation = action.payload.payload;
            return undefined;
        },
        setShowNearbyLiveTrack: (state, action: PayloadAction<{ id: string; payload: boolean }>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).showNearbyLiveTrack = action.payload.payload;
            return undefined;
        },
    },
});

export const {
    setMapIsMoved,
    setZoomLevel,
    setCenterCoordinates,
    setCurrentRegionId,
    setNearbyDrivers,
    setNearbyMarkerLocation,
    setShowNearbyLiveTrack,
} = mapSlice.actions;

export default mapSlice;
// Selectors
const selectMapWithId = (state: RootState, mapId: string | null): MapState => {
    const mapDict = state.map;
    if (mapId && mapDict && mapDict[mapId]) {
        //eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        return mapDict[mapId] as MapState;
    }
    return emptyMap;
};

export const selectMapIsMoved = (state: RootState, mapId: string | null) => selectMapWithId(state, mapId).mapIsMoved;
export const selectZoomLevel = (state: RootState, mapId: string | null) => selectMapWithId(state, mapId).zoomLevel;
export const selectCenterCoordinates = (state: RootState, mapId: string | null) =>
    selectMapWithId(state, mapId).centerCoordinates;
export const selectCurrentRegion = (state: RootState, mapId: string | null) =>
    selectMapWithId(state, mapId).currentRegion;
export const selectNearbyDrivers = (state: RootState, mapId: string | null) =>
    selectMapWithId(state, mapId).nearbyDrivers;
export const selectNearbyMarkerLocation = (state: RootState, mapId: string | null) =>
    selectMapWithId(state, mapId).nearbyMarkerLocation;
export const selectShowNearbyLiveTrack = (state: RootState, mapId: string | null) =>
    selectMapWithId(state, mapId).showNearbyLiveTrack;
