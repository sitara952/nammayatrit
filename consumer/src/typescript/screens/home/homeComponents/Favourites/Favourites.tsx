import React, { useCallback } from 'react';
import { location } from '../../../../../helpers/utils/Location/LocationTypes.gen';
import { useAppDispatch, useAppSelector } from '../../../../state/hooks';
import { getAddressFromComponents } from '../../../../../helpers/utils/Location/LocationUtils.bs';
import {
    BottomSheetStage,
    setBottomSheetStage,
    updateSelectedSearchedStop,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
// import { GeolocationResponse } from '@/typescript/utils/location';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { hapticEffect } from '@/typescript/utils/useHaptic';

import FavouritesComponentFlow from '@/src-v2/components/FavouritesComponent/Flow';
import { FavProps, SavedLocTag } from '@/src-v2/components/FavouritesComponent/types';
import { useHandleCardPress } from '@/src-v2/screens/Search/components/useHandleCardPress';
import { useLocationServices } from '@/typescript/hooks/useLocationServices';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { DEFAULT_CAMERA_ZOOM } from '@/typescript/constants/common';

const trimAndFilterEmpty = (str: string | undefined): string | undefined => {
    if (!str) return undefined;
    const trimmed = str.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

type FavouritesPropsType = {
    showFavoriteTitle: boolean;
};

export const favItemToLocation = (favItem: FavProps): location => {
    const address = [
        favItem.door,
        favItem.building,
        favItem.street,
        favItem.area,
        favItem.city,
        favItem.state,
        favItem.country,
    ]
        .map(trimAndFilterEmpty)
        ?.filter(item => item != undefined)
        .join(', ');

    return {
        title: address,
        subtitle: address,
        lat: favItem.lat,
        lng: favItem.lon,
        specialLocation: undefined,
        placeId: favItem.placeId,
        tag: 'AUTOCOMPLETE',
        addressComponents: getAddressFromComponents(address, undefined, undefined),
        serviceable: true,
        serviceabilityCity: favItem.city,
        formattedAddress: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        hotSpotInfo: undefined,
    };
};

const Favourites: React.FC<FavouritesPropsType> = _props => {
    const dispatch = useAppDispatch();
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const appConfig = useAppSelector(selectAppConfig);
    const isMultiModal = appConfig.appType === 'multimodal';
    const handleCardPress = useHandleCardPress();
    const { recenterLocation } = useLocationServices({ initialize: false });

    const handleOnClick = useCallback(
        (locationDetails: FavProps) => {
            hapticEffect(HapticFeedbackTypes.impactMedium, undefined);
            switch (locationDetails.savedLocType) {
                case SavedLocTag.ADD_HOME:
                    navigation.navigate('addFavourite', {
                        intendedTag: 'Home',
                        editLocation: undefined,
                        location: undefined,
                    });
                    return;
                case SavedLocTag.ADD_WORK:
                    navigation.navigate('addFavourite', {
                        intendedTag: 'Work',
                        editLocation: undefined,
                        location: undefined,
                    });
                    return;
                case SavedLocTag.ADD_FAV:
                    navigation.navigate('addFavourite', {
                        intendedTag: 'Favourite',
                        editLocation: undefined,
                        location: undefined,
                    });
                    return;
                default: {
                    const newLocation = favItemToLocation(locationDetails);
                    if (isMultiModal) {
                        handleCardPress(newLocation);
                    } else {
                        recenterLocation(DEFAULT_CAMERA_ZOOM, undefined);
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: '' }));
                        dispatch(updateSelectedSearchedStop(newLocation));
                    }
                }
            }
        },
        [navigation, hapticEffect, isMultiModal, handleCardPress, recenterLocation, dispatch],
    );

    return (
        <FavouritesComponentFlow
            onFavouriteItemPress={handleOnClick}
            showTitle={false}
            initialLeftPadding={22}
            gap={8}
            favTagsStyle={undefined}
            isMultiModal={isMultiModal}
        />
    );
};

export default Favourites;
