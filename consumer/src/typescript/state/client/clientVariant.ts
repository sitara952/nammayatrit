import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type Var = {
    cab_firstride: string;
    auto_firstride: string;
    bike_firstride: string;
};

export type Client = {
    cab_firstride: string;
    auto_firstride: string;
    bike_firstride: string;
};

const emptyState: Client = {
    cab_firstride: '',
    auto_firstride: '',
    bike_firstride: '',
};

const REDUCER_NAME = 'clientVariant';

const INITIAL_STATE: Client = { ...emptyState };

export const clientVariantSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setCab: (state, action: PayloadAction<{ variant: string }>) => {
            const { variant } = action.payload;
            state.cab_firstride = variant;
        },
        setAuto: (state, action: PayloadAction<{ variant: string }>) => {
            const { variant } = action.payload;
            state.auto_firstride = variant;
        },
        setBike: (state, action: PayloadAction<{ variant: string }>) => {
            const { variant } = action.payload;
            state.bike_firstride = variant;
        },
        resetSosState: () => {
            // Reset state to initial state
            return INITIAL_STATE;
        },
    },
});

const selectSession = (state: RootState) => state.clientVariant || INITIAL_STATE;

export const getClientVariant = (state: RootState): Client => {
    return selectSession(state);
};

export const { setCab, setAuto, setBike, resetSosState } = clientVariantSlice.actions;

export default clientVariantSlice;
