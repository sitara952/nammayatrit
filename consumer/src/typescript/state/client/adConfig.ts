import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { AdConfigApiResponse, AdConfigResponse } from '../server/adConfigApi';

/**
 * Ad Config State
 * Stores ad configurations fetched from backend, indexed by placement_code (viewUnitId)
 */
interface AdConfigState {
    placements: Record<string, AdConfigResponse | null>;
    isLoaded: boolean;
    lastFetchTime: number | null;
}

const initialState: AdConfigState = {
    placements: {},
    isLoaded: false,
    lastFetchTime: null,
};

const adConfigSlice = createSlice({
    name: 'adConfig',
    initialState,
    reducers: {
        setAdConfig: (state, action: PayloadAction<AdConfigApiResponse[]>) => {
            // Clear existing placements
            state.placements = {};

            // Process each placement from the API response
            action.payload.forEach(placement => {
                // Use the first item in the items array
                const firstItem = placement.items && placement.items.length > 0 ? placement.items[0] : undefined;
                state.placements[placement.placement_code] = firstItem || null;
            });

            state.isLoaded = true;
            state.lastFetchTime = Date.now();
        },
        clearAdConfig: state => {
            state.placements = {};
            state.isLoaded = false;
            state.lastFetchTime = null;
        },
    },
});

// Actions
export const { setAdConfig, clearAdConfig } = adConfigSlice.actions;

// Selectors
export const selectAdConfigByPlacement = (state: RootState, viewUnitId: string): AdConfigResponse | null => {
    return state.adConfig.placements[viewUnitId] || null;
};

export const selectIsAdConfigLoaded = (state: RootState): boolean => {
    return state.adConfig.isLoaded;
};

export const selectAllAdPlacements = (state: RootState): Record<string, AdConfigResponse | null> => {
    return state.adConfig.placements;
};

export const selectLastFetchTime = (state: RootState): number | null => {
    return state.adConfig.lastFetchTime;
};

export default adConfigSlice.reducer;
