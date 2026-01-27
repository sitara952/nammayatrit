/* eslint-disable functional/immutable-data */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
    publicTransportData,
    transportRoute,
    transportStation,
} from '../../../../src/readOnly/api/types/PublicTransportData.gen';
import { RootState } from '../../../../src/typescript/state/store';
import { cloneDeep } from 'lodash';
import { PURGE } from 'redux-persist';
import { sortStationsBySequence } from './utils';
import { StationSection } from '../MetroSubwayBooking/components/DestinationPickerWithSections';
import { legServiceTier } from '@/readOnly/api/types/LegServiceTier.gen';

const safeSet = (stateObj: BusOtpDict, otp: string) => {
    stateObj = stateObj || {};
    stateObj[otp] = stateObj[otp] || cloneDeep(emptyBusOtpData);

    return stateObj[otp];
};

const updateStopsLists = (busOtpState: BusOtpData, enableSourceStopsSlicing: boolean) => {
    if (busOtpState.nearestStation) {
        const nearestStationIndex = busOtpState.sortedStations.findIndex(
            station => station.code === busOtpState.nearestStation?.code,
        );
        if (nearestStationIndex !== -1) {
            const isIndexValid = nearestStationIndex < busOtpState.sortedStations.length - 2;
            busOtpState.destinationStopsList = busOtpState.sortedStations.slice(
                isIndexValid ? nearestStationIndex + 1 : nearestStationIndex,
            );

            // Apply configurable slicing for sourceStopsList based on feature flag
            if (enableSourceStopsSlicing) {
                busOtpState.sourceStopsList = busOtpState.sortedStations.slice(
                    0,
                    isIndexValid ? nearestStationIndex + 2 : nearestStationIndex + 1,
                );
            } else {
                // When feature flag is false, use all sortedStations without slicing
                busOtpState.sourceStopsList = busOtpState.sortedStations;
            }
        }
    }
};

export type BusOtpData = {
    data: publicTransportData | null;
    sortedStations: transportStation[];
    sourceStopsList: transportStation[];
    destinationStopsList: transportStation[];
    sourceStation: transportStation | undefined;
    destinationStation: transportStation | undefined;
    detectedRoute: string | null;
    detectedRouteCode: string | null;
    detectedRouteObject: transportRoute | null;
    nearestStation: transportStation | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
    currentRouteIndex: number;
    showRouteSelectionModal: boolean;
    enableSourceStopsSlicing: boolean;
    filteredRouteSections: StationSection[];
    serviceTierInfo: legServiceTier | null;
    eligiblePassIds: string[];
    isTouristBus: boolean;
};

const emptyBusOtpData: BusOtpData = {
    data: null,
    sortedStations: [],
    sourceStopsList: [],
    destinationStopsList: [],
    sourceStation: undefined,
    destinationStation: undefined,
    detectedRoute: null,
    detectedRouteCode: null,
    detectedRouteObject: null,
    nearestStation: null,
    isLoading: false,
    error: null,
    lastFetched: null,
    currentRouteIndex: 0,
    showRouteSelectionModal: false,
    enableSourceStopsSlicing: false,
    filteredRouteSections: [],
    serviceTierInfo: null,
    eligiblePassIds: [],
    isTouristBus: false,
};

type BusOtpDict = {
    [otp: string]: BusOtpData;
};

type BusOtpPayload<T> = {
    otp: string;
    payload: T;
};

type BusOtpPayloadAction<T> = PayloadAction<BusOtpPayload<T>>;

const REDUCER_NAME: string = 'busOtp';

const INITIAL_STATE: BusOtpDict = {};

export const busOtpSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setBusOtpData: (state, action: BusOtpPayloadAction<publicTransportData>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.data = payload;
            busOtpState.isLoading = false;
            busOtpState.error = null;
            busOtpState.lastFetched = Date.now();
            return undefined;
        },
        setBusOtpLoading: (state, action: BusOtpPayloadAction<boolean>) => {
            const { otp, payload } = action.payload;
            safeSet(state, otp).isLoading = payload;
            return undefined;
        },
        setBusOtpError: (state, action: BusOtpPayloadAction<string | null>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.error = payload;
            busOtpState.isLoading = false;
            return undefined;
        },
        setBusRouteData: (
            state,
            action: BusOtpPayloadAction<{
                sortedStations: transportStation[];
                detectedRoute: string | null;
                nearestStation: transportStation | null;
                detectedRouteCode: string | null;
                detectedRouteObject: transportRoute | null;
                enableSourceStopsSlicing: boolean;
                filteredRouteSections: StationSection[];
                eligiblePassIds: string[] | undefined;
            }>,
        ) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.detectedRouteObject = payload.detectedRouteObject;
            busOtpState.sortedStations = payload.sortedStations;
            busOtpState.detectedRoute = payload.detectedRoute;
            busOtpState.nearestStation = payload.nearestStation;
            busOtpState.detectedRouteCode = payload.detectedRouteCode;
            busOtpState.enableSourceStopsSlicing = payload.enableSourceStopsSlicing;
            busOtpState.filteredRouteSections = payload.filteredRouteSections;
            busOtpState.eligiblePassIds = payload.eligiblePassIds ?? [];
            busOtpState.isTouristBus = (payload.eligiblePassIds ?? []).length > 0;
            updateStopsLists(busOtpState, payload.enableSourceStopsSlicing); // Default behavior - will be configured by feature flag
            return undefined;
        },
        updateNearestStation: (
            state,
            action: BusOtpPayloadAction<{ transportStation: transportStation; enableSourceStopsSlicing: boolean }>,
        ) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.enableSourceStopsSlicing = payload.enableSourceStopsSlicing;
            busOtpState.nearestStation = payload.transportStation;
            updateStopsLists(busOtpState, payload.enableSourceStopsSlicing); // Default behavior - will be configured by feature flag
            return undefined;
        },
        updateSourceStation: (state, action: BusOtpPayloadAction<transportStation | undefined>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.sourceStation = payload;
            return undefined;
        },
        updateFilteredRouteSections: (state, action: BusOtpPayloadAction<StationSection[]>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.filteredRouteSections = payload;
            return undefined;
        },
        updateDestinationStation: (state, action: BusOtpPayloadAction<transportStation | undefined>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.destinationStation = payload;
            return undefined;
        },
        clearBusOtpData: (state, action: PayloadAction<string>) => {
            const otp = action.payload;
            if (state[otp]) {
                delete state[otp];
            }
            return undefined;
        },
        resetState: (_state, _action: PayloadAction<{}>) => {
            return INITIAL_STATE;
        },
        setCurrentRouteIndex: (state, action: BusOtpPayloadAction<number>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.currentRouteIndex = payload;
            return undefined;
        },
        switchRouteIndex: (state, action: PayloadAction<string>) => {
            const otp = action.payload;
            const busOtpState = safeSet(state, otp);

            if (!busOtpState.data) {
                console.warn('No data available for route switching');
                return undefined;
            }

            const { stations, routeStopMappings, routes } = busOtpState.data;
            const totalRoutes = routes?.length ?? 0;
            console.info('totalRoutes', totalRoutes);

            const currentIndex = busOtpState.currentRouteIndex;

            const newIndex = (() => {
                if (totalRoutes <= 2) {
                    return currentIndex === 0 ? 1 : 0;
                } else {
                    if (currentIndex === 0) {
                        return 1;
                    } else if (currentIndex >= totalRoutes - 1) {
                        return 1;
                    } else {
                        return currentIndex + 1;
                    }
                }
            })();

            busOtpState.currentRouteIndex = newIndex;

            const selectedRouteIndex = Math.min(newIndex, totalRoutes - 1);
            const selectedRoute = routes && routes.length > 0 ? routes[selectedRouteIndex] : null;
            const detectedRoute = selectedRoute?.shortName ?? null;
            const detectedRouteCode = selectedRoute?.code ?? null;

            const sortedStations = sortStationsBySequence(stations, routeStopMappings, detectedRouteCode ?? null);

            busOtpState.sortedStations = sortedStations;
            busOtpState.detectedRoute = detectedRoute;
            busOtpState.detectedRouteCode = detectedRouteCode;
            busOtpState.detectedRouteObject = selectedRoute ?? null;

            updateStopsLists(busOtpState, busOtpState.enableSourceStopsSlicing); // Default behavior - will be configured by feature flag

            return undefined;
        },
        setShowRouteSelectionModal: (state, action: BusOtpPayloadAction<boolean>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.showRouteSelectionModal = payload;
            return undefined;
        },
        setSearchedServiceTier: (state, action: BusOtpPayloadAction<{ serviceTierInfo: legServiceTier }>) => {
            const { otp, payload } = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.serviceTierInfo = payload.serviceTierInfo;
            return undefined;
        },
        selectRouteByIndex: (state, action: BusOtpPayloadAction<number>) => {
            const { otp, payload: selectedIndex } = action.payload;
            const busOtpState = safeSet(state, otp);

            if (!busOtpState.data) {
                console.warn('No data available for route selection');
                return undefined;
            }

            const { stations, routeStopMappings, routes } = busOtpState.data;
            const totalRoutes = routes?.length ?? 0;

            if (selectedIndex < 0 || selectedIndex >= totalRoutes) {
                console.warn('Invalid route index selected:', selectedIndex);
                return undefined;
            }

            busOtpState.currentRouteIndex = selectedIndex;

            const selectedRoute = routes?.[selectedIndex] ?? null;
            const detectedRoute = selectedRoute?.shortName ?? null;
            const detectedRouteCode = selectedRoute?.code ?? null;

            const sortedStations = sortStationsBySequence(stations, routeStopMappings, detectedRouteCode ?? null);

            busOtpState.sortedStations = sortedStations;
            busOtpState.detectedRoute = detectedRoute;
            busOtpState.detectedRouteCode = detectedRouteCode;

            updateStopsLists(busOtpState, busOtpState.enableSourceStopsSlicing); // Default behavior - will be configured by feature flag

            return undefined;
        },
        clearTouristBusPassData: (state, action: PayloadAction<string>) => {
            const otp = action.payload;
            const busOtpState = safeSet(state, otp);
            busOtpState.eligiblePassIds = [];
            busOtpState.isTouristBus = false;
            return undefined;
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, _state => {
            return INITIAL_STATE;
        });
    },
});

const selectBusOtp = (state: RootState, otp: string) => {
    const busOtpDict = state.busOtp;
    if (otp && busOtpDict && busOtpDict[otp]) {
        return busOtpDict[otp] || emptyBusOtpData;
    }
    return emptyBusOtpData;
};

export const selectBusOtpData = (state: RootState, otp: string) => selectBusOtp(state, otp).data;
export const selectBusOtpLoading = (state: RootState, otp: string) => selectBusOtp(state, otp).isLoading;
export const selectBusOtpError = (state: RootState, otp: string) => selectBusOtp(state, otp).error;
export const selectBusOtpLastFetched = (state: RootState, otp: string) => selectBusOtp(state, otp).lastFetched;
export const selectSortedStations = (state: RootState, otp: string) => selectBusOtp(state, otp).sortedStations;
export const selectSourceStopsList = (state: RootState, otp: string) => selectBusOtp(state, otp).sourceStopsList;
export const selectDestinationStopsList = (state: RootState, otp: string) =>
    selectBusOtp(state, otp).destinationStopsList;
export const selectDetectedRoute = (state: RootState, otp: string) => selectBusOtp(state, otp).detectedRoute;
export const selectDetectedRouteCode = (state: RootState, otp: string) => selectBusOtp(state, otp).detectedRouteCode;
export const selectNearestStation = (state: RootState, otp: string) => selectBusOtp(state, otp).nearestStation;
export const selectSourceStation = (state: RootState, otp: string) => selectBusOtp(state, otp).sourceStation;
export const selectDestinationStation = (state: RootState, otp: string) => selectBusOtp(state, otp).destinationStation;
export const selectCurrentRouteIndex = (state: RootState, otp: string) => selectBusOtp(state, otp).currentRouteIndex;
export const selectDetectedRouteObject = (state: RootState, otp: string) =>
    selectBusOtp(state, otp).detectedRouteObject;
export const selectTotalRoutes = (state: RootState, otp: string) => selectBusOtp(state, otp).data?.routes?.length ?? 0;
export const selectShowRouteSelectionModal = (state: RootState, otp: string) =>
    selectBusOtp(state, otp).showRouteSelectionModal;
export const selectAvailableRoutes = (state: RootState, otp: string) => selectBusOtp(state, otp).data?.routes ?? [];
export const selectRouteStopMappings = (state: RootState, otp: string) =>
    selectBusOtp(state, otp).data?.routeStopMappings ?? [];
export const selectAllStations = (state: RootState, otp: string) => selectBusOtp(state, otp).data?.stations ?? [];
export const selectFilteredRouteSections = (state: RootState, otp: string) =>
    selectBusOtp(state, otp).filteredRouteSections;
export const selectServiceTierInfo = (state: RootState, otp: string) => selectBusOtp(state, otp).serviceTierInfo;
export const selectEligiblePassIds = (state: RootState, otp: string) => selectBusOtp(state, otp).eligiblePassIds;
export const selectIsTouristBus = (state: RootState, otp: string) => selectBusOtp(state, otp).isTouristBus;

export const {
    setBusOtpData,
    setBusOtpLoading,
    setBusOtpError,
    setBusRouteData,
    clearBusOtpData,
    updateNearestStation,
    updateSourceStation,
    updateDestinationStation,
    resetState,
    setCurrentRouteIndex,
    switchRouteIndex,
    setShowRouteSelectionModal,
    selectRouteByIndex,
    setSearchedServiceTier,
    updateFilteredRouteSections,
    clearTouristBusPassData,
} = busOtpSlice.actions;

export default busOtpSlice;
