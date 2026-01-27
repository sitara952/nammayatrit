import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { createDispatcher } from '@/typescript/utils/common';
import { FavouriteLocation, ManageFavouritesAction, TagType } from '../Types';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useSavedLocations } from '@/typescript/hooks/useSavedLocations';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import { getPlaceAddress, getPlaceArea } from '@/typescript/utils/placeUtils';
import ManageFavouriteUI from '../UI/ManageFavourite';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setToastProps } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const tranformLocation = (location: savedReqLocationAPIEntity): location => {
    const locationWithTitle = { ...location, title: undefined };
    const address = getPlaceAddress(locationWithTitle);
    const title = getPlaceArea(locationWithTitle);
    return {
        lat: location.lat,
        lng: location.lon,
        placeId: location.placeId,
        title: title,
        subtitle: address,
        formattedAddress: address,
        tag: 'AUTOCOMPLETE',
        addressComponents: {
            area: location.area,
            areaCode: location.areaCode,
            building: location.building,
            city: location.city,
            country: location.country,
            door: location.door,
            extras: undefined,
            instructions: undefined,
            placeId: location.placeId,
            state: location.state,
            street: location.street,
            title: title,
            ward: location.ward,
        },
        serviceable: true,
        serviceabilityCity: undefined,
        specialLocation: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        hotSpotInfo: undefined,
    };
};

const ManageFavourite = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { savedLocations, saveLocation, deleteLocation } = useSavedLocations();
    const editFavouriteModalRef = useRef<BottomSheetModal>(null);
    const locationDeleteModalRef = useRef<BottomSheetModal>(null);
    const driversDeleteModalRef = useRef<BottomSheetModal>(null);
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [activeTab, setActiveTab] = useState<'Drivers' | 'Location'>('Location');

    const getTags = (location: savedReqLocationAPIEntity): TagType => {
        return location.tag.toLowerCase() == 'home'
            ? 'Home'
            : location.tag.toLowerCase() == 'work'
              ? 'Work'
              : 'Favourite';
    };

    const favouriteLocations = useMemo(
        () =>
            savedLocations?.map((location, index) => ({
                id: index,
                locationAddress: tranformLocation(location),
                tag: getTags(location),
                locationName: location.tag || location.locationName || '',
                tagName:
                    location.tag.toLowerCase() == 'home'
                        ? userLanguageStrings.Home
                        : location.tag.toLowerCase() == 'work'
                          ? userLanguageStrings.Work
                          : userLanguageStrings.Favourites,
            })) || [],
        [savedLocations],
    );

    const existingTags = useMemo(() => {
        return favouriteLocations?.reduce((acc: string[], location: FavouriteLocation) => {
            if (location.tag === 'Home') {
                return [...acc, 'Home'];
            } else if (location.tag === 'Work') {
                return [...acc, 'Work'];
            } else {
                return [...acc, location.locationName];
            }
        }, []);
    }, [favouriteLocations]);

    const resolver = useCallback(async (action: ManageFavouritesAction) => {
        switch (action.type) {
            case 'ENTER_FAVOURITE':
                if (action.payload) {
                    navigation.navigate('addFavourite', {
                        intendedTag: action.payload.intendedTag,
                        editLocation: undefined,
                        location: undefined,
                    });
                } else {
                    // Fallback or error handling if payload is unexpectedly missing
                    navigation.navigate('addFavourite');
                }
                break;
            case 'UPDATE_FAVOURITE':
                if (
                    action.payload &&
                    action.payload.oldTag &&
                    action.payload.location.lat &&
                    action.payload.location.lng
                ) {
                    try {
                        editFavouriteModalRef.current?.dismiss();
                        await deleteLocation(action.payload.oldTag);
                        await saveLocation({
                            area: action.payload.location.addressComponents?.area,
                            areaCode: action.payload.location.addressComponents?.areaCode,
                            building: action.payload.location.addressComponents?.building,
                            city: action.payload.location.addressComponents?.city,
                            country: action.payload.location.addressComponents?.country,
                            door: action.payload.location.addressComponents?.door,
                            isMoved: false,
                            lat: action.payload.location.lat,
                            lon: action.payload.location.lng,
                            placeId: action.payload.location.placeId,
                            state: action.payload.location.addressComponents?.state,
                            street: action.payload.location.addressComponents?.street,
                            tag:
                                action.payload.newTag === 'Favourite'
                                    ? action.payload.newLocationName || action.payload.newTag
                                    : action.payload.newTag,
                            ward: action.payload.location.addressComponents?.ward,
                        });

                        dispatch(
                            setToastProps({
                                visible: true,
                                message: userLanguageStrings.FavouriteUpdatedSuccessfully(
                                    action.payload.newTag === 'Favourite'
                                        ? action.payload.newLocationName || action.payload.newTag
                                        : action.payload.newTag,
                                ),
                                backgroundColor: 'green',
                                autoDismissAfter: 3500,
                                logo: undefined,
                                buttons: [],
                                useSpannedToast: undefined,
                                bottomSpanDescription: undefined,
                                spannerType: undefined,
                                dismissButton: undefined,
                                onSpannedToastLoad: undefined,
                                margin: undefined,
                                customToast: undefined,
                            }),
                        );
                    } catch (error) {
                        console.error(error);
                    }
                }
                break;
            case 'DELETE_FAVOURITE':
                if (action.payload) {
                    try {
                        editFavouriteModalRef.current?.dismiss();
                        await deleteLocation(action.payload);

                        dispatch(
                            setToastProps({
                                visible: true,
                                message: userLanguageStrings.Favouritedeletedsuccessfully,
                                backgroundColor: 'green',
                                autoDismissAfter: 3500,
                                logo: undefined,
                                buttons: [],
                                useSpannedToast: undefined,
                                bottomSpanDescription: undefined,
                                spannerType: undefined,
                                dismissButton: undefined,
                                onSpannedToastLoad: undefined,
                                margin: undefined,
                                customToast: undefined,
                            }),
                        );
                    } catch (error) {
                        console.error(error);
                    }
                }
                break;
            case 'GO_BACK':
                editFavouriteModalRef.current?.dismiss();
                driversDeleteModalRef.current?.dismiss();
                locationDeleteModalRef.current?.dismiss();
                navigation.goBack();
                break;
            case 'SET_ACTIVE_TAB':
                if (action.payload) {
                    setActiveTab(action.payload);
                }
                break;
        }
    }, []);

    const mcDispatch = createDispatcher(resolver);

    return (
        <ManageFavouriteUI
            mcDispatch={mcDispatch}
            existingTags={existingTags}
            favouriteLocations={favouriteLocations ?? []}
            activeTab={activeTab}
            editFavouriteModalRef={editFavouriteModalRef}
            locationDeleteModalRef={locationDeleteModalRef}
            driversDeleteModalRef={driversDeleteModalRef}
        />
    );
};

export default ManageFavourite;
