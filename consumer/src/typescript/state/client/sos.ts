import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen';

export type SOSTool = 'RecordAudio' | 'CallPolice' | 'CallSafetyTeam' | 'PlaySiren';

export type SOSStage = 'DeActivated' | 'Activating' | 'Activated' | 'CallingPolice';

export type Contact = {
    name: string;
    profile: string | undefined;
    status: string;
    id: string;
    mobileNumber: string;
    priority: number;
};

export type SOS = {
    sosStage: SOSStage;
    activeSafetyTool: SOSTool | undefined;
    sosId: string | undefined;
    autoCallDefaultContact: boolean;
    defaultContact: personDefaultEmergencyNumberAPIEntity | undefined;
    isRideEnded: boolean;
    isSirenActive: boolean;
};

const emptySOS: SOS = {
    sosStage: 'DeActivated',
    activeSafetyTool: undefined,
    sosId: undefined,
    autoCallDefaultContact: false,
    defaultContact: undefined,
    isRideEnded: false,
    isSirenActive: false,
};

const REDUCER_NAME = 'sos';

const INITIAL_STATE: SOS = { ...emptySOS };

export const sosSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setsosStage: (state, action: PayloadAction<SOSStage>) => {
            state.sosStage = action.payload;
        },
        resetSosState: _ => {
            // Reset state to initial state
            return INITIAL_STATE;
        },
        activateSafetyTool: (state, action: PayloadAction<SOSTool | undefined>) => {
            state.activeSafetyTool = action.payload;
        },
        resetActiveSafetyTool: state => {
            state.activeSafetyTool = undefined;
        },
        setSosId: (state, action: PayloadAction<string | undefined>) => {
            state.sosId = action.payload;
        },
        setAutoCallDefaultContact: (state, action: PayloadAction<boolean>) => {
            state.autoCallDefaultContact = action.payload;
        },
        setDefaultContact: (state, action: PayloadAction<personDefaultEmergencyNumberAPIEntity | undefined>) => {
            state.defaultContact = action.payload;
        },
        setIsRideEnded: (state, action: PayloadAction<boolean>) => {
            state.isRideEnded = action.payload;
        },
        setSirenPlaying: (state, action: PayloadAction<boolean>) => {
            state.isSirenActive = action.payload;
        },
    },
});

const selectSession = (state: RootState): SOS => state.sos || INITIAL_STATE;

export const selectSosStage = (state: RootState) => selectSession(state).sosStage;

export const selectActiveSafetyTool = (state: RootState) => selectSession(state).activeSafetyTool;

export const selectSosId = (state: RootState) => selectSession(state).sosId;

export const selectAutoCallDefaultContact = (state: RootState) => selectSession(state).autoCallDefaultContact;

export const selectDefaultContact = (state: RootState) => selectSession(state).defaultContact;

export const selectIsRideEnded = (state: RootState) => selectSession(state).isRideEnded;

export const getSirenPlaying = (state: RootState) => selectSession(state).isSirenActive;

export const {
    setsosStage,
    resetSosState,
    activateSafetyTool,
    resetActiveSafetyTool,
    setSosId,
    setAutoCallDefaultContact,
    setDefaultContact,
    setIsRideEnded,
    setSirenPlaying,
} = sosSlice.actions;

export default sosSlice;
