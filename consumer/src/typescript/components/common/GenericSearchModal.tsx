import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../../designSystem/tokens';
import Button from '@/src-v2/primitives/Button';
import LeftArrow from '../../assets/svg/direction/LeftArrow';
import { location, locationWithServiceability } from '../../../helpers/utils/Location/LocationTypes.gen';
import Animated from 'react-native-reanimated';
import Input from '../../designSystem/components/primitives/Input';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { debounce } from 'lodash';
import { useLocationPredictions, UseLocationPredictionsProps } from '@/typescript/hooks/useLocationPredictions';
import { LocationList } from '@/src-v2/screens/Search/components/LocationsList';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import mtIcSearchEmpty from '@/typescript/assets/ny-service/mt_ic_search_empty.webp';
import { TextInput } from 'react-native-gesture-handler';
import { LocationObjectCaching } from '@/helpers/utils/Location/LocationCaching.bs';
import { safelyRunUIOperation } from '@/typescript/designSystem/components/InputGroup';
import { KeyboardController } from 'react-native-keyboard-controller';
import { FloatingMapButton } from '@/src-v2/screens/Search/components/FloatingMapButton';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

interface GenericSearchModalProps {
    lat: number | undefined;
    lon: number | undefined;
    placeHolderText: string;
    onCardClick: (location: location) => void;
    onBackPress: () => void;
    onLocateMapPress: () => void;
    searchedLocationText: string | undefined;
    locationType: 'source' | 'destination' | 'stop' | 'rental_add_edit_stop';
}

const GenericSearchModal: React.FC<GenericSearchModalProps> = ({
    lat,
    lon,
    placeHolderText = 'Enter location',
    onCardClick,
    onBackPress,
    onLocateMapPress,
    locationType = 'source',
    searchedLocationText,
}) => {
    const [predictLocations, { data: searchData, locationSearchStatus }] = useLocationPredictions();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleAutoCompleteSearch = async (searchText: string) => {
        const source = { lat: lat, lng: lon };
        const predictionProp: UseLocationPredictionsProps = {
            input: searchText,
            lat: source?.lat,
            lng: source?.lng,
            isPickup: false,
            currentCoords: {
                lat: source?.lat,
                lng: source?.lng,
            },
        };
        predictLocations(predictionProp);
    };
    const { bottom } = useSafeAreaInsets();
    const LocationTextInputRef = useRef<TextInput>(null);
    const [LocationsTextInput, setLocationsTextInput] = React.useState(searchedLocationText ?? '');
    const debouncedHandleSearch = debounce(handleAutoCompleteSearch, 500);
    const locationByPlaceId = async (item: location) => {
        const result: locationWithServiceability =
            await GetLocationAndServiceability.getLocationObjectAndServiceability(
                {
                    TAG: 'PlaceByPlaceId',
                    _0: {
                        contents: item.placeId ?? '',
                        tag: '',
                    },
                },
                item?.title,
                item?.subtitle,
                item?.locationType,
                locationType === 'source' ? locationType : 'destination',
            );
        return result.location;
    };

    const [serviceable, setIsServiceable] = React.useState(true);

    const onPress = async (item: location) => {
        const locationItemByPlaceId = await locationByPlaceId(item);
        const revisedLocation: location = {
            ...locationItemByPlaceId,
            addressComponents: item.addressComponents,
            tag: 'RECENTS',
        };
        if (revisedLocation.serviceable) {
            LocationObjectCaching.setRecentSearches(revisedLocation);
        } else {
            setIsServiceable(false);
            if (LocationTextInputRef.current) {
                LocationTextInputRef.current?.setSelection(0, LocationsTextInput.length);
            }
            return;
        }
        onCardClick(revisedLocation);
    };

    useEffect(() => {
        debouncedHandleSearch(LocationsTextInput);
        return () => {
            debouncedHandleSearch.cancel();
        };
    }, [LocationsTextInput]);

    useEffect(() => {
        if (LocationTextInputRef.current) {
            LocationTextInputRef.current?.setSelection(0, LocationsTextInput.length);
        }
    }, []);

    // Use the custom hook for debounced back press handling
    useDebounceBackPress(() => {
        KeyboardController.dismiss();
        onBackPress();
        return true;
    });

    return (
        <View
            style={{
                backgroundColor: '#F8F9FB',
                height: '100%',
            }}>
            <View style={tailwind.style('flex-column justify-between')}>
                <View style={tailwind.style(`flex-row justify-between px-5`)}>
                    <Button
                        testID="generic_search_back_press"
                        size="md"
                        type="secondary"
                        prefix={<LeftArrow />}
                        style={{ marginTop: 16 }}
                        onPress={() => {
                            KeyboardController.dismiss();
                            onBackPress();
                        }}
                    />
                </View>
                <Animated.View
                    style={tailwind.style(
                        `bg-[${token?.default?.secondary?.default}]  items-center rounded-[${token?.corner.md}] px-[${token?.spacing[16]}] flex-row gap-[${token?.gap.spacing[12]}] mx-5 mt-3`,
                    )}>
                    <View style={tailwind.style('flex-1')}>
                        <Input
                            ref={LocationTextInputRef}
                            type="secondary"
                            placeholder={placeHolderText}
                            defaultValue={LocationsTextInput}
                            containerStyle={tailwind.style('px-0 border-0')}
                            autoFocus
                            editable={true}
                            onChangeText={text => {
                                setLocationsTextInput(text);
                                setIsServiceable(true);
                            }}
                            onLayout={() => {
                                safelyRunUIOperation(() => {
                                    if (LocationTextInputRef.current) {
                                        LocationTextInputRef.current?.setSelection(0, LocationsTextInput.length);
                                    }
                                }, 'Error setting selection on layout');
                            }}
                            value={LocationsTextInput}
                            prefix={undefined}
                            suffix={undefined}
                            accessibleLabel={undefined}
                        />
                    </View>
                </Animated.View>
                <View style={{ marginTop: 10, backgroundColor: '#F8F9FB', paddingBottom: bottom + 190 }}>
                    {serviceable ? (
                        <LocationList
                            searchData={searchData}
                            locationSearchStatus={locationSearchStatus}
                            scrollOffsetY={undefined}
                            showFav={false}
                            favTagsStyle={undefined}
                            handleCardPress={onPress}
                        />
                    ) : (
                        <Animated.View
                            style={[tailwind.style(` flex-col justify-between items-center mt-8 h-[150px]`)]}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="search empty image"
                                style={tailwind.style('h-[122px] w-[93px]')}
                                source={mtIcSearchEmpty}
                            />
                            <Animated.View style={[tailwind.style(' flex-col justify-between items-center h-[42px]')]}>
                                <Typography
                                    type="body-1"
                                    style={undefined}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Locationunserviceable}
                                </Typography>
                                <Typography
                                    type="subhead-3"
                                    style={tailwind.style(`text-[${token?.text?.['text-weak']}]`)}
                                    numberOfLines={undefined}
                                    accessibilityLabel={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Wearenotavailableinthatlocationyet}
                                </Typography>
                            </Animated.View>
                        </Animated.View>
                    )}
                </View>
            </View>
            <View style={tailwind.style('absolute inset-x-0 bottom-0 items-end ')}>
                <FloatingMapButton skipFirstKeyboardAnimation={false} handleOnPress={onLocateMapPress} />
            </View>
        </View>
    );
};

export default GenericSearchModal;
