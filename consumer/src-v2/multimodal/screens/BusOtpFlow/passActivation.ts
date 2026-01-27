import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/typescript/state/store';

export type PassActivationState = {
    verifiedOtp: string | null;
    lastUpdated: number | null;
};

const initialState: PassActivationState = {
    verifiedOtp: null,
    lastUpdated: null,
};

const passActivationSlice = createSlice({
    name: 'passActivation',
    initialState,
    reducers: {
        setVerifiedOtp: (state, action: PayloadAction<string>) => {
            state.verifiedOtp = action.payload;
            state.lastUpdated = Date.now();
        },
        clearVerifiedOtp: state => {
            state.verifiedOtp = null;
            state.lastUpdated = null;
        },
    },
});

export const { setVerifiedOtp, clearVerifiedOtp } = passActivationSlice.actions;

export default passActivationSlice;

// Typed selector
export const selectVerifiedOtp = (state: RootState) => state.passActivation?.verifiedOtp ?? null;
