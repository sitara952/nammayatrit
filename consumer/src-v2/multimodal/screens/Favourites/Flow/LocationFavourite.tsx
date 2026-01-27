import React, { useRef, useState, useCallback, useMemo } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FavouriteLocation, LocationFavouriteAction, LocationFavouriteProps, ManageFavouritesProps } from '../Types';
import LocationFavouriteUI from '../UI/LocationFavourite';
import { Resolver } from '@/typescript/utils/common';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Keyboard } from 'react-native';

const LocationFavouriteFlow = (props: ManageFavouritesProps) => {
    const { mcDispatch, favouriteLocations, editFavouriteModalRef, locationDeleteModalRef } = props;
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const swipeableRefs = useRef<Array<SwipeableMethods | null>>(favouriteLocations.map(() => null));
    const [selectedFavourite, setSelectedFavourite] = useState<FavouriteLocation | null>(null);

    const getEditLocation = useMemo(() => {
        const address = selectedFavourite?.locationAddress.addressComponents;
        if (!address) return '';
        return [address.building, address.street, address.city, address.state, address.country]
            .filter(Boolean)
            .join(', ');
    }, [selectedFavourite]);

    const lfDispatch: Resolver<LocationFavouriteAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'DISMISS_EDIT_MODAL':
                    Keyboard.dismiss();
                    editFavouriteModalRef.current?.dismiss();
                    break;
                case 'SWIPEABLE_DELETE':
                    if (action.payload) {
                        editFavouriteModalRef.current?.dismiss();
                        setSelectedFavourite(action.payload.favourite);
                        swipeableRefs.current[action.payload.index]?.close();
                        locationDeleteModalRef.current?.present();
                    }
                    break;
                case 'SWIPEABLE_EDIT':
                    if (action.payload) {
                        setSelectedFavourite(action.payload.favourite);
                        swipeableRefs.current[action.payload.index]?.close();
                        editFavouriteModalRef.current?.present();
                    }
                    break;
                case 'LIST_ITEM_PRESS':
                    if (action.payload) {
                        setSelectedFavourite(action.payload);
                        editFavouriteModalRef.current?.present();
                    }
                    break;
                case 'CONFIRM_EDIT':
                    if (action.payload) {
                        mcDispatch({
                            type: 'UPDATE_FAVOURITE',
                            payload: {
                                oldTag:
                                    selectedFavourite?.tag === 'Favourite'
                                        ? selectedFavourite.locationName
                                        : selectedFavourite?.tag,
                                location: action.payload.location,
                                newTag: action.payload.tag,
                                newLocationName: action.payload.favouriteName,
                            },
                        });
                    }
                    break;
                case 'CHANGE_LOCATION':
                    editFavouriteModalRef.current?.dismiss();
                    navigation.navigate('addFavourite', {
                        intendedTag: action.payload ? action.payload.intendedTag : undefined,
                        editLocation: getEditLocation,
                        location: selectedFavourite?.locationAddress,
                    });
                    break;
                case 'DELETE_FROM_EDIT_MODAL':
                    Keyboard.dismiss();
                    editFavouriteModalRef.current?.close();
                    locationDeleteModalRef.current?.present();
                    break;
                case 'CONFIRM_DELETE':
                    editFavouriteModalRef.current?.dismiss();
                    locationDeleteModalRef.current?.dismiss();
                    mcDispatch({
                        type: 'DELETE_FAVOURITE',
                        payload:
                            selectedFavourite?.tag === 'Favourite'
                                ? selectedFavourite.locationName
                                : selectedFavourite?.tag,
                    });
                    break;
                case 'CANCEL_DELETE':
                    locationDeleteModalRef.current?.dismiss();
                    editFavouriteModalRef.current?.present();
                    break;
            }
        },
        [mcDispatch, selectedFavourite],
    );

    const hasWorkFavourite = useMemo(
        () => favouriteLocations.some(favourite => favourite.tag === 'Work'),
        [favouriteLocations],
    );
    const hasHomeFavourite = useMemo(
        () => favouriteLocations.some(favourite => favourite.tag === 'Home'),
        [favouriteLocations],
    );

    const locationFavouriteProps: LocationFavouriteProps & {
        locationDeleteModalRef: React.RefObject<BottomSheetModal | null>;
        selectedFavourite: FavouriteLocation | null;
        hasWorkFavourite: boolean;
        hasHomeFavourite: boolean;
    } = {
        ...props,
        lfDispatch,
        locationDeleteModalRef,
        selectedFavourite,
        hasWorkFavourite,
        hasHomeFavourite,
    };

    return <LocationFavouriteUI {...locationFavouriteProps} />;
};

export default LocationFavouriteFlow;
