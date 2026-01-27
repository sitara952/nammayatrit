import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { AddFavouritesProps, TagType } from '../Types';
import Search from '../components/Search';
import LocateOnMap from '../components/LocateOnMap';
import ChooseNameScreen from '../components/ChooseNameScreen';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Icon } from '@/typescript/components/Icon';
import { OtherIcon } from '../components/FavouritePill';
import { useRefsContext } from '@/typescript/context/RefsContext';
import MapProvider from '@/typescript/Maps/MapProvider';
import { initialCoordinate } from '@/storage/Constants.bs';
import { MapContext } from '@/typescript/Maps/MapContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { getPlaceIdByLatLon } from '@/typescript/utils/location';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentRegion, selectMapIsMoved } from '@/typescript/state/client/maps';
import AnimatedPickupMarker from '@/typescript/components/AnimatedPickupMarker';
import { Header } from '@/src-v2/primitives/Header';
import RecenterButton from '@/typescript/designSystem/components/RecenterButton';
import useAutocomplete from '../hooks/useAutocomplete';
import { Platform, StyleSheet } from 'react-native';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { homeSheetBg } from '@/src-v2/screens/HomeScreen/HomeScreenFragment';
import { GenericFloatingMapButton } from '@/typescript/designSystem/components/GenericFloatingMapButton';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const AddFavourite = ({
    mcDispatch,
    searchData,
    searchText,
    currentLocation,
    selectedLocation,
    setSelectedLocation,
    addFavouriteState,
    locationSearchStatus,
    existingTags,
    setAddFavouriteState,
}: AddFavouritesProps) => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'addFavourite'>>();
    const intendedTagFromRoute = route.params?.intendedTag;
    const initialSearchText = route.params?.editLocation;
    const { addFavouriteModalRef } = useRefsContext();
    const { mapRef } = useContext(MapContext);
    const previousStateRef = useRef<string | null>(null);
    const { locationByPlaceId } = useAutocomplete(initialSearchText);
    const reduxCurrentRegion = useAppSelector(state => {
        return selectCurrentRegion(state, mapRef.current?.mapId ?? null);
    });

    const reduxIsMapMoved = useAppSelector(state => {
        return selectMapIsMoved(state, mapRef.current?.mapId ?? null);
    });
    const fetchAndSetLocation = useCallback((lat: number | undefined, lon: number | undefined) => {
        if (lat && lon) {
            const resp = getPlaceIdByLatLon(lat, lon, undefined);
            resp.then(data => {
                if (data.result) {
                    setSelectedLocation({
                        ...data.result,
                        tag: data.result.tag,
                    });
                }
            });
        }
    }, []);

    const animateCamera = useCallback(
        (lat: number | undefined, lon: number | undefined, duration?: number | undefined) => {
            if (lat && lon) {
                mapRef.current?.animateCamera({
                    lat,
                    lon,
                    zoom: 17,
                    duration: duration ?? 0,
                });
            }
        },
        [mapRef.current],
    );

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setCenterView(() => (
                <AnimatedPickupMarker isMoved={reduxIsMapMoved} markerRingColor={undefined} />
            ));
            if (mapRef.current.currentRegion.current.isGesture) {
                if (addFavouriteState === 'choose-tag') {
                    setAddFavouriteState('confirm-location');
                }
                fetchAndSetLocation(reduxCurrentRegion.region.latitude, reduxCurrentRegion.region.longitude);
            }
        }
        return undefined;
    }, [reduxCurrentRegion.isGesture, reduxCurrentRegion.region]);

    const onLocationPress = useCallback(() => {
        previousStateRef.current = addFavouriteState;
        setAddFavouriteState('search');
    }, [addFavouriteState]);

    useEffect(() => {
        if (currentLocation?.lat && currentLocation?.lng) {
            mapRef.current?.setCurrentLocationMarkerVisibility(true);
        }

        return () => {
            mapRef.current?.setCurrentLocationMarkerVisibility(false);
        };
    }, [mapRef.current?.mapReady, currentLocation?.lat, currentLocation?.lng]);

    const onSearchResultPress = useCallback(async (item: location) => {
        const locationItemByPlaceId = await locationByPlaceId(item);
        setSelectedLocation(locationItemByPlaceId);
        animateCamera(locationItemByPlaceId?.lat, locationItemByPlaceId?.lng);
        setAddFavouriteState('confirm-location');
        previousStateRef.current = null;
    }, []);

    const onLocateOnMapPress = useCallback(() => {
        setAddFavouriteState(prev => (prev !== 'confirm-location' ? 'confirm-location' : prev));
        previousStateRef.current = null;
        const location = route.params?.location || currentLocation;
        if (location) {
            setSelectedLocation(location);
            animateCamera(location.lat, location.lng);
        }
    }, [currentLocation, route.params?.location]);

    const onLocationConfirmPress = useCallback(() => {
        setAddFavouriteState('choose-tag');
        animateCamera(selectedLocation?.lat, selectedLocation?.lng);
    }, [selectedLocation]);

    const onTagConfirmPress = useCallback(
        (location: location, tag: TagType, favouriteName: string | undefined) => {
            mcDispatch({
                type: 'SAVE_FAVOURITE',
                payload: { location: location, tag: tag, locationName: favouriteName },
            });
        },
        [selectedLocation],
    );
    const { bottom } = useSafeAreaInsets();
    const snapPoints = useMemo(() => {
        if (addFavouriteState === 'search') {
            return ['100%'];
        } else if (addFavouriteState === 'confirm-location') {
            return [Platform.OS === 'ios' ? 225 : 195 + bottom];
        }
        return ['100%'];
    }, [addFavouriteState]);

    const CustomHandle = useCallback(
        (_props: BottomSheetHandleProps) => {
            if (addFavouriteState === 'choose-tag') {
                return (
                    <Animated.View style={styles.customHandle}>
                        <Animated.View style={styles.customHandleIcon}>
                            <Icon icon={<OtherIcon />} color="white" size={24} />
                        </Animated.View>
                    </Animated.View>
                );
            }
            return null;
        },
        [addFavouriteState],
    );

    const buttonPositionUpwardsBy = useSharedValue(0);
    const sheetAnimatedPosition = useSharedValue(0);
    const sheetAnimatedIndex = useSharedValue(0);

    return (
        <>
            {addFavouriteState === 'confirm-location' && (
                <RecenterButton
                    additionalOffset={5}
                    onPress={() => {
                        onLocateOnMapPress();
                    }}
                    sheetAnimatedIndex={sheetAnimatedIndex}
                    sheetAnimatedPosition={sheetAnimatedPosition}
                    buttonPositionUpwardsBy={buttonPositionUpwardsBy}
                />
            )}
            {addFavouriteState === 'search' ? (
                <Search
                    onChangeText={text => mcDispatch({ type: 'SET_SEARCH_TEXT', payload: text })}
                    searchText={searchText}
                    searchData={searchData}
                    locationSearchStatus={locationSearchStatus}
                    onClose={() => {
                        mcDispatch({ type: 'GO_BACK', payload: undefined });
                    }}
                    onSearchResultPress={onSearchResultPress}
                />
            ) : (
                <>
                    <Header title="" onBackPress={() => mcDispatch({ type: 'GO_BACK', payload: undefined })} />
                    <BottomSheet
                        snapPoints={addFavouriteState === 'choose-tag' ? undefined : snapPoints}
                        enableDynamicSizing={addFavouriteState === 'choose-tag'}
                        ref={addFavouriteModalRef}
                        index={0}
                        animatedIndex={sheetAnimatedIndex}
                        animatedPosition={sheetAnimatedPosition}
                        bottomInset={0}
                        backgroundStyle={[
                            styles.bottomSheetBackground,
                            // {
                            //     backgroundColor: addFavouriteState === 'search' ? '#F7F7F7' : 'white',
                            //     shadowColor: '#000',
                            //     shadowOffset: {
                            //         width: 0,
                            //         height: 0,
                            //     },
                            //     shadowOpacity: 0.13,
                            //     shadowRadius: 16,
                            // },
                        ]}
                        handleIndicatorStyle={[styles.handleIndicator]}
                        handleStyle={[styles.handle]}
                        style={styles.bottomSheetStyle}
                        enableOverDrag={false}
                        enablePanDownToClose={false}
                        animateOnMount={false}
                        handleComponent={addFavouriteState === 'choose-tag' ? CustomHandle : undefined}
                        enableHandlePanningGesture={addFavouriteState !== 'choose-tag'}>
                        <BottomSheetView style={addFavouriteState === 'choose-tag' ? { flex: 0 } : undefined}>
                            {addFavouriteState === 'confirm-location' && selectedLocation && (
                                <LocateOnMap
                                    onLocationPress={onLocationPress}
                                    selectedLocation={selectedLocation}
                                    onConfirmPress={onLocationConfirmPress}
                                />
                            )}
                            {addFavouriteState === 'choose-tag' && selectedLocation && (
                                <ChooseNameScreen
                                    currentBottomSheetRef={addFavouriteModalRef}
                                    showAllFavouritePills={false}
                                    isEdit={false}
                                    onDeletePress={() => {}}
                                    onChangeLocationPress={onLocationPress}
                                    onConfirmPress={onTagConfirmPress}
                                    existingTags={existingTags}
                                    selectedTag={intendedTagFromRoute}
                                    location={selectedLocation}
                                    headerContent={undefined}
                                    selectedTagName={undefined}
                                />
                            )}
                        </BottomSheetView>
                    </BottomSheet>
                </>
            )}
            {addFavouriteState === 'search' && <GenericFloatingMapButton handleOnPress={onLocateOnMapPress} />}
        </>
    );
};

const AddFavouriteUI = (props: AddFavouritesProps) => {
    return (
        <MapProvider
            fitToMapElementFlag={false}
            initialCoordinate={{
                latitude: props?.currentLocation?.lat ?? initialCoordinate.latitude,
                longitude: props?.currentLocation?.lng ?? initialCoordinate.longitude,
            }}
            mapId="FavouritesMap">
            <HardwareBackpressHandler
                onHardwareBackPress={() => props.mcDispatch({ type: 'GO_BACK', payload: undefined })}>
                <AddFavourite {...props} />
            </HardwareBackpressHandler>
        </MapProvider>
    );
};

export default React.memo(AddFavouriteUI);

const styles = StyleSheet.create({
    customHandle: {
        height: 26,
        backgroundColor: homeSheetBg,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    customHandleIcon: {
        height: 56,
        width: 56,
        borderRadius: 28,
        backgroundColor: colors.red600,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    bottomSheetBackground: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    handleIndicator: {
        height: 5,
        width: 48,
        backgroundColor: homeSheetBg,
    },
    handle: {
        height: 28,
        paddingTop: 12,
        paddingBottom: 0,
        backgroundColor: homeSheetBg,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    handleHidden: {
        display: 'none',
    },
    bottomSheetStyle: {
        backgroundColor: homeSheetBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 1,
    },
});
