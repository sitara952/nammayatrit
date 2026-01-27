import { location } from '@/helpers/utils/Location/LocationTypes.gen.tsx';
import { AppDispatch } from '../state/store';
import { MapRef } from '../Maps/MapComponent';
import {
    BottomSheetStage,
    setBottomSheetStage,
    setCurrentLocationCoords,
    setFareProductType,
    setOnRecenter,
    setPickupTime,
    setRentalDistance,
    setRideDuration,
    setSearchedSource,
    setChooseRideGoBackStage,
    updateSelectedSearchedStop,
    setGoBackToRental,
    selectAppConfig,
} from '../state/client/session';
import { GeolocationResponse, getCurrentLocation } from './location';
import { DEFAULT_CAMERA_ZOOM } from '../constants/common';
import { isEqual } from 'lodash';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList';
import { emptyJourneyDetailsProps } from '@/src-v2/multimodal/screens/JourneyInfoScreen';

export type MiniumLocationCell = {
    lat: number;
    lon: number;
    title: string;
    fullAddress: string;
};

export type MinumimRideSchedulingCell = {
    duration: number; // in hrs
};

export const useSearchUtils = () => {
    const dispatch = useAppDispatch();
    const appConfig = useAppSelector(selectAppConfig);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const searchForRides = (
        confirmPickup: boolean,
        source: location,
        dest: location | undefined,
        mapRef: React.RefObject<MapRef | null>,
        currentLocationCoords: GeolocationResponse | null,
        bottomSheetStage: BottomSheetStage,
        rentalData: MinumimRideSchedulingCell | undefined,
        returnBackToStage: BottomSheetStage | undefined,
        isInterCity: boolean,
    ) => {
        dispatch(setChooseRideGoBackStage(returnBackToStage ?? BottomSheetStage.Home));
        if (rentalData) {
            // rental search
            const dist = getRentalDistFromDuration(rentalData.duration);
            dispatch(setFareProductType('RENTAL'));
            dispatch(setSearchedSource(source));
            dispatch(setRideDuration(rentalData.duration * 3600));
            if (dist) dispatch(setRentalDistance(dist));
            dispatch(setPickupTime(new Date().toISOString()));
            dispatch(
                setBottomSheetStage({
                    stage: confirmPickup ? BottomSheetStage.ConfirmPickup : BottomSheetStage.ChooseRide,
                    src: 'searchForRides_rental',
                }),
            );
        } else if (dest) {
            // normal search
            if (!confirmPickup) {
                if (isInterCity) {
                    dispatch(setFareProductType('INTERCITY'));
                    dispatch(setPickupTime(new Date().toISOString()));
                }
                dispatch(setSearchedSource(source));
                dispatch(updateSelectedSearchedStop(dest));
                if (appConfig.appType === 'multimodal') {
                    navigation.navigate(
                        'ServicesTab',
                        {
                            screen: 'singleModeBookingNavigator',
                            params: {
                                screen: 'journeyDetails',
                                params: emptyJourneyDetailsProps,
                            },
                        },
                        { pop: true },
                    );
                } else {
                    dispatch(setFareProductType(null));
                    dispatch(setGoBackToRental(false));
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'searchForRides_dest' }));
                }
                mapRef.current?.addStaticMapPadding({
                    left: undefined,
                    top: undefined,
                    right: undefined,
                    bottom: 0,
                });
            } else {
                dispatch(setFareProductType(null));
                dispatch(setGoBackToRental(false));
                recenterLocationAsync(undefined, undefined, mapRef, dispatch, currentLocationCoords, bottomSheetStage);
                dispatch(updateSelectedSearchedStop(dest));
                dispatch(
                    setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'searchForRides_dest_confirm' }),
                );
            }
        }
    };

    return {
        searchForRides,
    };
};

async function recenterLocationAsync(
    zoomLevel: number | undefined,
    position: GeolocationResponse | undefined,
    mapRef: React.RefObject<MapRef | null>,
    dispatch: AppDispatch,
    currentLocationCoords: GeolocationResponse | null,
    bottomSheetStage: BottomSheetStage,
) {
    const location = position ? position : await getCurrentLocation();
    if (location) {
        mapRef.current?.animateCamera({
            lat: location?.coords?.latitude,
            lon: location?.coords?.longitude,
            zoom: zoomLevel ?? DEFAULT_CAMERA_ZOOM,
            duration: 500,
        });
        !isEqual(currentLocationCoords, location) && dispatch(setCurrentLocationCoords(location));
    }
    if (bottomSheetStage !== BottomSheetStage.Home) {
        dispatch(setOnRecenter(true));
    }
}

function getRentalDistFromDuration(duration: number): number | undefined {
    if (duration > 0 && duration <= 12) {
        return duration * 10 * 1000;
    }
    return undefined;
}
