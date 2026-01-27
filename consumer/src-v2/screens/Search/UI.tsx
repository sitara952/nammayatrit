import mtIcStartTyping from '../../../src/typescript/assets/ny-service/mt_ic_start_typing.webp';
import mtIcSearchEmpty from '@/typescript/assets/ny-service/mt_ic_search_empty.webp';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import InputGroup, { LocationType } from '@/typescript/designSystem/components/InputGroup';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import token from '@/typescript/designSystem/tokens';
import { SearchModalViewProps } from './Types';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import {
    SearchInput,
    selectCurrentLocation,
    selectSearchedStops,
    setSearchedSource,
    updateSearchedStop,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { createAction } from '@/typescript/utils/common';
import React, { useCallback, useMemo, useState } from 'react';
import { LocationList } from './components/LocationsList';
import EditTransit from '@/src-v2/multimodal/screens/Search/components/EditTransit';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { Header } from '@/src-v2/primitives/Header';
import { FloatingMapButton } from './components/FloatingMapButton';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import GenericSearchModal from '@/typescript/components/common/GenericSearchModal';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { getStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import { SearchContinueButton } from './components/SearchContinueButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';

export const SearchModalView: React.FC<SearchModalViewProps> = ({
    isServiceable,
    locationSearchStatus,
    activeInput,
    startLocationFromTextInput,
    source,
    stopLocationsTextInput,
    searchData,
    rcsDispatch,
    handleCardPress,
    // showEditTransitBtn,
    editTransitValues,
    onTransitSwitchChange,
    onBusRoutePress,
    onEditTransitConfirmPress,
    searchFloatingMapButton,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appConfig = useAppSelector(selectAppConfig);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { top } = useSafeAreaInsets();
    const scrollOffsetY = useSharedValue(0);

    const { newBookingFlowSheetRef } = useRefsContext();
    const { genericSearchModalRef } = useRefsContext();
    const [currentLocationType, setCurrentLocationType] = useState<LocationType>('source');
    const [currentStopIndex, setCurrentStopIndex] = useState<number>(-1);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const stops: (location | null)[] = useAppSelector(selectSearchedStops);

    const presentGenericSearchModal = useCallback(
        (locationType: LocationType, stopIndex: number) => {
            setCurrentLocationType(locationType);
            setCurrentStopIndex(stopIndex);
            genericSearchModalRef.current?.present();
        },
        [genericSearchModalRef],
    );
    const dispatch = useAppDispatch();
    const onCardClick = useCallback(
        (loc: location) => {
            if (currentLocationType === 'source') {
                dispatch(setSearchedSource(loc));
            } else if (
                (currentLocationType === 'stop' || currentLocationType === 'destination') &&
                typeof currentStopIndex === 'number'
            ) {
                dispatch(updateSearchedStop({ index: currentStopIndex, location: loc }));
            }
            genericSearchModalRef.current?.dismiss();
        },
        [currentLocationType, currentStopIndex, dispatch, genericSearchModalRef],
    );

    const lastKnownLocationLat = Number(getStringItem(MMKVKey.LAST_KNOWN_LAT));
    const lastKnownLocationLon = Number(getStringItem(MMKVKey.LAST_KNOWN_LON));

    const selectedLocation = currentLocationType === 'source' ? source : stops[currentStopIndex];
    const { lat, lng } = selectedLocation ?? { lat: undefined, lng: undefined };

    const onLocateOnMapPress = useCallback(() => {
        navigation.navigate('locateOnMap', {
            lat: lat || (currentLocation?.lat ?? lastKnownLocationLat),
            lng: lng || (currentLocation?.lng ?? lastKnownLocationLon),
            locationType: currentLocationType,
            onLocationConfirm: onCardClick,
            title:
                currentLocationType === 'source'
                    ? userLanguageStrings.ConfirmPickup
                    : currentLocationType === 'destination'
                      ? userLanguageStrings.ConfirmDropLocation
                      : userLanguageStrings.AddStop + ` ${currentStopIndex + 1}`,
            ctaText: userLanguageStrings.ConfirmLocation,
            subTitle: '',
        });
        genericSearchModalRef?.current?.dismiss();
    }, [
        lat,
        lng,
        navigation,
        currentLocation?.lat,
        currentLocation?.lng,
        lastKnownLocationLat,
        lastKnownLocationLon,
        currentLocationType,
        onCardClick,
        userLanguageStrings.ConfirmPickup,
        userLanguageStrings.ConfirmDropLocation,
        userLanguageStrings.AddStop,
        userLanguageStrings.ConfirmLocation,
        currentStopIndex,
        genericSearchModalRef,
    ]);
    const handleOnLayout = useCallback(() => {
        // Required because we need to expand the sheet to "100%" in Search Modal
        newBookingFlowSheetRef?.current?.expand();
    }, [newBookingFlowSheetRef]);

    // const { handlers, animatedStyle } = useScaleAnimation();
    const [showEditTransit, setShowEditTransit] = React.useState(false);
    const handleCloseEditTransit = useCallback(() => {
        setShowEditTransit(false);
    }, []);

    const handleBackPress = useCallback(() => {
        rcsDispatch(createAction('HANDLE_BACKPRESS', undefined));
    }, [rcsDispatch]);

    const handleGenericSearchModalBackPress = useCallback(() => {
        genericSearchModalRef.current?.dismiss();
    }, [genericSearchModalRef]);

    const editTransitComponent = useMemo(() => {
        if (!showEditTransit) return null;

        return (
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={tailwind.style(`h-full bg-[#FFFFFF] pt-[${top - 16}px]`)}>
                <EditTransit
                    showBusRoutes
                    showTrainRoutes
                    showMetroRoutes
                    editTransitValues={editTransitValues}
                    onTransitSwitchChange={onTransitSwitchChange ?? (() => {})}
                    onClose={handleCloseEditTransit}
                    onBusRoutePress={onBusRoutePress}
                    onEditTransitConfirmPress={onEditTransitConfirmPress}
                    showCombinationalRoute={undefined}
                    showToggle={true}
                />
            </Animated.View>
        );
    }, [
        showEditTransit,
        editTransitValues,
        onTransitSwitchChange,
        handleCloseEditTransit,
        onBusRoutePress,
        onEditTransitConfirmPress,
    ]);

    if (showEditTransit) {
        return editTransitComponent;
    }

    return (
        <Animated.View
            onLayout={handleOnLayout}
            style={[tailwind.style(`bg-[${themeColors.Fill_neutralUltraLow}]`), styles.searchModalContainer]}
            entering={FadeIn.duration(700)}
            exiting={FadeOut.duration(200)}>
            <Animated.View style={[tailwind.style(`bg-[${themeColors.Fill_neutralUltraLow}]`), styles.headerCard]}>
                <Header
                    accessible={true}
                    accessibilityLabel="Go Back"
                    accessibilityHint="Go Back to Home page"
                    title={''}
                    onBackPress={handleBackPress}
                />
                <Animated.View style={{ marginHorizontal: 16 }}>
                    <InputGroup
                        isSourceAndStopEditable={true}
                        isMultiModal={appConfig.appType === 'multimodal'}
                        presentGenericSearchModal={presentGenericSearchModal}
                    />
                </Animated.View>
            </Animated.View>

            {isServiceable != false ? (
                stops.length <= 1 ? (
                    <>
                        <LocationList
                            searchData={searchData}
                            locationSearchStatus={locationSearchStatus}
                            scrollOffsetY={scrollOffsetY}
                            showFav={
                                activeInput === SearchInput.Source
                                    ? (source ? (source.title ?? '') : startLocationFromTextInput).length <= 0
                                    : stopLocationsTextInput.length <= 0
                            }
                            favTagsStyle={styles.favTags}
                            handleCardPress={handleCardPress}
                        />
                    </>
                ) : (
                    <Animated.View
                        style={[
                            tailwind.style(`absolute top-80 flex-col justify-between items-center pt-8 px-16 gap-3`),
                        ]}>
                        <Animated.Image style={tailwind.style('h-[116px] w-[108px]')} source={mtIcStartTyping} />
                        <Animated.View style={[tailwind.style('flex-col justify-between items-center h-[42px]')]}>
                            <Typography
                                accessibilityRole="text"
                                type="body-2"
                                style={tailwind.style('text-center text-gray-500')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}>
                                {userLanguageStrings.TapATextFieldToSearchForPlacesOrTapThePlusToAddMoreStops}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                )
            ) : (
                <Animated.View
                    style={[
                        tailwind.style(`absolute top-80 left-0 right-0 flex-col justify-between items-center mt-8`),
                    ]}>
                    <Animated.Image
                        style={tailwind.style('h-[122px] w-[93px]')}
                        source={mtIcSearchEmpty}
                        accessible={true}
                        accessibilityLabel="search empty image"
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
            {stops.length <= 1 ? (
                <FloatingMapButton skipFirstKeyboardAnimation={false} handleOnPress={searchFloatingMapButton} />
            ) : (
                <SearchContinueButton />
            )}
            <PopUpModal
                sheetRef={genericSearchModalRef}
                snapPoints={['100%']}
                onHardwareBackPress={undefined}
                isScrollable={false}
                showBackdrop={false}
                enableDynamicSizing={false}
                topInset={top - 10}>
                <GenericSearchModal
                    lat={source ? source.lat : currentLocation?.lat}
                    lon={source ? source.lng : currentLocation?.lng}
                    onCardClick={onCardClick}
                    placeHolderText={
                        currentLocationType === 'source'
                            ? userLanguageStrings.Startingfrom + '?'
                            : currentLocationType === 'destination'
                              ? userLanguageStrings.SelectDestination
                              : `${userLanguageStrings.Addstop} ${currentStopIndex + 1}`
                    }
                    onBackPress={handleGenericSearchModalBackPress}
                    locationType={currentLocationType === 'source' ? 'source' : 'stop'}
                    onLocateMapPress={onLocateOnMapPress}
                    searchedLocationText={
                        currentLocationType === 'source'
                            ? (source?.title ?? '') + (source?.subtitle ?? ' ')
                            : (stops[currentStopIndex]?.title ?? '') + (stops[currentStopIndex]?.subtitle ?? '')
                    }
                />
            </PopUpModal>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerCard: {
        paddingBottom: 16,
    },
    searchModalContainer: { flex: 1 },
    favTags: {
        elevation: 0,
    },
});
