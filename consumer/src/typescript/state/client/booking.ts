/* eslint-disable myCustomPlugin/no-as-in-modified-files */
/* eslint-disable functional/immutable-data */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { bookingAPIEntity } from '../../../readOnly/api/types/BookingAPIEntity.gen';
import { RootState } from '../store';
import { bookingAPIDetails } from '@/readOnly/api/types/BookingAPIDetails.gen';
import { cloneDeep, isNull } from 'lodash';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { BookingId, createBookingId } from './user';
import { createTransform } from 'redux-persist';
import { disability } from '@/readOnly/api/types/Disability.gen';

export const PENDING_BOOKING_ID = createBookingId('PENDING_SA');

export type RideId = string & { readonly __brand: 'RideId' };

export function createRideId(id: string): RideId {
    return id as RideId;
}

const safeSet = (stateObj: BookingDict, id: BookingId) => {
    stateObj = stateObj || {};
    stateObj[id] = stateObj[id] || cloneDeep(emptyBooking);
    return stateObj[id];
};

export enum BannerResponse {
    Yes = 'yes',
    No = 'no',
    None = '',
}

export type BannerResponseType = BannerResponse | null;

export type DriverComplaintFlags = {
    hasCustomerCallOptionBeenClicked: boolean;
    hasExtraFareBannerBeenShown: boolean;
    hasExtraFareConfirmationBeenResponded: boolean;
    hasAcBannerBeenShown: boolean;
    hasAcConfirmationBeenResponded: boolean;
    extraFareFirstBannerResponse: BannerResponseType;
    acFirstBannerResponse: BannerResponseType;
};

export type Booking = {
    rideId: RideId | null;
    bookingDetails: bookingAPIEntity | null;
    bookedSource: FormatedLocation | null;
    bookedStops: Array<FormatedLocation>;
    otpCode: string | null;
    rideChecksPopup: RideChecks;
    postRideChecksPopup: PostRideChecks;
    tripStartedLottieShown: boolean;
    driverAssignedShown: boolean;
    driverHighlightMessage: string | null;
    pickupInstructionsEditCount: number;
    rideDriverFlags: Record<string, DriverComplaintFlags>;
    specialAssistance: disability | null | undefined;
};

export interface RideChecks {
    toll: RideChecksType;
    acVehicle: RideChecksType;
    parking: RideChecksType;
    tollAndParking: RideChecksType;
    driverDemandExtra: RideChecksType;
    vehicleCleanliness: RideChecksType;
}

export interface PostRideChecks {
    toll: RideChecksType;
}

const emptyDriverComplaintFlags: DriverComplaintFlags = {
    hasCustomerCallOptionBeenClicked: false,
    hasExtraFareBannerBeenShown: false,
    hasExtraFareConfirmationBeenResponded: false,
    hasAcBannerBeenShown: false,
    hasAcConfirmationBeenResponded: false,
    extraFareFirstBannerResponse: null,
    acFirstBannerResponse: null,
};

const getOrCreateRideFlags = (booking: Booking, rideId: RideId): DriverComplaintFlags => {
    if (!booking.rideDriverFlags) {
        booking.rideDriverFlags = {};
    }
    const rideIdStr = rideId;
    if (!booking.rideDriverFlags[rideIdStr]) {
        booking.rideDriverFlags[rideIdStr] = { ...emptyDriverComplaintFlags };
    }
    return booking.rideDriverFlags[rideIdStr];
};

const createFlagSetter = <T extends keyof DriverComplaintFlags>(flagKey: T) => {
    return (
        state: BookingDict,
        action: PayloadAction<{
            bookingId: BookingId | null;
            rideId: RideId | null;
            payload: DriverComplaintFlags[T];
        }>,
    ) => {
        if (isNull(action.payload.bookingId) || isNull(action.payload.rideId)) return state;
        const booking = safeSet(state, action.payload.bookingId);
        const flags = getOrCreateRideFlags(booking, action.payload.rideId);
        flags[flagKey] = action.payload.payload;
        return undefined;
    };
};

const emptyBooking: Booking = {
    rideId: null,
    bookingDetails: null,
    bookedSource: null,
    bookedStops: [],
    otpCode: null,
    rideChecksPopup: {
        toll: RideChecksType.None,
        acVehicle: RideChecksType.None,
        parking: RideChecksType.None,
        tollAndParking: RideChecksType.None,
        driverDemandExtra: RideChecksType.None,
        vehicleCleanliness: RideChecksType.None,
    },
    postRideChecksPopup: {
        toll: RideChecksType.None,
    },
    tripStartedLottieShown: false,
    driverAssignedShown: false,
    driverHighlightMessage: null,
    pickupInstructionsEditCount: 0,
    rideDriverFlags: {},
    specialAssistance: undefined,
};

type BookingDict = {
    [bookingId: BookingId]: Booking;
};

type BookingPayload<T> = {
    id: BookingId | null;
    payload: T;
};
type BookingPayloadAction<T> = PayloadAction<BookingPayload<T>>;

const REDUCER_NAME = 'booking' as string;

const INITIAL_STATE: BookingDict = {};

export const bookingPersistKeys = ['driverAssignedShown', 'tripStartedLottieShown'];

export const bookingSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setBookingData: (state, action: BookingPayloadAction<bookingAPIEntity>) => {
            if (isNull(action.payload.id)) return state;
            const bookingDetails = action.payload.payload;
            safeSet(state, action.payload.id).bookingDetails = bookingDetails;
            safeSet(state, action.payload.id).otpCode = getOtpCode(bookingDetails.bookingDetails);
            if (bookingDetails.rideList[0]) {
                const rideDetails = bookingDetails.rideList[0];
                safeSet(state, action.payload.id).rideId = createRideId(rideDetails.id);
            }
            return undefined;
        },
        setRideId: (state, action: BookingPayloadAction<RideId | null>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).rideId = action.payload.payload;
            return undefined;
        },
        setBookingDetails: (state, action: BookingPayloadAction<bookingAPIEntity>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).bookingDetails = action.payload.payload;
            return undefined;
        },
        setOtpCode: (state, action: BookingPayloadAction<bookingAPIDetails>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).otpCode = getOtpCode(action.payload.payload);
            return undefined;
        },
        setRideChecks: (state, action: BookingPayloadAction<RideChecks>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).rideChecksPopup = action.payload.payload;
            return undefined;
        },
        setPostRideChecks: (state, action: BookingPayloadAction<PostRideChecks>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).postRideChecksPopup = action.payload.payload;
            return undefined;
        },
        setBookedSource: (state, action: BookingPayloadAction<FormatedLocation | null>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).bookedSource = action.payload.payload;
            return undefined;
        },
        setBookedStops: (state, action: BookingPayloadAction<Array<FormatedLocation>>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).bookedStops = action.payload.payload;
            return undefined;
        },
        setTripStartedLottieShown: (state, action: BookingPayloadAction<boolean>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).tripStartedLottieShown = action.payload.payload;
            return undefined;
        },
        setDriverAssignedShown: (state, action: BookingPayloadAction<boolean>) => {
            if (action.payload.id == null) return;
            safeSet(state, action.payload.id).driverAssignedShown = action.payload.payload;
            return undefined;
        },
        setDriverHighlightMessage: (state, action: BookingPayloadAction<string | null>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).driverHighlightMessage = action.payload.payload;
            return undefined;
        },
        incrementPickupInstructionsEditCount: (state, action: BookingPayloadAction<void>) => {
            if (isNull(action.payload.id)) return state;
            const currentCount = safeSet(state, action.payload.id).pickupInstructionsEditCount;
            safeSet(state, action.payload.id).pickupInstructionsEditCount = currentCount + 1;
            return undefined;
        },
        setRideDriverFlagsPatch: (
            state,
            action: PayloadAction<{
                bookingId: BookingId | null;
                rideId: RideId | null;
                patch: Partial<DriverComplaintFlags>;
            }>,
        ) => {
            if (isNull(action.payload.bookingId) || isNull(action.payload.rideId)) return state;
            const booking = safeSet(state, action.payload.bookingId);
            const flags = getOrCreateRideFlags(booking, action.payload.rideId);
            Object.assign(flags, action.payload.patch);
            return undefined;
        },
        setCustomerCallOptionClicked: createFlagSetter('hasCustomerCallOptionBeenClicked'),
        setExtraFareBannerShown: createFlagSetter('hasExtraFareBannerBeenShown'),
        setExtraFareFirstBannerResponse: createFlagSetter('extraFareFirstBannerResponse'),
        setExtraFareConfirmationResponded: createFlagSetter('hasExtraFareConfirmationBeenResponded'),
        setAcBannerShown: createFlagSetter('hasAcBannerBeenShown'),
        setAcFirstBannerResponse: createFlagSetter('acFirstBannerResponse'),
        setAcConfirmationResponded: createFlagSetter('hasAcConfirmationBeenResponded'),
        setBookingSpecialAssistance: (state, action: BookingPayloadAction<disability | null | undefined>) => {
            if (isNull(action.payload.id)) return state;
            safeSet(state, action.payload.id).specialAssistance = action.payload.payload;
            return undefined;
        },
        assignPendingSpecialAssistance: (state, action: BookingPayloadAction<null>) => {
            const bookingId = action.payload.id;
            if (isNull(bookingId)) return state;
            const pendingBooking = safeSet(state, PENDING_BOOKING_ID);
            const pendingSA = pendingBooking.specialAssistance;
            const targetBooking = safeSet(state, bookingId);

            if (pendingSA !== undefined && targetBooking.specialAssistance === undefined) {
                targetBooking.specialAssistance = pendingSA;
                delete state[PENDING_BOOKING_ID];
            } else if (pendingSA !== undefined) {
                // Clear pending if we didn't use it (target already had value) to avoid stale pending state?
                // Or keep it? Safer to clear to clean up.
                delete state[PENDING_BOOKING_ID];
            }
            return undefined;
        },
        clearAllBookingState: () => {
            return INITIAL_STATE;
        },
    },
});

export const PERSISTED_BOOKING_FLAGS = [
    'tripStartedLottieShown',
    'driverAssignedShown',
    'driverHighlightMessage',
    'pickupInstructionsEditCount',
    'rideDriverFlags',
] as const;

type PersistedFlags = Pick<Booking, (typeof PERSISTED_BOOKING_FLAGS)[number]>;

function pickPersistedFlags(booking: Booking): PersistedFlags {
    return PERSISTED_BOOKING_FLAGS.reduce((acc, key) => {
        // @ts-expect-error - TypeScript can't infer that key is a valid key of Booking
        acc[key] = booking[key];
        return acc;
    }, {} as PersistedFlags);
}

export const bookingPersistTransform = createTransform<BookingDict, Record<string, PersistedFlags>>(
    inboundState => {
        const pruned: Record<string, PersistedFlags> = {};
        Object.entries(inboundState).forEach(([id, booking]) => {
            pruned[id] = pickPersistedFlags(booking);
        });
        return pruned;
    },

    outboundState => {
        const rebuilt: BookingDict = {};
        Object.entries(outboundState).forEach(([id, flags]) => {
            rebuilt[id as BookingId] = {
                ...emptyBooking,
                ...flags, // overwrite with persisted flags
            };
        });
        return rebuilt;
    },

    { whitelist: ['booking'] },
);

export const getOtpCode = (details: bookingAPIDetails) => {
    if (!details) return null;
    const convertToNull = (value: string | undefined): string | null => (value === undefined ? null : value);
    switch (details.TAG) {
        case 'RENTAL':
        case 'OneWaySpecialZoneAPIDetails':
        case 'INTER_CITY':
            return convertToNull(details._0.otpCode);
        default:
            return null;
    }
};

export const selectAllBooking = (state: RootState) => {
    return state.booking as BookingDict | undefined;
};

export const selectBookingWithId = (state: RootState, bookingId: BookingId | null) => {
    const bookingDict = state.booking;
    if (!isNull(bookingId) && bookingDict && bookingDict[bookingId]) {
        return bookingDict[bookingId] as Booking;
    }
    return emptyBooking;
};

export const selectBookingDetailsWithId = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).bookingDetails;

export const selectRideIdWithBookingId = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).rideId;

export const selectOtpCodeWithBookingId = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).otpCode;

export const selectRideChecksWithBookingId = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).rideChecksPopup;

export const selectPostRideChecksWithBookingId = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).postRideChecksPopup;

export const selectBookedSourceWithId = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).bookedSource;

export const selectBookedStopsWithId = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).bookedStops;

export const selectTripStartedLottieShown = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).tripStartedLottieShown;

export const selectDriverAssignedShown = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).driverAssignedShown;

export const selectDriverHighlightMessage = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).driverHighlightMessage;

export const selectBookingSpecialAssistance = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).specialAssistance;

export const selectPickupInstructionsEditCount = (state: RootState, bookingId: BookingId | null) =>
    selectBookingWithId(state, bookingId).pickupInstructionsEditCount;

const selectRideDriverFlags = (
    state: RootState,
    bookingId: BookingId | null,
    rideId: RideId | null,
): DriverComplaintFlags | null => {
    if (!bookingId || !rideId) return null;
    const booking = selectBookingWithId(state, bookingId);
    if (!booking.rideDriverFlags) return null;
    return booking.rideDriverFlags[rideId] ?? null;
};

export const selectCustomerCallOptionClicked = (
    state: RootState,
    bookingId: BookingId | null,
    rideId: RideId | null,
): boolean => {
    const flags = selectRideDriverFlags(state, bookingId, rideId);
    return flags?.hasCustomerCallOptionBeenClicked ?? false;
};

export const selectExtraFareBannerShown = (
    state: RootState,
    bookingId: BookingId | null,
    rideId: RideId | null,
): boolean => {
    const flags = selectRideDriverFlags(state, bookingId, rideId);
    return flags?.hasExtraFareBannerBeenShown ?? false;
};

export const selectExtraFareConfirmationResponded = (
    state: RootState,
    bookingId: BookingId | null,
    rideId: RideId | null,
): boolean => {
    const flags = selectRideDriverFlags(state, bookingId, rideId);
    return flags?.hasExtraFareConfirmationBeenResponded ?? false;
};

export const selectAcBannerShown = (state: RootState, bookingId: BookingId | null, rideId: RideId | null): boolean => {
    const flags = selectRideDriverFlags(state, bookingId, rideId);
    return flags?.hasAcBannerBeenShown ?? false;
};

export const selectAcConfirmationResponded = (
    state: RootState,
    bookingId: BookingId | null,
    rideId: RideId | null,
): boolean => {
    const flags = selectRideDriverFlags(state, bookingId, rideId);
    return flags?.hasAcConfirmationBeenResponded ?? false;
};

export const selectExtraFareFirstBannerResponse = (
    state: RootState,
    bookingId: BookingId | null,
    rideId: RideId | null,
): BannerResponseType => {
    const flags = selectRideDriverFlags(state, bookingId, rideId);
    return flags?.extraFareFirstBannerResponse ?? null;
};

export const selectAcFirstBannerResponse = (
    state: RootState,
    bookingId: BookingId | null,
    rideId: RideId | null,
): BannerResponseType => {
    const flags = selectRideDriverFlags(state, bookingId, rideId);
    return flags?.acFirstBannerResponse ?? null;
};

export const {
    setBookingData,
    setRideId,
    setBookingDetails,
    setOtpCode,
    setBookedSource,
    setBookedStops,
    setRideChecks,
    setPostRideChecks,
    setTripStartedLottieShown,
    setDriverAssignedShown,
    clearAllBookingState,
    setDriverHighlightMessage,
    incrementPickupInstructionsEditCount,
    setRideDriverFlagsPatch,
    setCustomerCallOptionClicked,
    setExtraFareBannerShown,
    setExtraFareConfirmationResponded,
    setExtraFareFirstBannerResponse,
    setAcBannerShown,
    setAcConfirmationResponded,
    setAcFirstBannerResponse,
    setBookingSpecialAssistance,
    assignPendingSpecialAssistance,
} = bookingSlice.actions;

export default bookingSlice;
