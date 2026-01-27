/* eslint-disable functional/immutable-data */
/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { selectToken } from './auth';
import { profileRes } from '../../../readOnly/api/types/ProfileRes.gen';
import { PURGE } from 'redux-persist';
import { MMKVKey, setStringItem } from '@/typescript/utils/MMKV.ts';
import { cloneDeep, isNull } from 'lodash';
import { followers } from '@/readOnly/api/types/Followers.gen.tsx';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen.tsx';
import { cachedDestinations, tripLocationObject } from '@/src-v2/helpers/location/types/LocationCachingObject.ts';
import { City } from 'config-types';
import { disability } from '@/readOnly/api/types/Disability.gen.tsx';
import { disabilityArray } from '@/readOnly/api/types/DisabilityArray.gen.tsx';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen.tsx';
import { ClosestPickupInstructionResp } from '../server/pickupInstructionsApi';
import { ticketBookingReq } from '@/readOnly/api/types/TicketBookingReq.gen';
import { sDKPayload } from '@/readOnly/api/types/SDKPayload.gen';

// THIS TYPE IS CREATED TO MAKE SURE YOU ALWAYS PASS BOOKINGID, not some random ids when passing bookingId
export type BookingId = string & { readonly __brand: 'BookingId' };

export function createBookingId(id: string): BookingId {
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    return id as BookingId;
}

export type JourneyId = string & { readonly __brand: 'JourneyId' };

export function createJourneyId(id: string): JourneyId {
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    return id as JourneyId;
}

export function createJourneyIdString(journeyId: JourneyId | null): string {
    if (isNull(journeyId)) {
        return '';
    }

    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    return journeyId as string;
}

const safeSet = (stateObj: UserDict, id: AuthToken | null) => {
    stateObj = stateObj || {};
    if (id) {
        stateObj[id] = stateObj[id] || cloneDeep(emptyUser);
        return stateObj[id];
    }
    return cloneDeep(emptyUser);
};

export enum RedBusState {
    Initial,
    Allow,
    Deny,
}

type AuthToken = string;

export enum PaymentSources {
    YatriSathiTicketing,
    OdishaYatriTicketing,
    NammaYatriTicketing,
}

type PaymentInfo = {
    placeId: string;
    paymentOrderId: string;
    paymentSource: PaymentSources;
    bookingReqData: ticketBookingReq;
    sdkPayload: sDKPayload;
};

export interface User {
    searchId: string | null;
    activeRideSearchId: string | null;
    activeBookingIds: Array<BookingId>;
    bookingId: BookingId | null; // selected booking id
    profile: profileRes | null;
    followers: Array<followers>;
    currentFollower: followers | null;
    emergencyContacts: Array<personDefaultEmergencyNumberAPIEntity>;
    cachedDestinations: Array<cachedDestinations>;
    suggestedDestination: Array<location>;
    recentTrip: Array<tripLocationObject>;
    mobileNumber: string | null;
    mbpermissionForRedbus: RedBusState;
    operatingCity: City;
    specialAssistance: disability | undefined | null;
    disabilityListResp?: disabilityArray;
    isReferralApplied: boolean | undefined;
    referralAmountToCollect: number;
    customerFirstRide: boolean;
    payoutVpa: string | undefined;
    ticketBookingOrderId: string | undefined;
    savedLocations: savedReqLocationAPIEntity[] | null;
    paymentInfo: PaymentInfo | null;
    closestPickupInstruction: ClosestPickupInstructionResp | null;
}

const emptyUser: User = {
    searchId: null,
    activeRideSearchId: null,
    activeBookingIds: [],
    bookingId: null,
    profile: null,
    followers: [],
    currentFollower: null,
    emergencyContacts: [],
    cachedDestinations: [],
    suggestedDestination: [],
    recentTrip: [],
    mobileNumber: '',
    mbpermissionForRedbus: RedBusState.Initial,
    operatingCity: 'default',
    specialAssistance: undefined,
    isReferralApplied: undefined,
    referralAmountToCollect: 0,
    customerFirstRide: false,
    payoutVpa: undefined,
    ticketBookingOrderId: undefined,
    savedLocations: null,
    paymentInfo: null,
    closestPickupInstruction: null,
};

type UserDict = {
    [accessToken: AuthToken]: User;
};

type UserPayload<T> = {
    id: AuthToken | null;
    payload: T;
};
type UserPayloadAction<T> = PayloadAction<UserPayload<T>>;

const REDUCER_NAME = 'user';

const INITIAL_STATE: UserDict = {};

export const userSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setSearchId: (state, action: UserPayloadAction<string | null>) => {
            safeSet(state, action.payload.id).searchId = action.payload.payload;
        },
        setActiveSearchId: (state, action: UserPayloadAction<string | null>) => {
            safeSet(state, action.payload.id).activeRideSearchId = action.payload.payload;
        },
        setProfile: (state, action: UserPayloadAction<profileRes>) => {
            const fullName =
                (action.payload.payload.firstName ?? '') +
                (action.payload.payload.lastName ? ' ' + action.payload.payload.lastName : '');
            if (fullName) setStringItem(MMKVKey.USER_NAME, fullName);
            safeSet(state, action.payload.id).profile = action.payload.payload;
            if (!action.payload.payload.followsRide) {
                safeSet(state, action.payload.id).followers = [];
            }
        },
        setActiveRideSearchId: (state, action: UserPayloadAction<string | null>) => {
            safeSet(state, action.payload.id).activeRideSearchId = action.payload.payload;
        },
        setActiveBookingIds: (state, action: UserPayloadAction<Array<BookingId>>) => {
            safeSet(state, action.payload.id).activeBookingIds = action.payload.payload;
        },
        setReferralApplied: (state, action: UserPayloadAction<boolean | undefined>) => {
            safeSet(state, action.payload.id).isReferralApplied = action.payload.payload;
        },
        addActiveBookingIds: (state, action: UserPayloadAction<BookingId | null>) => {
            const activeBookingIds = safeSet(state, action.payload.id).activeBookingIds;
            const bookingId = action.payload.payload;
            if (bookingId && !activeBookingIds.includes(bookingId)) {
                safeSet(state, action.payload.id).activeBookingIds = activeBookingIds.concat(bookingId);
            }
        },
        removeActiveBookingId: (state, action: UserPayloadAction<BookingId | null>) => {
            const activeBookingIds = safeSet(state, action.payload.id).activeBookingIds;
            const bookingId = action.payload.payload;
            if (bookingId) {
                const index = activeBookingIds.indexOf(bookingId);
                safeSet(state, action.payload.id).activeBookingIds = activeBookingIds
                    .slice(0, index)
                    .concat(activeBookingIds.slice(index + 1));
            }
        },
        setBookingId: (state, action: UserPayloadAction<BookingId | null>) => {
            safeSet(state, action.payload.id).bookingId = action.payload.payload;
        },
        setFollowers: (state, action: UserPayloadAction<Array<followers>>) => {
            safeSet(state, action.payload.id).followers = action.payload.payload;
        },
        setCurrentFollower: (state, action: UserPayloadAction<followers | null>) => {
            safeSet(state, action.payload.id).currentFollower = action.payload.payload;
        },
        setEmergencyContacts: (state, action: UserPayloadAction<Array<personDefaultEmergencyNumberAPIEntity>>) => {
            safeSet(state, action.payload.id).emergencyContacts = action.payload.payload;
        },
        setCachedDestinations: (state, action: UserPayloadAction<Array<cachedDestinations>>) => {
            safeSet(state, action.payload.id).cachedDestinations = action.payload.payload;
        },
        setRecentTrip: (state, action: UserPayloadAction<Array<tripLocationObject>>) => {
            safeSet(state, action.payload.id).recentTrip = action.payload.payload;
        },
        setSuggestedDestination: (state, action: UserPayloadAction<Array<location>>) => {
            safeSet(state, action.payload.id).suggestedDestination = action.payload.payload;
        },
        setMobileNumber: (state, action: UserPayloadAction<string | null>) => {
            safeSet(state, action.payload.id).mobileNumber = action.payload.payload;
        },
        setMbpermissionForRedbus: (state, action: UserPayloadAction<RedBusState>) => {
            safeSet(state, action.payload.id).mbpermissionForRedbus = action.payload.payload;
        },

        setSpecialAssistance: (state, action: UserPayloadAction<disability | undefined | null>) => {
            safeSet(state, action.payload.id).specialAssistance = action.payload.payload;
        },

        setDisabilityListResp: (state, action: UserPayloadAction<disabilityArray | undefined>) => {
            safeSet(state, action.payload.id).disabilityListResp = action.payload.payload;
        },

        setReferralAmountToCollect: (state, action: UserPayloadAction<number>) => {
            safeSet(state, action.payload.id).referralAmountToCollect = action.payload.payload;
        },

        setCustomerFirstRide: (state, action: UserPayloadAction<boolean>) => {
            safeSet(state, action.payload.id).customerFirstRide = action.payload.payload;
        },

        setPayoutVpa: (state, action: UserPayloadAction<string | undefined>) => {
            safeSet(state, action.payload.id).payoutVpa = action.payload.payload;
        },
        setTicketBookingOrderId: (state, action: UserPayloadAction<string | undefined>) => {
            safeSet(state, action.payload.id).ticketBookingOrderId = action.payload.payload;
        },
        setSavedLocations: (state, action: UserPayloadAction<savedReqLocationAPIEntity[]>) => {
            safeSet(state, action.payload.id).savedLocations = action.payload.payload;
        },
        setPaymentInfo: (state, action: UserPayloadAction<PaymentInfo | null>) => {
            safeSet(state, action.payload.id).paymentInfo = action.payload.payload;
        },
        setClosestPickupInstruction: (state, action: UserPayloadAction<ClosestPickupInstructionResp | null>) => {
            safeSet(state, action.payload.id).closestPickupInstruction = action.payload.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, state => {
            return state;
        });
    },
});

const selectUser = (state: RootState) => {
    const token = selectToken(state);
    const userDict = state.user;
    if (token && userDict && userDict[token]) {
        return userDict[token];
    }
    return cloneDeep(emptyUser);
};

export const selectUserProfile = (state: RootState) => selectUser(state).profile;

export const selectUserProfileLanguage = (state: RootState) => selectUser(state).profile?.language;

export const selectSearchId = (state: RootState, searchId: string | null) => {
    if (searchId === undefined || searchId === null) return selectUser(state).searchId;
    return searchId;
};

export const selectBookingId = (state: RootState) => selectUser(state).bookingId;

export const selectActiveRideSearchId = (state: RootState) => selectUser(state).activeRideSearchId;

export const selectActiveBookingIds = createSelector(
    [selectUser, (state: RootState) => state.booking],
    (user, bookingList) => {
        return user.activeBookingIds.filter(id => bookingList?.[id]?.bookingDetails?.status !== 'COMPLETED');
    },
);

export const selectUserName = createSelector([selectUserProfile], profile => {
    return profile ? (profile.firstName ?? 'User') + (profile.lastName ? ' ' + profile.lastName : '') : 'User';
});

export const selectUserId = createSelector([selectUserProfile], profile => profile?.id);

export const selectUserGender = createSelector([selectUserProfile], profile => profile?.gender);

export const selectFollowers = (state: RootState) => selectUser(state).followers;

export const selectCurrentFollower = (state: RootState) => selectUser(state).currentFollower;

export const selectEmergencyContacts = (state: RootState) => selectUser(state).emergencyContacts;

export const selectTicketBookingOrderId = (state: RootState) => selectUser(state).ticketBookingOrderId;

export const selectCachedDestinations = createSelector(
    [state => selectUser(state).cachedDestinations],
    cachedDestinations => {
        return (
            cachedDestinations &&
            cachedDestinations.map(cacheDest => {
                return {
                    suggestedDestination:
                        cacheDest && cacheDest.suggestedDestination && Array.isArray(cacheDest.suggestedDestination)
                            ? cacheDest.suggestedDestination.filter(dest => dest.destination.serviceabilityCity)
                            : [],
                    srcGeoHash: cacheDest.srcGeoHash,
                    recentTrips: cacheDest && cacheDest.recentTrips && cacheDest.recentTrips,
                };
            })
        );
    },
);

export const selectMobileNumber = (state: RootState) => selectUser(state)?.mobileNumber;

export const selectMbpermissionForRedbus = (state: RootState) => selectUser(state)?.mbpermissionForRedbus;

export const selectSpecialAssistance = (state: RootState) => selectUser(state).specialAssistance;

export const selectDisabilityListResp = (state: RootState) => selectUser(state).disabilityListResp;

export const selectReferralApplied = (state: RootState) => selectUser(state).isReferralApplied;

export const selectReferralAmountToCollect = (state: RootState) => selectUser(state).referralAmountToCollect;

export const selectCustomerFirstRide = (state: RootState) => selectUser(state).customerFirstRide;

export const selectPayoutVpa = (state: RootState) => selectUser(state).payoutVpa;

export const selectRecentTrip = (state: RootState) => selectUser(state).recentTrip;

export const selectSuggestedDestination = (state: RootState) => selectUser(state).suggestedDestination;

export const selectSavedLocations = (state: RootState) => selectUser(state).savedLocations;

export const selectPaymentInfo = (state: RootState) => selectUser(state).paymentInfo;

export const selectClosestPickupInstruction = (state: RootState) => selectUser(state).closestPickupInstruction;

export const {
    setSearchId,
    setProfile,
    setBookingId,
    setActiveRideSearchId,
    setActiveBookingIds,
    addActiveBookingIds,
    removeActiveBookingId,
    setFollowers,
    setCurrentFollower,
    setEmergencyContacts,
    setCachedDestinations,
    setActiveSearchId,
    setMobileNumber,
    setMbpermissionForRedbus,
    setSpecialAssistance,
    setDisabilityListResp,
    setReferralApplied,
    setReferralAmountToCollect,
    setCustomerFirstRide,
    setPayoutVpa,
    setRecentTrip,
    setSuggestedDestination,
    setTicketBookingOrderId,
    setSavedLocations,
    setPaymentInfo,
    setClosestPickupInstruction,
} = userSlice.actions;

export default userSlice;
