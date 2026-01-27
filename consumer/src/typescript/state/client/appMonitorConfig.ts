import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import {
    type ParsedEventLoggingConfig,
    type AppMonitorConfig,
    DEFAULT_EVENT_LOGGING_CONFIG,
} from '@/typescript/types/AppMonitorConfig';

interface AppMonitorConfigState {
    config: AppMonitorConfig | null;
    eventLoggingConfig: ParsedEventLoggingConfig;
    rawEvents: string[];
    lastUpdated: number | null;
    isLoaded: boolean;
}

const initialState: AppMonitorConfigState = {
    config: null,
    eventLoggingConfig: {
        ...DEFAULT_EVENT_LOGGING_CONFIG,
        isValid: false,
    },
    rawEvents: [],
    lastUpdated: null,
    isLoaded: false,
};

const appMonitorConfigSlice = createSlice({
    name: 'appMonitorConfig',
    initialState,
    reducers: {
        setAppMonitorConfig: (
            state,
            action: PayloadAction<{ config: AppMonitorConfig; eventLoggingConfig: ParsedEventLoggingConfig }>,
        ) => {
            state.config = action.payload.config;
            state.eventLoggingConfig = action.payload.eventLoggingConfig;
            state.rawEvents = action.payload.eventLoggingConfig.rawEvents ?? [];
            state.lastUpdated = Date.now();
            state.isLoaded = true;
        },
        resetAppMonitorConfig: state => {
            state.config = null;
            state.eventLoggingConfig = {
                ...DEFAULT_EVENT_LOGGING_CONFIG,
                isValid: false,
            };
            state.rawEvents = [];
            state.lastUpdated = null;
            state.isLoaded = false;
        },
    },
});

export const { setAppMonitorConfig, resetAppMonitorConfig } = appMonitorConfigSlice.actions;

export const selectAppMonitorConfig = (state: RootState): AppMonitorConfig | null => state.appMonitorConfig.config;

export const selectEventLoggingConfig = (state: RootState): ParsedEventLoggingConfig =>
    state.appMonitorConfig.eventLoggingConfig;

export const selectIsAppMonitorConfigLoaded = (state: RootState): boolean => state.appMonitorConfig.isLoaded;

export const selectAppMonitorConfigLastUpdated = (state: RootState): number | null =>
    state.appMonitorConfig.lastUpdated;

export const selectRawEvents = (state: RootState): string[] => state.appMonitorConfig.rawEvents;

export default appMonitorConfigSlice.reducer;
