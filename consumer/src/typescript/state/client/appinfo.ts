import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type hybridActions =
    | 'favourites'
    | 'safety'
    | 'addHome'
    | 'addWork'
    | 'emergencyContactScreen'
    | 'addFav'
    | 'addContacts';

export const initialHybridFlags: Record<hybridActions, boolean> = {
    favourites: false,
    safety: false,
    addHome: false,
    addWork: false,
    emergencyContactScreen: false,
    addFav: false,
    addContacts: false,
};
export type AppInfo = {
    wentToHybridSection: { [k: string]: boolean };
};

const emptyAppInfo: AppInfo = {
    wentToHybridSection: initialHybridFlags, // to be deprecated after native hybrid is over
};

const REDUCER_NAME = 'appinfo' as string;

const INITIAL_STATE: AppInfo = { ...emptyAppInfo };

export const appinfoSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setWentToHybridSection: (state, action: PayloadAction<hybridActions>) => {
            state.wentToHybridSection = state.wentToHybridSection || {};
            state.wentToHybridSection[action.payload] = !state.wentToHybridSection[action.payload];
        },
    },
});

const selectSession = (state: RootState): AppInfo => state.appinfo || INITIAL_STATE;

export const selectWentToHybridSection = (state: RootState) => selectSession(state).wentToHybridSection;

export const { setWentToHybridSection } = appinfoSlice.actions;

export default appinfoSlice;
