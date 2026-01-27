import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    JourneySimulations,
    MockJourneyLocation,
    TransportMode,
    JourneyStatus,
} from '@/src-v2/screens/JourneySimulation/types.ts';
import { RootState } from '../store';
import { deleteItem, MMKVKey, setStringItem } from '../../utils/MMKV';

interface JourneySimulationState {
    selectedMode: TransportMode | null;
    selectedRoute: JourneySimulations | null;
    selectedStation: MockJourneyLocation | null;
    currentStationName: string | null;
}

const initialState: JourneySimulationState = {
    selectedMode: null,
    selectedRoute: null,
    selectedStation: null,
    currentStationName: null,
};

const journeySlice = createSlice({
    name: 'journey',
    initialState,
    reducers: {
        setSelectedMode: (state, action: PayloadAction<TransportMode>) => {
            state.selectedMode = action.payload;
            state.selectedRoute = null;
            state.selectedStation = null;
            state.currentStationName = null;
        },
        setSelectedRoute: (state, action: PayloadAction<JourneySimulations>) => {
            const resetRoute = {
                ...action.payload,
                source: { ...action.payload.source, status: JourneyStatus.CURRENT },
                destination: { ...action.payload.destination, status: JourneyStatus.UPCOMING },
                locations: action.payload.locations.map(loc => ({ ...loc, status: JourneyStatus.UPCOMING })),
            };
            state.selectedRoute = resetRoute;
            state.selectedStation = null;
            state.currentStationName = null;
            deleteItem(MMKVKey.MOCK_JOURNEY_LOCATION);
        },
        setSelectedStation: (state, action: PayloadAction<{ station: MockJourneyLocation; stationIndex: number }>) => {
            const { station, stationIndex } = action.payload;
            state.selectedStation = station;
            state.currentStationName = station.name;
            setStringItem(MMKVKey.MOCK_JOURNEY_LOCATION, JSON.stringify(station));

            if (state.selectedRoute) {
                state.selectedRoute.source = {
                    ...state.selectedRoute.source,
                    status: stationIndex >= -1 ? JourneyStatus.COMPLETED : JourneyStatus.CURRENT,
                };

                state.selectedRoute.locations = state.selectedRoute.locations.map((loc, index) => ({
                    ...loc,
                    status:
                        index < stationIndex
                            ? JourneyStatus.COMPLETED
                            : index === stationIndex
                              ? JourneyStatus.CURRENT
                              : JourneyStatus.UPCOMING,
                }));

                state.selectedRoute.destination = {
                    ...state.selectedRoute.destination,
                    status:
                        stationIndex >= state.selectedRoute.locations.length
                            ? JourneyStatus.CURRENT
                            : JourneyStatus.UPCOMING,
                };
            }
        },
        clearJourneyData: state => {
            state.selectedRoute = null;
            state.selectedStation = null;
            state.currentStationName = null;
            state.selectedMode = null;
            deleteItem(MMKVKey.MOCK_JOURNEY_LOCATION);
        },
        resetJourneyState: () => {
            deleteItem(MMKVKey.MOCK_JOURNEY_LOCATION);
            return initialState;
        },
    },
});

export const selectJourneySimulation = (state: RootState) =>
    (state.journeySimulation || initialState) as JourneySimulationState;
export const selectSelectedMode = (state: RootState) => selectJourneySimulation(state).selectedMode;
export const selectSelectedRoute = (state: RootState) => selectJourneySimulation(state).selectedRoute;
export const selectSelectedStation = (state: RootState) => selectJourneySimulation(state).selectedStation;
export const selectCurrentStationName = (state: RootState) => selectJourneySimulation(state).currentStationName;

export const { setSelectedMode, setSelectedRoute, setSelectedStation, clearJourneyData, resetJourneyState } =
    journeySlice.actions;

export default journeySlice;
