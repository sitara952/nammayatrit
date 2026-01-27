import { useCallback, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createDispatcher } from '@/typescript/utils/common';
import { AddFavouritesAction, AddFavouritesState } from '../Types';
import useAutocomplete from '../hooks/useAutocomplete';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useSavedLocations } from '@/typescript/hooks/useSavedLocations';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import AddFavouriteUI from '../UI/AddFavourite';
import { selectCurrentLocation, setToastProps } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { useAppDispatch } from '@/typescript/state/hooks';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { Keyboard } from 'react-native';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import useKeyBoardMovement from '@/src-v2/hooks/useKeyBoardMovement';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const AddFavourite = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'addFavourite'>>();
    const editLocationValue = route.params?.editLocation;
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { searchData, locationSearchStatus, searchText, setSearchText } = useAutocomplete(editLocationValue);
    const [addFavouriteState, setAddFavouriteState] = useState<AddFavouritesState>('search');
    const { savedLocations, saveLocation } = useSavedLocations();

    const [selectedLocation, setSelectedLocation] = useState<location | undefined>();
    const currentLocation = useAppSelector(selectCurrentLocation);
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { addFavouriteModalRef } = useRefsContext();

    const existingTags = useMemo(() => {
        return savedLocations?.reduce((acc: string[], location: savedReqLocationAPIEntity) => {
            if (location.tag.toLowerCase() == 'home') {
                return [...acc, 'Home'];
            } else if (location.tag.toLowerCase() == 'work') {
                return [...acc, 'Work'];
            } else {
                return [...acc, location.tag || location.locationName || ''];
            }
        }, []);
    }, [savedLocations]);

    useKeyBoardMovement(addFavouriteModalRef);

    const handleBack = useCallback(async () => {
        Keyboard.dismiss();
        if (addFavouriteState === 'choose-tag') {
            setAddFavouriteState('confirm-location');
        } else if (addFavouriteState === 'confirm-location') {
            setAddFavouriteState('search');
        } else if (addFavouriteState === 'search') {
            navigation.goBack();
        }
    }, [addFavouriteState, navigation]);

    const resolver = useCallback(
        async (action: AddFavouritesAction) => {
            switch (action.type) {
                case 'SAVE_FAVOURITE':
                    if (action.payload && action.payload.location.lat && action.payload.location.lng) {
                        try {
                            Keyboard.dismiss();
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
                                    action.payload.tag === 'Favourite'
                                        ? action.payload.locationName || action.payload.tag
                                        : action.payload.tag,
                                ward: action.payload.location.addressComponents?.ward,
                            });

                            dispatch(
                                setToastProps({
                                    visible: true,
                                    message: userLanguageStrings.XAddedSuccessfully(
                                        action.payload.tag === 'Favourite'
                                            ? action.payload.locationName || action.payload.tag
                                            : action.payload.tag,
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
                            navigation.goBack();
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    break;
                case 'SET_SEARCH_TEXT':
                    if (action.payload) {
                        setSearchText(action.payload);
                    } else {
                        setSearchText('');
                    }
                    break;
                case 'GO_BACK':
                    handleBack();
                    break;
            }
        },
        [handleBack, navigation],
    );

    const mcDispatch = createDispatcher(resolver);

    return (
        <AddFavouriteUI
            mcDispatch={mcDispatch}
            existingTags={existingTags || []}
            searchText={searchText}
            currentLocation={currentLocation}
            locationSearchStatus={locationSearchStatus}
            searchData={searchData}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            addFavouriteState={addFavouriteState}
            setAddFavouriteState={setAddFavouriteState}
        />
    );
};

export default AddFavourite;
