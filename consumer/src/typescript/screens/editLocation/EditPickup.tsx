import { View, StyleSheet } from 'react-native';
import React, { FC, useContext, useEffect, useState } from 'react';
import Button from '@/src-v2/primitives/Button';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDistanceBwCordinatesInKm } from './../../utils/location';
import { location } from '../../../helpers/utils/Location/LocationTypes.gen';
import { useEditPickup } from './editPickupHooks';
import { RouteProp } from '@react-navigation/native';
import { getPlaceIdByLatLon } from './../../utils/location';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import AnimatedPickupMarker from '@/typescript/components/AnimatedPickupMarker';
import { addEditPickupCircle } from '../../utils/ConfirmPickupUtils';
import { RideId } from '@/typescript/state/client/booking';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MapContext } from '@/typescript/Maps/MapContext';
import MapProvider from '@/typescript/Maps/MapProvider';
import { selectCurrentRegion, selectMapIsMoved } from '@/typescript/state/client/maps';
import { useAppSelector } from '@/typescript/state/hooks';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import CardDefault from '@/typescript/designSystem/components/CardDefault';
import token from '@/typescript/designSystem/tokens';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';

export type EditPickupProps = {
    rideId: RideId;
    bookingId: string;
    lat: number;
    lon: number;
    circleRadius: number; // in km
};
const EditPickup = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'editPickup'>>();
    const props = route.params;
    return (
        <MapProvider
            initialCoordinate={{ latitude: props.lat, longitude: props.lon }}
            mapId="MapAfterRide"
            fitToMapElementFlag={true}>
            <EditPickupView {...props} />
        </MapProvider>
    );
};
const EditPickupView = (props: EditPickupProps): React.JSX.Element => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    // typed navigation
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { top } = useSafeAreaInsets();
    const [currentDist, setCurrentDist] = useState(0.0);
    const [editPickupLocation, setEditPickupLocation] = useState({
        lat: props.lat,
        lon: props.lon,
    });
    const [editPickupLocationResp, setEditPickupLocationResp] = useState<location | undefined>(undefined);

    const { handleConfirmLocation, finalIsLoading } = useEditPickup(
        editPickupLocationResp,
        props.rideId,
        props.bookingId,
        currentDist,
        props.circleRadius,
        userLanguageStrings,
    );
    const { bottom } = useSafeAreaInsets();

    return (
        <HardwareBackpressHandler>
            <View style={{ height: '100%' }}>
                <Animated.View style={tailwind.style(`flex-row justify-between px-4 mt-[${top}] pb-[${bottom}]`)}>
                    <Button
                        testID="4a2241a4-eee4-4190-82fe-f0a2618a4dba"
                        size="md"
                        type="secondary"
                        prefix={<LeftArrow />}
                        style={styles.buttonShadow}
                        onPress={() => navigation.goBack()}
                    />
                </Animated.View>

                <GmapAfterRender
                    {...props}
                    currentDist={currentDist}
                    setCurrentDist={setCurrentDist}
                    editPickupLocationResp={editPickupLocationResp}
                    editPickupLocation={editPickupLocation}
                    setEditPickupLocationResp={setEditPickupLocationResp}
                    setEditPickupLocation={setEditPickupLocation}
                />

                <Animated.View
                    style={[
                        tailwind.style(`absolute inset-x-0 bottom-0 rounded-t-lg bg-black`),
                        {
                            paddingTop: 20,
                            backgroundColor: '#F8F9FB',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            paddingBottom: bottom,
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
                        <Animated.View style={tailwind?.style(`flex-row justify-start`)}>
                            <Typography
                                type="subhead-800"
                                style={tailwind.style(`text-lg`)}
                                accessible={true}
                                accessibilityLabel={'Edit Pickup location'}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.EditPickuplocation}
                            </Typography>
                        </Animated.View>
                        <Typography
                            type="body-7"
                            style={styles.fareChangeDesc}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Farechangemaybeapplicableifnew_ismorethanmawayfromyourcurrentpickup(
                                'pickup',
                                50,
                            )}
                        </Typography>
                        <CardDefault
                            accessible={false}
                            style={tailwind.style(`mt-${token?.spacing?.[16]}`)}
                            showTime={false}
                            onPress={undefined}
                            isSelected={false}
                            title={editPickupLocationResp?.title}
                            description={
                                editPickupLocationResp?.formattedAddress ??
                                `${
                                    editPickupLocationResp?.addressComponents?.building
                                        ? editPickupLocationResp.addressComponents.building + ','
                                        : ''
                                } ${editPickupLocationResp?.addressComponents?.area ?? ''}`.trim()
                            }
                            suffixView={<></>}
                        />
                        <Button
                            testID="edit_pickup_confirm"
                            type="primary"
                            isLoading={finalIsLoading}
                            style={{ marginTop: 16, justifyContent: 'center', width: '100%' }}
                            disabled={currentDist > props.circleRadius}
                            text={userLanguageStrings.ConfirmNewPickup}
                            onPress={handleConfirmLocation}
                        />
                    </Animated.View>
                </Animated.View>
            </View>
        </HardwareBackpressHandler>
    );
};

interface GmapAfterRenderProps {
    currentDist: number;
    setCurrentDist: React.Dispatch<React.SetStateAction<number>>;
    editPickupLocation: { lat: number; lon: number };
    setEditPickupLocation: React.Dispatch<React.SetStateAction<{ lat: number; lon: number }>>;
    lat: number;
    lon: number;
    circleRadius: number;
    editPickupLocationResp: location | undefined;
    setEditPickupLocationResp: React.Dispatch<React.SetStateAction<location | undefined>>;
}

function GmapAfterRender(props: GmapAfterRenderProps): React.JSX.Element {
    const { mapRef } = useContext(MapContext);
    const reduxCurrentRegion = useAppSelector(state => {
        return selectCurrentRegion(state, mapRef.current?.mapId ?? null);
    });
    const reduxIsMapMoved = useAppSelector(state => {
        return selectMapIsMoved(state, mapRef.current?.mapId ?? null);
    });
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const LocationPin: FC<{ outsideCircle: boolean }> = ({ outsideCircle }) => {
        return (
            <Animated.View>
                {outsideCircle && (
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Typography
                            type="body"
                            style={tailwind.style('rounded-lg bg-white p-1 border border-grey mb-10')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Locationistoofar}
                        </Typography>
                    </Animated.View>
                )}
                {mapRef.current && <AnimatedPickupMarker isMoved={reduxIsMapMoved} markerRingColor={undefined} />}
            </Animated.View>
        );
    };

    const handleOnMapChange = () => {
        if (mapRef.current) {
            const movedLat = reduxCurrentRegion.region.latitude || props.lat;
            const movedLon = reduxCurrentRegion.region.longitude || props.lon;

            const distance = getDistanceBwCordinatesInKm(props.lat, props.lon, movedLat, movedLon);
            props.setCurrentDist(distance);
            props.setEditPickupLocation({
                lat: movedLat,
                lon: movedLon,
            });
            const resp = getPlaceIdByLatLon(movedLat, movedLon, undefined);
            resp.then(data => {
                if (data.result) {
                    props.setEditPickupLocationResp({
                        ...data.result,
                        tag: data.result.tag,
                    });
                }
            });
        }
    };

    useEffect(() => {
        if (reduxCurrentRegion.isGesture) {
            handleOnMapChange();
        }
    }, [reduxCurrentRegion.isGesture, reduxCurrentRegion.region]);

    const { setAutoClearTimeout } = useAutoClearTimeout();
    useEffect(() => {
        handleOnMapChange();
        mapRef.current?.setCurrentLocationMarkerVisibility(true);
        setAutoClearTimeout(() => {
            mapRef.current?.animateCamera({
                lat: props.editPickupLocation?.lat,
                lon: props.editPickupLocation?.lon,
                zoom: 18.2,
                duration: 100,
            });
        }, 200);
    }, []);

    useEffect(() => {
        const outsideCircle = props.currentDist > props.circleRadius;
        mapRef.current?.changeAutoAnimationToCurrentLocation(false);
        mapRef.current?.setCenterView(() => <LocationPin outsideCircle={outsideCircle} />);
        addEditPickupCircle(
            props.lat,
            props.lon,
            mapRef,
            props.circleRadius * 1000,
            'editPickup',
            1,
            outsideCircle ? 'red' : '#FFD506',
            'rgba(255, 213, 6, 0.2)',
        );
        return () => {
            mapRef.current?.changeAutoAnimationToCurrentLocation(true);
            mapRef.current?.setCenterView(() => <></>);
        };
    }, [props.currentDist, reduxIsMapMoved]);
    return <View />;
}

export default EditPickup;

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
