import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PURGE } from 'redux-persist';
import { deleteItem, MMKVKey } from '@/typescript/utils/MMKV';
type AuthToken = string;

export interface Auth {
    isLoading: boolean;
    sessionId: string | null;
    accessToken: AuthToken | null;
}

const REDUCER_NAME: string = 'auth';
const INITIAL_STATE: Auth = {
    accessToken: null,
    sessionId: null,
    isLoading: false,
};

export const authSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setSessionId: (state, action: PayloadAction<string>) => {
            state.sessionId = action.payload;
        },
        setIsLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setToken: (state, action: PayloadAction<AuthToken>) => {
            state.accessToken = action.payload;
        },
        logOut: () => {
            deleteItem(MMKVKey.REGISTRATION_TOKEN);
            return INITIAL_STATE;
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, state => {
            return state;
        });
    },
});

export const selectAuth = (state: RootState) => state.auth || INITIAL_STATE;
export const selectToken = (state: RootState) => selectAuth(state).accessToken;
export const selectIsLoading = (state: RootState) => selectAuth(state).isLoading;

export const { setToken, setIsLoading, logOut, setSessionId } = authSlice.actions;

export default authSlice;
