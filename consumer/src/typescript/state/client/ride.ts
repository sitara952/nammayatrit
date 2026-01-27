/* eslint-disable functional/immutable-data */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { cloneDeep, isNull } from 'lodash';
import { SessionId } from './chat';
import { RideId, createRideId } from './booking';
import { createTransform } from 'redux-persist';

const safeSet = (stateObj: RideDict, id: RideId) => {
    stateObj = stateObj || {};
    stateObj[id] = stateObj[id] || cloneDeep(emptyRide);
    return stateObj[id];
};

export enum RatingScreenType {
    Review,
    Feedback,
}

export enum StopStatus {
    Approaching,
    OnStop,
}

export type StopInfo = {
    status: StopStatus;
    stop: number;
    waitingTimeStart: string | undefined;
};

export enum DistanceUnit {
    Meter,
    Mile,
    Yard,
    Kilometer,
}

export type InsuranceDataType = {
    certificateUrl: undefined | string;
    message: string;
    plan: undefined | string;
    policyId: undefined | string;
    policyNumber: undefined | string;
};

export type SubmitApiDataType = Array<{ id: string; question: string; questionId: string }>;

export type Ride = {
    rideDetails: rideAPIEntity | null;
    stopInfo: StopInfo | null;
    ratingScreen: RatingScreenType;
    rating: number;
    feedback: string;
    submitApiData: SubmitApiDataType;
    isFavorite: boolean;
    isDanger: boolean;
    showLogo: boolean;
    chatSessions: Array<SessionId>;
    currentChatSessionId: SessionId | null;
    distanceMoved: number;
    pickupDistance: number;
    editPickupAttempts: number;
    editLocationAttempts: number;
    hasCustomerCallOptionBeenClicked: boolean;
    hasExtraFareBannerBeenShown: boolean;
    insurance: InsuranceDataType | null;
    isSoftCancelSuccessful: boolean;
    driverETA: number | undefined;
    initialDriverETA: number | undefined;
    initialPickupDistance: number | undefined;
};

const emptyRide: Ride = {
    rideDetails: null,
    stopInfo: null,
    ratingScreen: RatingScreenType.Review,
    rating: 0,
    feedback: '',
    submitApiData: [],
    isFavorite: false,
    isDanger: false,
    showLogo: false,
    chatSessions: [],
    currentChatSessionId: null,
    distanceMoved: 0,
    pickupDistance: 0,
    editPickupAttempts: 0,
    editLocationAttempts: 0,
    hasCustomerCallOptionBeenClicked: false,
    hasExtraFareBannerBeenShown: false,
    insurance: null,
    isSoftCancelSuccessful: false,
    driverETA: undefined,
    initialDriverETA: undefined,
    initialPickupDistance: undefined,
};

type RideDict = {
    [rideId: RideId]: Ride;
};

type RidePayload<T> = {
    id: RideId | null;
    payload: T;
};
type RidePayloadAction<T> = PayloadAction<RidePayload<T>>;

const REDUCER_NAME = 'ride';

const INITIAL_STATE: RideDict = {};

export const rideSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setRideDetails: (state, action: RidePayloadAction<rideAPIEntity>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).rideDetails = action.payload.payload;
            safeSet(state, action.payload.id).editPickupAttempts =
                action.payload.payload.allowedEditPickupLocationAttempts;
            safeSet(state, action.payload.id).editLocationAttempts = action.payload.payload.allowedEditLocationAttempts;
            safeSet(state, action.payload.id).isFavorite = action.payload.payload.isAlreadyFav ?? false;
            return undefined;
        },
        setEditPickUpAttempts: (state, action: RidePayloadAction<number>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).editPickupAttempts = action.payload.payload;
            return undefined;
        },
        setEditLocationAttempts: (state, action: RidePayloadAction<number>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).editLocationAttempts = action.payload.payload;
            return undefined;
        },
        setRatingScreen: (state, action: RidePayloadAction<RatingScreenType>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).ratingScreen = action.payload.payload;
            return undefined;
        },
        setRating: (state, action: RidePayloadAction<number>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).rating = action.payload.payload;
            return undefined;
        },
        setFeedback: (state, action: RidePayloadAction<string>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).feedback = action.payload.payload;
            return undefined;
        },
        setSubmitApiData: (state, action: RidePayloadAction<SubmitApiDataType>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).submitApiData = action.payload.payload;
            return undefined;
        },
        setIsFavorite: (state, action: RidePayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isFavorite = action.payload.payload;
            return undefined;
        },
        setIsDanger: (state, action: RidePayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isDanger = action.payload.payload;
            return undefined;
        },
        setShowLogo: (state, action: RidePayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).showLogo = action.payload.payload;
            return undefined;
        },
        setChatSessions: (state, action: RidePayloadAction<Array<SessionId>>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).chatSessions = action.payload.payload;
            return undefined;
        },
        setCurrentChatSessionId: (state, action: RidePayloadAction<SessionId | null>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).currentChatSessionId = action.payload.payload;
            return undefined;
        },
        setDistanceMoved: (state, action: RidePayloadAction<number>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).distanceMoved = action.payload.payload;
            return undefined;
        },
        setPickupDistance: (state, action: RidePayloadAction<number>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            const ride = safeSet(state, action.payload.id);
            ride.pickupDistance = action.payload.payload;
            if (ride.initialPickupDistance === undefined) {
                ride.initialPickupDistance = action.payload.payload;
            }
            return undefined;
        },
        setStopInfo: (state, action: RidePayloadAction<StopInfo>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).stopInfo = action.payload.payload;
            return undefined;
        },
        setInsuranceData: (state, action: RidePayloadAction<InsuranceDataType>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).insurance = action.payload.payload;
            return undefined;
        },
        setIsSoftCancelSuccessful: (state, action: RidePayloadAction<boolean>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            safeSet(state, action.payload.id).isSoftCancelSuccessful = action.payload.payload;
            return undefined;
        },
        clearRideState: (state, action: PayloadAction<RideId>) => {
            if (state[action.payload]) {
                state[action.payload] = emptyRide;
            }
            return undefined;
        },
        setDriverETA: (state, action: RidePayloadAction<number>) => {
            if (isNull(action.payload.id)) {
                return state;
            }
            const ride = safeSet(state, action.payload.id);
            ride.driverETA = action.payload.payload;
            if (ride.initialDriverETA === undefined) {
                ride.initialDriverETA = action.payload.payload;
            }
            return undefined;
        },
        clearAllRideState: () => {
            return INITIAL_STATE;
        },
    },
});

const selectRideWithId = (state: RootState, rideId: RideId | null): Ride => {
    const rideDict = state.ride;
    if (rideId && rideDict && rideDict[rideId]) {
        return rideDict[rideId];
    }
    return emptyRide;
};

export const selectRatingScreenWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).ratingScreen;

export const selectRatingWithId = (state: RootState, rideId: RideId | null) => selectRideWithId(state, rideId).rating;

export const selectFeedbackWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).feedback;

export const selectSubmitApiDataWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).submitApiData;

export const selectIsFavoriteWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).isFavorite;

export const selectIsDangerWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).isDanger;

export const selectShowLogoWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).showLogo;

export const selectChatSessionsWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).chatSessions;

export const selectDistanceMovedWithRideId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).distanceMoved;

export const selectStopInfoWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).stopInfo;

export const selectPickupDistanceWithid = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).pickupDistance;

export const selectCurrentChatSessionIdWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).currentChatSessionId;

export const selectRideDetailsWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).rideDetails;

export const selectEditPickupAttempts = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).editPickupAttempts;

export const selectEditLocationAttempts = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).editLocationAttempts;

export const selectExtraFareBannerShown = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).hasExtraFareBannerBeenShown;

export const selectInsuranceData = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).insurance;

export const selectIsSoftCancelSuccessful = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).isSoftCancelSuccessful;

export const selectDriverETAWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).driverETA;

export const selectInitialDriverETAWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).initialDriverETA;

export const selectInitialPickupDistanceWithId = (state: RootState, rideId: RideId | null) =>
    selectRideWithId(state, rideId).initialPickupDistance;

export const {
    setRideDetails,
    setRating,
    setRatingScreen,
    setFeedback,
    setSubmitApiData,
    setIsDanger,
    setIsFavorite,
    setShowLogo,
    setChatSessions,
    setCurrentChatSessionId,
    setStopInfo,
    setDistanceMoved,
    setPickupDistance,
    setEditPickUpAttempts,
    setEditLocationAttempts,
    setIsSoftCancelSuccessful,
    clearRideState,
    setDriverETA,
    clearAllRideState,
    setInsuranceData,
} = rideSlice.actions;

/** Add or remove keys here only to be persisted */
export const PERSISTED_RIDE_FLAGS = ['stopInfo', 'initialDriverETA', 'initialPickupDistance'] as const;

type PersistedFlags = Pick<Ride, (typeof PERSISTED_RIDE_FLAGS)[number]>;

function pickPersistedFlags(ride: Ride): PersistedFlags {
    const emptyPersistedFlags: PersistedFlags = {
        stopInfo: null,
        initialDriverETA: undefined,
        initialPickupDistance: undefined,
    };
    return PERSISTED_RIDE_FLAGS.reduce<PersistedFlags>((acc, key) => {
        // @ts-expect-error - TypeScript can't infer that key is a valid key of Ride
        acc[key] = ride[key];
        return acc;
    }, emptyPersistedFlags);
}

export const ridePersistTransform = createTransform<RideDict, Record<string, PersistedFlags>>(
    inboundState => {
        const pruned: Record<string, PersistedFlags> = {};
        Object.entries(inboundState).forEach(([id, ride]) => {
            // Only persist if rideId exists
            pruned[id] = pickPersistedFlags(ride);
        });
        return pruned;
    },

    outboundState => {
        const rebuilt: RideDict = {};
        Object.entries(outboundState).forEach(([id, flags]) => {
            rebuilt[createRideId(id)] = {
                ...emptyRide,
                ...flags, // overwrite with persisted flags
            };
        });
        return rebuilt;
    },

    { whitelist: ['ride'] },
);

export default rideSlice;
