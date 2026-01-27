import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import {
    assignPendingSpecialAssistance,
    createRideId,
    setBookedSource,
    setBookedStops,
    setBookingData,
    setBookingSpecialAssistance,
    setDriverHighlightMessage,
} from './client/booking';
import { setPickupInstructions } from './client/session';
import { setRideDetails } from './client/ride';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { BookingId, createBookingId, removeActiveBookingId, setBookingId, setSearchId } from './client/user';
import { persistor, RootState } from './store';
import { getPlaceAddress, getPlaceArea, transformLocationApiEntityToLocation } from '../utils/placeUtils';
import {
    addSearchedStop,
    BottomSheetStage,
    emptyAllSearchedStops,
    setBottomSheetStage,
    setSearchedSource,
    updateSelectedSearchedStop,
} from './client/session';
import { incrementPickupInstructionsEditCount } from './client/session';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen.tsx';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen.tsx';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GeolocationResponse } from '../utils/location';
import { location } from '../../helpers/utils/Location/LocationTypes.gen';

export const setBookingAndRideDetails = (
    bookingDetails: bookingAPIEntity,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
) => {
    const bookingId = createBookingId(bookingDetails.id);
    dispatch(setBookingData({ id: bookingId, payload: bookingDetails }));
    dispatch(assignPendingSpecialAssistance({ id: bookingId, payload: null }));
    const sourceArea = getPlaceArea(bookingDetails.fromLocation);
    const sourceAdreess = getPlaceAddress(bookingDetails.fromLocation);
    dispatch(
        setBookedSource({
            id: bookingId,
            payload: {
                area: sourceArea,
                address: sourceAdreess,
                lat: bookingDetails.fromLocation.lat,
                lng: bookingDetails.fromLocation.lon,
            },
        }),
    );
    const stops = (() => {
        switch (bookingDetails.bookingDetails.TAG) {
            case 'RENTAL':
                return bookingDetails.bookingDetails._0.stopLocation
                    ? [bookingDetails.bookingDetails._0.stopLocation]
                    : [];
            case 'INTER_CITY':
            case 'AMBULANCE':
            case 'DELIVERY':
                return [bookingDetails.bookingDetails._0.toLocation];
            default:
                return bookingDetails.bookingDetails._0.stops.concat([bookingDetails.bookingDetails._0.toLocation]);
        }
    })();
    const bookingStops = stops.map(stop => {
        const destinationArea = getPlaceArea(stop);
        const destinationAddress = getPlaceAddress(stop);
        return {
            area: destinationArea,
            address: destinationAddress,
            lat: stop.lat,
            lng: stop.lon,
        };
    });
    dispatch(setBookedStops({ id: bookingId, payload: bookingStops }));
    if (bookingDetails.rideList[0]) {
        const rideDetails = bookingDetails.rideList[0];
        const rideId = createRideId(rideDetails.id);
        dispatch(setRideDetails({ id: rideId, payload: rideDetails }));
    }
};

export const setLookingForDriversDataInBooking = (
    bookingDetails: bookingAPIEntity,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
) => {
    const source = transformLocationApiEntityToLocation(bookingDetails.fromLocation);
    dispatch(setSearchedSource(source));
    const stops = (() => {
        switch (bookingDetails.bookingDetails.TAG) {
            case 'RENTAL':
                return bookingDetails.bookingDetails._0.stopLocation
                    ? [bookingDetails.bookingDetails._0.stopLocation]
                    : [null];
            case 'INTER_CITY':
            case 'AMBULANCE':
            case 'DELIVERY':
                return [bookingDetails.bookingDetails._0.toLocation];
            default:
                return bookingDetails.bookingDetails._0.stops.concat([bookingDetails.bookingDetails._0.toLocation]);
        }
    })();
    dispatch(emptyAllSearchedStops());
    const transformedStops = stops.map(stop => transformLocationApiEntityToLocation(stop));
    transformedStops.forEach(stop => {
        dispatch(addSearchedStop(stop));
    });
};

export const resetIdsAndPurge = (
    userToken: string | null,
    bookingId: BookingId | null,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
) => {
    resetIds(userToken, bookingId, dispatch);
    persistor.purge();
};

export const resetIds = (
    userToken: string | null,
    bookingId: BookingId | null,
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
    resetSearchId: boolean = true,
) => {
    if (bookingId) {
        dispatch(setDriverHighlightMessage({ id: bookingId, payload: null }));
        dispatch(setBookingSpecialAssistance({ id: bookingId, payload: undefined }));
        dispatch(removeActiveBookingId({ id: userToken, payload: bookingId }));
    }
    // Clear pickup instructions from session when ride ends
    dispatch(setPickupInstructions(null));
    // Reset pickup instructions edit count when ride ends
    dispatch(incrementPickupInstructionsEditCount(0));
    dispatch(setBookingId({ id: userToken, payload: null }));
    if (resetSearchId) {
        dispatch(setSearchId({ id: userToken, payload: null }));
    }
};

export const gotoLookingForRides = (
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
    src = 'gotoLookingForRides',
) => {
    // const currentTime = Date.now();
    // setNumberItem(MMKVKey.PROGRESS_START_TIME, currentTime);
    dispatch(setBottomSheetStage({ stage: BottomSheetStage.LookingForRides, src }));
};

export const goToAutoBooking = ({
    ticketUIRef,
    navigation,
    sourceLocation,
    dispatch,
    recenterLocation,
}: {
    ticketUIRef: React.RefObject<BottomSheetModal | null>;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    sourceLocation: location;
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>;
    recenterLocation: (zoomLevel?: number, position?: GeolocationResponse) => void;
}) => {
    navigation?.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
    recenterLocation(undefined, undefined);
    ticketUIRef?.current?.dismiss();
    dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: '' }));
    dispatch(updateSelectedSearchedStop(sourceLocation));
};

export const goToJourneyDetails = ({
    userToken,
    dispatch,
    navigation,
    destinationStop,
    originStop,
    recentLocationId,
    routeCode,
    startTime,
    vehicleType,
    serviceableStartTime,
    otp,
    isSingleModeMetro = false,
}: {
    userToken: string | null;
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>;
    navigation: NativeStackNavigationProp<MainNavigationParamList> | NativeStackNavigationProp<MainNavigationParamList>;
    destinationStop: transportStation | undefined;
    originStop: transportStation | undefined;
    recentLocationId: string | undefined;
    routeCode: string | undefined;
    startTime: string | undefined;
    vehicleType: VehicleCategory_vehicleCategory | undefined;
    serviceableStartTime: string | undefined;
    otp: string | undefined;
    isSingleModeMetro: boolean;
}) => {
    dispatch(setSearchId({ id: userToken, payload: null }));

    navigation.navigate('ServicesTab', {
        screen: 'singleModeBookingNavigator',
        params: {
            screen: 'journeyDetails',
            params: {
                destinationStop: destinationStop,
                originStop: originStop,
                recentLocationId: recentLocationId,
                routeCode: routeCode,
                startTime: startTime,
                vehicleType: vehicleType,
                serviceableStartTime: serviceableStartTime,
                otp: otp,
                routeCodeEditedManually: false,
                isSingleModeMetro: isSingleModeMetro,
            },
        },
    });
};
