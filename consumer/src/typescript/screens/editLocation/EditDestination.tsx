import { View, StyleSheet } from 'react-native';
import React, { useEffect, useRef, useContext, useCallback } from 'react';
import CardSearch from '../../designSystem/components/CardSearch';
import { Icon } from '../../components/Icon';
import Typography from '../../designSystem/components/primitives/Typography';
import token from '../../designSystem/tokens';
import Button from '@/src-v2/primitives/Button';
import { useRoute } from '@react-navigation/native';
import { editLocationResultAPIResp } from './../../../readOnly/api/types/EditLocationResultAPIResp.gen';
import Input from '../../designSystem/components/primitives/Input';
import Divider from '../../designSystem/components/primitives/Divider';
import { location } from '../../../helpers/utils/Location/LocationTypes.gen';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    FadeOutDown,
    FadeOutUp,
    LinearTransition,
} from 'react-native-reanimated';
import { useEditDestination } from '../../hooks/editDestinationHooks';
import { RouteProp } from '@react-navigation/native';
import { getPlaceIdByLatLon } from './../../utils/location';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import RevisedFareCard from '@/typescript/designSystem/components/RevisedFareCard';
import { LocationPin } from '@/typescript/components/svg/search/LocationPin';
import colors from '../../designSystem/colorPalette';
import type { latLng as ReactMap_latLng } from '@/helpers/externalModules/GMap/ReactMap.gen';
import AnimatedPickupMarker from '@/typescript/components/AnimatedPickupMarker';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import useMapRoute from '../../Maps/UseMapRouteTS';
import { RideId, selectBookedStopsWithId } from '@/typescript/state/client/booking';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MapContext } from '@/typescript/Maps/MapContext';
import MapProvider from '@/typescript/Maps/MapProvider';
import { selectCurrentRegion, selectMapIsMoved } from '@/typescript/state/client/maps';
import { useAppSelector } from '@/typescript/state/hooks';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import CardDefault from '@/typescript/designSystem/components/CardDefault';
import { JourneyId, selectBookingId } from '../../state/client/user';
import { extendLegGetFareResp } from '@/readOnly/api/types/ExtendLegGetFareResp.gen';
import { getDistanceWithUnit } from '@/typescript/utils/common';
import { extendLegStartPoint } from '@/readOnly/api/types/ExtendLegStartPoint.gen';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { FloatingMapButton } from '@/src-v2/screens/Search/components/FloatingMapButton';
import InputGroupDirection from '@/typescript/assets/svg/direction/InputGroupDirection';
import { DEFAULT_CAMERA_ZOOM } from '@/typescript/constants/common';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';

export enum EditDestSubView {
    LocationList,
    LocationOnMap,
    ReqDestChange,
}

export type MultimodalExtendLegPropsType = {
    journeyId: JourneyId;
    extendTillEnd: boolean;
    previousDistance: number | null;
    previousFare: number;
    startLocation: extendLegStartPoint;
    getFare: boolean;
    currentLegIsTaxi: boolean;
    destinationLat: number;
    destinationLon: number;
};

export type EditDestinationProps = {
    rideId: RideId | null;
    setIsUpdateRequired: (isBookingDetailUpdateRequired: boolean) => void;
    lat: number;
    lon: number;
    currentDriverLat: number | undefined;
    currentDriverLon: number | undefined;
    source: FormatedLocation | undefined;
    multimodalExtendLegProps: MultimodalExtendLegPropsType | undefined;
    skipEditLocation: boolean | undefined;
};

const EditDestination = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const route: RouteProp<{ params: EditDestinationProps }, 'params'> = useRoute();
    const props = route.params;
    const defaultSubView = props.skipEditLocation
        ? EditDestSubView.ReqDestChange
        : props.multimodalExtendLegProps?.getFare
          ? EditDestSubView.ReqDestChange
          : EditDestSubView.LocationList;
    const [editDestSubView, setEditDestSubView] = React.useState(defaultSubView);
    const dropLocationTextInputRef = useRef(null);
    const [stopLocationsTextInput, setStopLocationsTextInput] = React.useState('');
    const [searchData, setSearchData] = React.useState<location[]>([]);
    const [selectedLocation, setSelectedLocation] = React.useState<location | null>(null);
    const [bookingUpdateRequestId, setBookingUpdateRequestId] = React.useState<string | null>(null);
    const [getUpdatedDataInterval, setUpdatedDataInterval] = React.useState<number>(Infinity);
    const [isPoolingForData, setIsPoolingForData] = React.useState(true);
    const { bottom } = useSafeAreaInsets();
    const [extendLegFare, setExtendLegFare] = React.useState<extendLegGetFareResp | null>(null);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const {
        editLocationApiCall,
        debouncedHandleSearch,
        revisedData,
        backPress,
        locationByPlaceId,
        handleReqDestChange,
        handleExtendLegGetFare,
        handleExtendLegConfirm,
        handleRoute,
    } = useEditDestination(
        props,
        bookingUpdateRequestId,
        setBookingUpdateRequestId,
        getUpdatedDataInterval,
        setSearchData,
        editDestSubView,
        setEditDestSubView,
        setExtendLegFare,
    );

    const onCardSearchPress = useCallback(
        async (item: location) => {
            try {
                setSelectedLocation(item);
                props.multimodalExtendLegProps
                    ? handleExtendLegGetFare(item, props.multimodalExtendLegProps)
                    : editLocationApiCall(item);
            } catch (error) {
                console.error('Not able to fetch location: ', error);
            }
        },
        [
            locationByPlaceId,
            setSelectedLocation,
            props.multimodalExtendLegProps,
            editLocationApiCall,
            handleExtendLegGetFare,
        ],
    );

    const renderItem = ({ item, index }: { item: location; index: number }) => {
        return (
            <CardSearch
                isFavouritesSearch={false}
                style={tailwind.style(index === 0 ? 'pt-[8px]' : '')}
                prefix={<Icon color={colors?.recovered?.neutralUltraHigh} icon={<LocationPin />} size={20} />}
                title={item.title ?? ''}
                description={item.subtitle ?? ''}
                onPress={async () => {
                    const locationItemByPlaceId = await locationByPlaceId(item);
                    onCardSearchPress(locationItemByPlaceId);
                }}
                showTime={undefined}
                isAnimate={undefined}
                suffix={undefined}
                location={undefined}
                badge={undefined}
                isLoading={undefined}
                styles={undefined}
                searchTerm={''}
                currentLocation={currentLocationCoords}
                sourceLocation={props.source ?? null}
                activeInput={undefined}
            />
        );
    };

    useEffect(() => {
        if (stopLocationsTextInput.length < 1) setSearchData([]);
        if (editDestSubView == EditDestSubView.LocationList) {
            debouncedHandleSearch(stopLocationsTextInput);
            return () => {
                debouncedHandleSearch.cancel();
            };
        }
        return undefined;
    }, [stopLocationsTextInput]);

    useEffect(() => {
        setIsPoolingForData(true);
        if (bookingUpdateRequestId == null || revisedData == null) {
            setUpdatedDataInterval(1000);
            return;
        }
        const data: editLocationResultAPIResp = revisedData?._0;
        const bookingDetails = data?.bookingUpdateRequestDetails;
        if (
            bookingUpdateRequestId == null ||
            (bookingDetails?.estimatedFare == undefined && editDestSubView == EditDestSubView.ReqDestChange)
        ) {
            setUpdatedDataInterval(1000);
        } else {
            setUpdatedDataInterval(Infinity);
            setIsPoolingForData(false);
        }
    }, [revisedData, bookingUpdateRequestId]);

    useEffect(() => {
        setStopLocationsTextInput(selectedLocation?.formattedAddress ?? '');
        setUpdatedDataInterval(1000);
        setIsPoolingForData(true);
    }, [selectedLocation]);

    // Auto-fill destination for direct booking flow
    useEffect(() => {
        if (
            props.skipEditLocation &&
            props.multimodalExtendLegProps?.destinationLat &&
            props.multimodalExtendLegProps?.destinationLon
        ) {
            const extendLegProps = props.multimodalExtendLegProps;

            // Use reverse geocoding to get the actual address for better UX
            const fetchDestinationAddress = async () => {
                try {
                    const destinationInfo = await getPlaceIdByLatLon(
                        extendLegProps.destinationLat,
                        extendLegProps.destinationLon,
                        undefined,
                    );

                    if (destinationInfo.result) {
                        // Set the actual address and location object
                        setStopLocationsTextInput(destinationInfo.result.formattedAddress || '');
                        setSelectedLocation(destinationInfo.result);
                    } else {
                        console.error('Failed to get destination info from reverse geocoding', {
                            lat: extendLegProps.destinationLat,
                            lon: extendLegProps.destinationLon,
                            response: destinationInfo,
                        });
                        return;
                    }
                } catch (error) {
                    console.error('Error in reverse geocoding for destination:', error);
                    return;
                }
            };

            fetchDestinationAddress();

            // Move to the confirmation screen if getFare is enabled
            if (extendLegProps.getFare) {
                setEditDestSubView(EditDestSubView.ReqDestChange);
            }
        }
    }, [props.skipEditLocation, props.multimodalExtendLegProps]);

    useEffect(() => {
        if (editDestSubView == EditDestSubView.LocationList) {
            setBookingUpdateRequestId(null);
        } else if (editDestSubView == EditDestSubView.ReqDestChange) {
            if (props.multimodalExtendLegProps?.getFare && props.multimodalExtendLegProps?.extendTillEnd) {
                handleExtendLegGetFare(undefined, props.multimodalExtendLegProps);
            } else if (props.skipEditLocation && props.multimodalExtendLegProps && selectedLocation) {
                // For direct booking, call the API directly with the auto-filled destination
                console.info('Direct booking - calling extend leg API automatically');
                handleExtendLegGetFare(selectedLocation, props.multimodalExtendLegProps);
            }
            setIsPoolingForData(true);
        }
    }, [editDestSubView, selectedLocation, props.skipEditLocation]);

    const insets = useSafeAreaInsets();

    const handleButtonClick = () => {
        props.multimodalExtendLegProps
            ? handleExtendLegConfirm(extendLegFare, props.multimodalExtendLegProps?.startLocation, selectedLocation)
            : handleReqDestChange();
    };

    return (
        <HardwareBackpressHandler onHardwareBackPress={backPress}>
            <View style={{ flex: 1, backgroundColor: 'grey' }}>
                <MapProvider
                    initialCoordinate={{
                        latitude: props.lat,
                        longitude: props.lon,
                    }}
                    mapId="MapAfterRide"
                    fitToMapElementFlag={true}>
                    <GmapAfterRender
                        rideId={props.rideId ?? null}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        editDestSubView={editDestSubView}
                        handleRoute={handleRoute}
                        editDestinationProps={props}
                        source={props.source}
                    />

                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="edit_destination_back"
                        style={{
                            margin: 12,
                            paddingVertical: 7,
                            paddingHorizontal: 11,
                            backgroundColor: 'white',
                            borderColor: '#E0E3E8',
                            position: 'absolute',
                            borderWidth: 1,
                            borderRadius: 20,
                            marginTop: insets.top,
                        }}
                        onPress={backPress}>
                        <LeftArrow />
                    </TouchableOpacity>

                    {editDestSubView == EditDestSubView.LocationList && (
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                backgroundColor: '#F8F9FB',
                                paddingTop: insets.top,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    testID="edit_destination_back_from_list"
                                    style={{
                                        margin: 12,
                                        paddingVertical: 7,
                                        paddingHorizontal: 11,
                                        backgroundColor: 'white',
                                        borderColor: '#E0E3E8',
                                        borderWidth: 1,
                                        borderRadius: 20,
                                        marginTop: 5,
                                    }}
                                    onPress={backPress}>
                                    <LeftArrow />
                                </TouchableOpacity>
                                <Typography
                                    type="subhead-700"
                                    style={tailwind.style(`text-[${themeColors.Button_primary_default_fill_base}]`)}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {' '}
                                    {userLanguageStrings.Editride}
                                </Typography>
                            </View>
                            <Animated.View
                                exiting={FadeOutUp.duration(150)}
                                entering={FadeInDown.springify().damping(28).stiffness(200)}
                                style={tailwind.style(
                                    `bg-[${token?.default?.secondary?.default}] rounded-[${token?.corner.md}] px-[${token?.spacing[16]}] flex-row gap-[${token?.gap.spacing[12]}] mx-3`,
                                )}>
                                <InputGroupDirection isMultimodal={false} numStops={undefined} heightMap={undefined} />
                                <View style={tailwind.style('flex-1')}>
                                    <Typography
                                        type="body-1"
                                        numberOfLines={1}
                                        style={[tailwind.style('text-[#515151]'), { paddingVertical: 15 }]}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {'' + props.source?.address}
                                    </Typography>
                                    <View style={tailwind.style('py-[2px]')}>
                                        <Divider
                                            type={undefined}
                                            direction={undefined}
                                            style={undefined}
                                            labelPosition={undefined}
                                            offset={undefined}
                                            offsetBackground={undefined}
                                            dividerColor={undefined}
                                            strokeDashArray={undefined}
                                        />
                                    </View>
                                    <Input
                                        ref={dropLocationTextInputRef}
                                        type="secondary"
                                        placeholder={
                                            editDestSubView == EditDestSubView.LocationList
                                                ? userLanguageStrings.Enterdestination
                                                : selectedLocation?.formattedAddress
                                        }
                                        defaultValue={stopLocationsTextInput}
                                        containerStyle={tailwind.style('px-0 border-0')}
                                        autoFocus
                                        editable={editDestSubView == EditDestSubView.LocationList}
                                        onChangeText={text => setStopLocationsTextInput(text)}
                                        selectTextOnFocus
                                        value={stopLocationsTextInput}
                                        prefix={undefined}
                                        suffix={undefined}
                                        accessibleLabel={undefined}
                                    />
                                </View>
                            </Animated.View>
                            <View style={{ marginTop: 10, backgroundColor: '#F8F9FB' }}>
                                <Animated.FlatList
                                    keyboardShouldPersistTaps="handled"
                                    keyboardDismissMode={'on-drag'}
                                    // onScroll={handleOnScroll}
                                    scrollEventThrottle={16}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    itemLayoutAnimation={LinearTransition.springify().damping(28).stiffness(240)}
                                    layout={LinearTransition.springify().damping(28).stiffness(240)}
                                    data={searchData}
                                    keyExtractor={(item, index) => item?.placeId + index.toString()}
                                    contentContainerStyle={[
                                        tailwind.style(
                                            `gap-[${token?.gap.spacing[12]}] px-4 -z-10  pb-[${
                                                SCREEN_HEIGHT - 258 - bottom
                                            }px]`,
                                        ),
                                    ]}
                                    renderItem={renderItem}
                                />
                            </View>
                            <View
                                style={[
                                    tailwind.style(`absolute inset-x-0 bottom-0`),
                                    { flex: 1, flexDirection: 'row', justifyContent: 'center' },
                                ]}>
                                <FloatingMapButton
                                    skipFirstKeyboardAnimation={false}
                                    handleOnPress={() => setEditDestSubView(EditDestSubView.LocationOnMap)}
                                />
                            </View>
                        </View>
                    )}

                    {editDestSubView == EditDestSubView.ReqDestChange && (
                        <Animated.View
                            exiting={FadeOutDown.duration(150)}
                            entering={FadeInDown.springify().damping(28).stiffness(150)}
                            style={[
                                tailwind.style(`absolute h-fit inset-x-0 bottom-0`, {
                                    backgroundColor: 'white',
                                }),
                                styles.shadow,
                            ]}>
                            <RevisedFareCard
                                headerString={userLanguageStrings.RevisedFare}
                                newFare={(() => {
                                    if (extendLegFare && extendLegFare.totalFare) {
                                        const { estimatedMinFare, estimatedMaxFare } = extendLegFare.totalFare;
                                        const fareRange =
                                            estimatedMinFare === estimatedMaxFare
                                                ? estimatedMinFare.toFixed(0)
                                                : `${estimatedMinFare.toFixed(0)}-${estimatedMaxFare.toFixed(0)}`;

                                        return `${fareRange}`;
                                    }
                                    const data: editLocationResultAPIResp = revisedData?._0;
                                    const bookingDetails = data?.bookingUpdateRequestDetails;
                                    return bookingDetails?.estimatedFare?.toFixed(0);
                                })()}
                                prevFare={(() => {
                                    if (props.multimodalExtendLegProps)
                                        return props.multimodalExtendLegProps.previousFare.toString(); // fix
                                    const data: editLocationResultAPIResp = revisedData?._0;
                                    const bookingDetails = data?.bookingUpdateRequestDetails;
                                    return bookingDetails?.oldEstimatedFare.toFixed(0);
                                })()}
                                newDist={(() => {
                                    if (extendLegFare) return getDistanceWithUnit(extendLegFare.distance.value);
                                    const data: editLocationResultAPIResp = revisedData?._0;
                                    const bookingDetails = data?.bookingUpdateRequestDetails;
                                    return getDistanceWithUnit(bookingDetails?.estimatedDistance ?? 0);
                                })()}
                                previousDist={(() => {
                                    if (props.multimodalExtendLegProps)
                                        return props.multimodalExtendLegProps.previousDistance
                                            ? getDistanceWithUnit(props.multimodalExtendLegProps.previousDistance)
                                            : '';
                                    const data: editLocationResultAPIResp = revisedData?._0;
                                    const bookingDetails = data?.bookingUpdateRequestDetails;
                                    return '' + getDistanceWithUnit(bookingDetails?.oldEstimatedDistance ?? 0);
                                })()}
                                footerString={
                                    props.multimodalExtendLegProps?.currentLegIsTaxi
                                        ? userLanguageStrings.Pleaseconfirmwithdriverafterrequesting
                                        : undefined
                                }
                                isLoading={isPoolingForData && !extendLegFare}
                                buttonClick={handleButtonClick}
                            />
                        </Animated.View>
                    )}

                    {editDestSubView == EditDestSubView.LocationOnMap && (
                        <Animated.View
                            style={[
                                tailwind.style(`absolute inset-x-0 rounded-t-lg bg-black`),
                                {
                                    paddingTop: 20,
                                    backgroundColor: '#F8F9FB',
                                    bottom: 0,
                                    gap: 10,
                                    paddingBottom: bottom + 10,
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                },
                                styles.shadow,
                            ]}>
                            <Animated.View
                                entering={FadeIn}
                                exiting={FadeOut.duration(100)}
                                style={tailwind?.style(
                                    ` bg-[${themeColors.Fill_neutralUltraLow}] px-[${token?.spacing?.[16]}]`,
                                )}
                                accessible={false}>
                                <Animated.View style={tailwind?.style(`flex-row justify-start mb-4`)}>
                                    <Typography
                                        type="subhead-800"
                                        style={tailwind.style(`text-lg`)}
                                        accessible={true}
                                        accessibilityLabel={'Edit Drop location'}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.EditDroplocation}
                                    </Typography>
                                </Animated.View>
                                <Typography
                                    type="body-1"
                                    style={{ marginTop: -8, color: '#746F79' }}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Farechangemaybeapplicableifnew_ismorethanmawayfromyourcurrentpickup(
                                        'drop',
                                        50,
                                    )}
                                </Typography>
                                <CardDefault
                                    accessible={false}
                                    style={tailwind.style(`mt-${token?.spacing?.[16]}`)}
                                    showTime={false}
                                    onPress={undefined}
                                    isSelected={false}
                                    title={selectedLocation?.title}
                                    description={
                                        selectedLocation?.formattedAddress ??
                                        `${
                                            selectedLocation?.addressComponents?.building
                                                ? selectedLocation.addressComponents.building + ','
                                                : ''
                                        } ${selectedLocation?.addressComponents?.area ?? ''}`.trim()
                                    }
                                    suffixView={<></>}
                                />
                                <Button
                                    testID="edit_destination_confirm"
                                    type="primary"
                                    style={{ marginTop: 16, marginBottom: 16, justifyContent: 'center', width: '100%' }}
                                    text={userLanguageStrings.ConfirmDropLocation}
                                    onPress={() => {
                                        if (selectedLocation) {
                                            setIsPoolingForData(true);
                                            onCardSearchPress(selectedLocation);
                                        }
                                    }}
                                />
                            </Animated.View>
                        </Animated.View>
                    )}
                </MapProvider>
            </View>
        </HardwareBackpressHandler>
    );
};

interface GmapAfterRenderProps {
    rideId: RideId | null;
    selectedLocation: location | null;
    setSelectedLocation: React.Dispatch<React.SetStateAction<location | null>>;
    editDestSubView: EditDestSubView;
    handleRoute: (
        srcLat: number,
        srcLon: number,
        destLat: number,
        destLon: number,
        gotRoute: (latlng: ReactMap_latLng[]) => void,
    ) => void;
    editDestinationProps: EditDestinationProps;
    source: FormatedLocation | undefined;
}

function GmapAfterRender(props: GmapAfterRenderProps): React.JSX.Element {
    const { mapRef } = useContext(MapContext);
    const reduxCurrentRegion = useAppSelector(state => {
        return selectCurrentRegion(state, mapRef.current?.mapId ?? null);
    });
    const { drawEstimateRoute } = useMapRoute(props.rideId, undefined);
    const reduxIsMapMoved = useAppSelector(state => {
        return selectMapIsMoved(state, mapRef.current?.mapId ?? null);
    });
    const bookingId = useAppSelector(selectBookingId);
    const stops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current?.setCurrentLocationMarkerVisibility(true);
            mapRef.current?.animateCamera({
                lat: props.editDestinationProps.lat,
                lon: props.editDestinationProps.lon,
                zoom: DEFAULT_CAMERA_ZOOM,
                duration: undefined,
            });
            const destination = stops[stops.length - 1];
            if (props.editDestSubView === EditDestSubView.LocationOnMap) {
                mapRef.current?.animateCamera({
                    lat: destination?.lat,
                    lon: destination?.lng,
                    zoom: 18.2,
                    duration: undefined,
                });
            }
        }
    }, [props.editDestSubView]);

    useEffect(() => {
        if (mapRef.current) {
            if (props.editDestSubView == EditDestSubView.LocationOnMap) {
                const resp = getPlaceIdByLatLon(
                    mapRef.current?.currentRegion.current.region.latitude,
                    mapRef.current?.currentRegion.current.region.longitude,
                    undefined,
                );
                resp.then(data => {
                    if (data.result) {
                        props.setSelectedLocation({
                            ...data.result,
                            tag: data.result.tag,
                        });
                    }
                });
            }
        }
    }, [reduxCurrentRegion.isGesture, reduxCurrentRegion.region, props.editDestSubView]);

    useEffect(() => {
        if (props.editDestSubView == EditDestSubView.ReqDestChange) {
            mapRef.current?.setCenterView(() => <></>);
            mapRef.current?.addMapPadding({
                top: undefined,
                right: undefined,
                bottom: 200,
                left: undefined,
            });
            props.handleRoute(
                props.editDestinationProps.lat,
                props.editDestinationProps.lon,
                props.selectedLocation?.lat ?? props.editDestinationProps.multimodalExtendLegProps?.destinationLat ?? 0,
                props.selectedLocation?.lng ?? props.editDestinationProps.multimodalExtendLegProps?.destinationLon ?? 0,
                latlngArr => {
                    handleDrawRoute(latlngArr);
                },
            );
        } else if (props.editDestSubView == EditDestSubView.LocationOnMap) {
            if (mapRef.current) {
                mapRef.current.removeRoute('defaultRoute');
                mapRef.current.changeAutoAnimationToCurrentLocation(false);
                mapRef.current.setCenterView(() => (
                    <AnimatedPickupMarker isMoved={reduxIsMapMoved} markerRingColor={undefined} />
                ));
            }
            return () => {
                mapRef.current?.changeAutoAnimationToCurrentLocation(true);
                mapRef.current?.setCenterView(() => <></>);
            };
        } else {
            mapRef.current?.removeRoute('defaultRoute');
        }
        return undefined;
    }, [props.editDestSubView, reduxIsMapMoved, props.selectedLocation]);

    const handleDrawRoute = (latlngArr: ReactMap_latLng[]) => {
        const coordinates = latlngArr || [];

        // Get destination points from last coordinate
        const lastCoord = coordinates[coordinates.length - 1];
        const destination = lastCoord ? [lastCoord] : [];
        const formatedStops = stops
            .slice(0, -1)
            .filter(stop => stop !== null)
            .map(stop => ({
                latitude: stop.lat,
                longitude: stop.lng,
            }));
        drawEstimateRoute({
            coordinates,
            sourceAddress: props.source?.area ?? undefined,
            destAddress: props.selectedLocation?.title ?? undefined,
            destinationPoints: formatedStops.concat(destination),
            destinationTitles: [],
            onSourceClick: undefined,
            onDestClick: undefined,
            showEditIcon: undefined,
        })
            .then()
            .catch(error => {
                console.error('Error drawing route:', error);
            });
    };
    return <View />;
}

export default EditDestination;

const styles = StyleSheet.create({
    backArrow: {
        paddingHorizontal: 14,
        position: 'absolute',
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: '#F8F9FB',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    fareChangeDesc: {
        marginTop: 8,
        color: '#746F79',
    },
    buttonShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 50,
    },
});
