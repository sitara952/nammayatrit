import React, { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import HomeScreenUI from './UI';
import { HomeScreenAction } from './Types';
import { GeolocationResponse } from '@/typescript/utils/location';
import { EdgePadding } from 'react-native-maps';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    BottomSheetStage,
    SearchInput,
    selectBottomSheetStage,
    setActiveInput,
    setBottomSheetStage,
    updateSelectedSearchedStop,
} from '@/typescript/state/client/session';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { selectIsServiceable, selectAppConfig } from '@/typescript/state/client/session';
import { useHandleCardPress } from '@/src-v2/screens/Search/components/useHandleCardPress';
import { FavProps, SavedLocTag } from '@/src-v2/components/FavouritesComponent/types'; // Combined SavedLocTag here
import { favItemToLocation } from '@/typescript/screens/home/homeComponents/Favourites/Favourites';
import { HomeScreenServices } from '../SingleModeSearch/Types';
// Added TagType import
import { strings } from 'config-types';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { DEFAULT_CAMERA_ZOOM } from '@/typescript/constants/common';

type MultimodalHomeProps = {
    recenterLocation: (zoomLevel: number | undefined, position: GeolocationResponse | undefined) => void;
    addStaticMapPadding: ((params: Partial<EdgePadding>) => void) | undefined;
    isVisible: boolean;
    onHeightChange: ((height: number) => void) | undefined;
    isLiveBusTracking: boolean;
};

const MultimodalHome: React.FC<MultimodalHomeProps> = ({
    recenterLocation,
    addStaticMapPadding,
    isVisible,
    onHeightChange,
    isLiveBusTracking,
}) => {
    const dispatch = useAppDispatch();
    const isServiceable = useAppSelector(selectIsServiceable);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);

    const handleSingleModeBooking = useCallback(
        (bookingType: HomeScreenServices) => {
            switch (bookingType) {
                case 'Bus':
                    logEvent(EventName.MT_HOME_BUS_OTP);
                    navigation.navigate('HomeTab', {
                        screen: 'busOtpFlow',
                        params: {
                            state: 'Booking',
                            params: undefined,
                            displaySearchBar: true,
                            activePassId: undefined,
                            locationData: undefined,
                        },
                    });
                    break;
                case 'Train':
                    navigation.navigate('ServicesTab', {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'metroSubwayBooking',
                            params: {
                                vehicleType: 'SUBWAY',
                                station: undefined,
                                triggerEditDestination: undefined,
                            },
                        },
                    });
                    break;
                case 'Metro':
                    navigation.navigate('ServicesTab', {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'metroSubwayBooking',
                            params: { vehicleType: 'METRO', station: undefined, triggerEditDestination: undefined },
                        },
                    });
                    break;
                case 'Passes':
                    navigation.navigate('mainTabNavigation', { screen: 'passesTab_homeScreen' });
                    break;
                default:
                    break;
            }
        },
        [navigation],
    );

    const handleAction = useCallback(
        (action: HomeScreenAction, userLanguageStrings: strings) => {
            switch (action.type) {
                case 'PLAN_JOURNEY':
                    logEvent(EventName.MT_HOME_PLAN_JOURNEY);
                    recenterLocation(undefined, undefined);
                    dispatch(setActiveInput(SearchInput.Destination));
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'mm_home' }));
                    hapticEffect(HapticFeedbackTypes.selection, undefined);
                    break;
                case 'VIEW_ALL_PLACES': {
                    const { category } = action.payload;
                    Alert.alert(userLanguageStrings.ViewAll, userLanguageStrings.YouSelectedToViewAllPlaces(category));
                    // TODO: Implement view all places logic
                    break;
                }
                case 'RECENTER_MAP':
                    recenterLocation(undefined, undefined);
                    break;
                case 'GO_TO_SINGLE_MODE_BOOKING':
                    if (action.payload) handleSingleModeBooking(action.payload.bookingType);
                    // navigation.navigate('busOTPViaTicketBookingFlow');
                    break;
                case 'GO_TO_OTP_BUS':
                    navigation.navigate('HomeTab', {
                        screen: 'busOtpFlow',
                        params: {
                            state: 'Booking',
                            params: undefined,
                            displaySearchBar: false,
                            activePassId: undefined,
                            locationData: undefined,
                        },
                    });
                    break;
                default:
                    break;
            }
        },
        [recenterLocation],
    );

    useEffect(() => {
        if (addStaticMapPadding) addStaticMapPadding({ top: 0, right: 0, bottom: 300, left: 0 });
        setTimeout(() => {
            recenterLocation(undefined, undefined);
        }, 200);
    }, [addStaticMapPadding]);

    const handleCardPress = useHandleCardPress();
    const appConfig = useAppSelector(selectAppConfig);
    const isMultiModal = appConfig.appType === 'multimodal';

    const handleOnClick = useCallback(
        (locationDetails: FavProps) => {
            if (locationDetails.savedLocType === SavedLocTag.ADD_HOME) {
                navigation.navigate('addFavourite', {
                    intendedTag: 'Home',
                    editLocation: undefined,
                    location: undefined,
                });
                return;
            }
            if (locationDetails.savedLocType === SavedLocTag.ADD_WORK) {
                navigation.navigate('addFavourite', {
                    intendedTag: 'Work',
                    editLocation: undefined,
                    location: undefined,
                });
                return;
            }
            if (locationDetails.savedLocType === SavedLocTag.ADD_FAV) {
                navigation.navigate('addFavourite', {
                    intendedTag: 'Favourite',
                    editLocation: undefined,
                    location: undefined,
                });
                return;
            }

            const newLocation = favItemToLocation(locationDetails);
            if (isMultiModal) {
                handleCardPress(newLocation);
            } else {
                recenterLocation(DEFAULT_CAMERA_ZOOM, undefined);
                dispatch(updateSelectedSearchedStop(newLocation));
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'fav' }));
            }
        },
        [navigation, isMultiModal, handleCardPress, recenterLocation, dispatch],
    );

    return (
        <HomeScreenUI
            mpDispatch={handleAction}
            isCurrentLocationServiceable={isServiceable}
            favoritesOnClick={handleOnClick}
            isVisible={isVisible}
            onHeightChange={onHeightChange ?? (() => {})}
            bottomSheetStage={bottomSheetStage}
            isLiveBusTracking={isLiveBusTracking}
        />
    );
};

export default React.memo(MultimodalHome);
