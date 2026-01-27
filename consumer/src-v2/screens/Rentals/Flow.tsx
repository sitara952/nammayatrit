import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import {
    BottomSheetStage,
    selectCurrentLocation,
    selectSearchedSource,
    selectSearchedStops,
    setBottomSheetStage,
    setFareProductType,
    setPickupTime,
    setGoBackToRental,
    setSearchedSource,
    updateSearchedStop,
    clearRideDuration,
    selectRideDuration,
    selectStopLocationsTextInput,
    updateStopLocationTextInput,
} from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LocationType, RentalScreenAction, RentalScreenViewProps } from './Types';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { RentalScreenView } from './UI';
import { selectActiveBookingIds } from '@/typescript/state/client/user';
import { selectAllBooking } from '@/typescript/state/client/booking';
import { isNull } from 'lodash';
import { checkOverlap } from '@/typescript/utils/bookingUtils';
import { BackHandler } from 'react-native';

export const RentalScreenFlow = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();
    const currentLocation = useAppSelector(selectCurrentLocation);
    const source = useAppSelector(selectSearchedSource);
    const stops = useAppSelector(selectSearchedStops);
    const destination = stops[stops.length - 1] ?? null;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { rentalPolicyModalRef, genericSearchModalRef } = useRefsContext();
    const [dateTime, setDateTime] = useState<Date | null>(null);
    const [popupOverlappingTime, setPopupOverlappingTime] = useState('');
    const destinationLocationsTextInput = useAppSelector(state =>
        selectStopLocationsTextInput(state, stops.length - 1),
    );

    const [selectLocationType, setSelectLocationType] = useState<LocationType>(LocationType.Source);

    const handleBackPress = useCallback(() => {
        requestAnimationFrame(() => {
            dispatch(setSearchedSource(currentLocation));
        });
        dispatch(updateStopLocationTextInput({ index: 0, text: '' }));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'rentals_back_press' }));
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });
        }
        return false;
    }, [currentLocation, navigation]);

    useEffect(() => {
        const backPressListener = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => {
            backPressListener.remove();
        };
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [handleBackPress]);

    const handleInfoClick = () => {
        rentalPolicyModalRef.current?.present();
    };

    const onClickContinue = () => {
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'rentals_onClickContinue' }));
        navigation.navigate(
            'mainTabNavigation',
            {
                screen: 'homeTab_homeScreen',
            },
            { pop: true },
        );
        dispatch(setFareProductType('RENTAL'));
        dispatch(setPickupTime(dateTime !== null ? dateTime.toISOString() : new Date().toISOString()));
        dispatch(setGoBackToRental(true));
        if (!destinationLocationsTextInput || destinationLocationsTextInput === '') {
            dispatch(updateSearchedStop({ index: 0, location: null }));
        }
    };

    const genericSearchBackPress = () => {
        genericSearchModalRef?.current?.dismiss();
    };
    const onSearchCardClick = async (location: location) => {
        if (selectLocationType === LocationType.Source) dispatch(setSearchedSource(location));
        else {
            dispatch(updateStopLocationTextInput({ index: 0, text: `${location.title} ${location.subtitle}` }));
            dispatch(updateSearchedStop({ index: 0, location }));
        }
        genericSearchModalRef?.current?.dismiss({ duration: 500 });
    };

    const onLocateOnMapClick = () => {
        navigation.navigate('locateOnMap', {
            lat: currentLocation?.lat ?? 0,
            lng: currentLocation?.lng ?? 0,
            locationType: selectLocationType,
            onLocationConfirm: onSearchCardClick,
            title:
                selectLocationType === LocationType.Source
                    ? userLanguageStrings.SelectSource
                    : userLanguageStrings.SelectDestination,
            subTitle: '',
            ctaText:
                selectLocationType === LocationType.Source
                    ? userLanguageStrings.ConfirmSource
                    : userLanguageStrings.ConfirmDestination,
        });
        genericSearchModalRef?.current?.dismiss();
    };

    const selectSourceLocation = () => {
        setSelectLocationType(LocationType.Source);
        genericSearchModalRef?.current?.present();
    };

    const selectDestinationLocation = () => {
        setSelectLocationType(LocationType.Destination);
        genericSearchModalRef?.current?.present();
    };

    const { overlappingRideExistModalRef, dateTimePickerBottomSheetModalRef } = useRefsContext();
    const maxPossibleDate = new Date();
    maxPossibleDate.setDate(maxPossibleDate.getDate() + 5);
    const minPossibleDate = new Date();
    minPossibleDate.setMinutes(minPossibleDate.getMinutes() + 30);

    const clockClick = () => {
        dateTimePickerBottomSheetModalRef.current?.present();
    };
    const overlappingPollingTime = 30 * 60;
    const activeBookingIds = useAppSelector(selectActiveBookingIds);
    const allBookings = useAppSelector(selectAllBooking);
    const rentalDuration = useAppSelector(selectRideDuration) ?? 0;
    const activeBookingDetails = allBookings
        ? activeBookingIds
              .map(id => (allBookings[id] ? allBookings[id].bookingDetails : null))
              .filter(booking => !isNull(booking))
        : [];
    const handleDateChange = (date: Date | undefined) => {
        if (!date) return;
        const result = checkOverlap({
            rideStartTime: date.toISOString(),
            rideEndTime: new Date(date.getTime() + rentalDuration * 1000).toISOString(),
            activeBookingDetails,
            overlappingPollingTime,
        });

        if (result.overLapping && result.overLappedBookingTime) {
            setPopupOverlappingTime(result.overLappedBookingTime);
            dateTimePickerBottomSheetModalRef.current?.dismiss();
            overlappingRideExistModalRef.current?.present();
        } else {
            setDateTime(date);
        }
    };

    const locationPlaceHolder = (selectLocationType: LocationType): string => {
        if (selectLocationType === LocationType.Source) {
            return userLanguageStrings.Entersource;
        } else {
            return userLanguageStrings.Enterdestination;
        }
    };

    const resolver: Resolver<RentalScreenAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HANDLE_BACKPRESS':
                    clearRideDuration();
                    handleBackPress();
                    break;
                case 'SELECT_SOURCE_LOCATION':
                    selectSourceLocation();
                    break;
                case 'SELECT_DESTINATION_LOCATION':
                    selectDestinationLocation();
                    break;
                case 'CONTINUE_CLICKED':
                    onClickContinue();
                    break;
                case 'HANDLE_DATE_CHANGE':
                    handleDateChange(action.payload?.newDate);
                    break;
                case 'CLOCK_CLICK':
                    clockClick();
                    break;
                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [handleBackPress, onClickContinue, selectSourceLocation, selectDestinationLocation],
    );

    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const rentalScreenViewState: RentalScreenViewProps = {
        source,
        destination,
        destinationLocationsTextInput,
        currentLocation,
        selectLocationType,
        handleInfoClick,
        onSearchCardClick,
        locationPlaceHolder,
        genericSearchBackPress,
        onLocateOnMapClick,
        rcsDispatch,
        dateTime,
        maxPossibleDate,
        minPossibleDate,
        dateTimePickerBottomSheetModalRef,
        popupOverlappingTime,
    };

    return <RentalScreenView {...rentalScreenViewState} />;
};
