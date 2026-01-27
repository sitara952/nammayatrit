import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userSlice from './client/user';
import authSlice from './client/auth';
import searchSlice from './client/search';
import clientVariant from './client/clientVariant';
import { api } from './api';
import { persistStore, Storage, persistReducer } from 'redux-persist';
import { globalErrorHandler } from './middleware';
import { createMMKV } from '@/utils/mmkvUtils';
import sessionSlice, { persistKeys } from './client/session';
import bookingSlice, { bookingPersistKeys, bookingPersistTransform } from './client/booking';
import rideSlice, { ridePersistTransform } from './client/ride';
import chatSlice from './client/chat';
import appinfoSlice from './client/appinfo';
import sosSlice from './client/sos';
import mapSlice from './client/maps';
import scoring from './client/scoring';
import journeySlice from './client/journey';
import journeySimulation from './client/journeySimulation';
import frfsRouteCacheSlice from './client/frfsRouteCache';
import busOtpSlice from '../../../src-v2/multimodal/screens/BusOtpFlow/busOtp';
import passActivationSlice from '../../../src-v2/multimodal/screens/BusOtpFlow/passActivation';
import appMonitorConfigSlice from './client/appMonitorConfig';
import adConfigSlice from './client/adConfig';
import { AsyncStorageWrapper } from '@/utils/mmkvUtils';
import { networkApi } from '../hooks/networkCheckApi';

const storage = createMMKV();

export const ReduxStorage: Storage = {
    setItem: (key, value) => {
        storage.set(key, value);
        return Promise.resolve(true);
    },
    getItem: async key => {
        if (__DEV__) {
            while (storage instanceof AsyncStorageWrapper && !storage.isInitialized()) {
                console.info('ReduxStorage: Waiting for storage to be initialized');
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        const value = storage.getString(key);
        return Promise.resolve(value);
    },
    removeItem: key => {
        storage.delete(key);
        return Promise.resolve();
    },
};

const persistConfig = {
    key: 'root',
    version: 1,
    storage: ReduxStorage,
    whitelist: [authSlice.name, userSlice.name, scoring.name],
};

export const clientVariantPersistConfig = {
    key: clientVariant.name,
    version: 1,
    storage: ReduxStorage,
};

export const searchPersistConfig = {
    key: searchSlice.name,
    version: 1,
    storage: ReduxStorage,
};

export const sessionPersistConfig = {
    key: sessionSlice.name,
    version: 1,
    storage: ReduxStorage,
    whitelist: persistKeys,
    bookingPersistKeys,
};

export const bookingPersistConfig = {
    key: bookingSlice.name,
    version: 1,
    storage: ReduxStorage,
    transforms: [bookingPersistTransform],
};

const journeySimulationPersistConfig = {
    key: journeySimulation.name,
    version: 1,
    storage: ReduxStorage,
    whitelist: ['selectedMode', 'selectedRoute', 'selectedStation', 'currentStationName'],
};

const journeyPersistConfig = {
    key: journeySlice.name,
    version: 1,
    storage: ReduxStorage,
};

export const ridePersistConfig = {
    key: rideSlice.name,
    version: 1,
    storage: ReduxStorage,
    transforms: [ridePersistTransform],
};

const persistedSearchReducer = persistReducer(searchPersistConfig, searchSlice.reducer);

const persistedSessionReducer = persistReducer(sessionPersistConfig, sessionSlice.reducer);

const persistedClientVariantReducer = persistReducer(clientVariantPersistConfig, clientVariant.reducer);

const persistedBookingReducer = persistReducer(bookingPersistConfig, bookingSlice.reducer);

const persistedJourneySimulationReducer = persistReducer(journeySimulationPersistConfig, journeySimulation.reducer);

const persistedJourneyReducer = persistReducer(journeyPersistConfig, journeySlice.reducer);

const persistedRideReducer = persistReducer(ridePersistConfig, rideSlice.reducer);

const appReducers = combineReducers({
    auth: authSlice.reducer,
    booking: persistedBookingReducer,
    appinfo: appinfoSlice.reducer,
    ride: persistedRideReducer,
    search: persistedSearchReducer,
    session: persistedSessionReducer,
    clientVariant: persistedClientVariantReducer,
    user: userSlice.reducer,
    chat: chatSlice.reducer,
    [api.reducerPath]: api.reducer,
    [networkApi.reducerPath]: networkApi.reducer,
    sos: sosSlice.reducer,
    map: mapSlice.reducer,
    scoring: scoring.reducer,
    journey: persistedJourneyReducer,
    journeySimulation: persistedJourneySimulationReducer,
    frfsRouteCache: frfsRouteCacheSlice.reducer,
    busOtp: busOtpSlice.reducer,
    passActivation: passActivationSlice.reducer,
    appMonitorConfig: appMonitorConfigSlice,
    adConfig: adConfigSlice,
});

const persistedReducer = persistReducer(persistConfig, appReducers);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: false, // [React Native Debugger] Set this to `true` for React Native Debugger to Run.
    middleware: getDefaultMiddleware => {
        const middlewares = __DEV__ ? [api.middleware, globalErrorHandler] : [api.middleware, globalErrorHandler];
        return getDefaultMiddleware({
            /*
        When using Redux Persist, it's important to ignore the action types dispatched by it to prevent serialization issues.
        We can achieve this by configuring the serializableCheck middleware option in your Redux store setup.
      */
            serializableCheck: false,
            immutableCheck: false,
            actionCreatorCheck: false,
        }).concat(middlewares);
    },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const persistor = persistStore(store);
