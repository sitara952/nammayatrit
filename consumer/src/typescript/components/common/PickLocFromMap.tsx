import { View, StyleSheet } from 'react-native';
import React, { useEffect, useContext } from 'react';
import Typography from '../../designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import { useRoute } from '@react-navigation/native';
import { location } from '../../../helpers/utils/Location/LocationTypes.gen';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { RouteProp } from '@react-navigation/native';
import { getPlaceIdByLatLon } from '../../utils/location';
import AnimatedPickupMarker from '@/typescript/components/AnimatedPickupMarker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import LeftArrow from '@/typescript/assets/svg/direction/LeftArrow';
import { MapContext } from '@/typescript/Maps/MapContext';
import MapProvider from '@/typescript/Maps/MapProvider';
import { selectCurrentRegion, selectMapIsMoved } from '@/typescript/state/client/maps';
import { useAppSelector } from '@/typescript/state/hooks';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import token from '@/typescript/designSystem/tokens';
import CardDefault from '@/typescript/designSystem/components/CardDefault';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
export type PickLocFromMapProps = {
    lat: number;
    lng: number;
    locationType: 'source' | 'destination' | 'stop' | 'rental_add_edit_stop';
    onLocationConfirm: (location: location) => void;
    title: string;
    subTitle: string;
    ctaText: string;
};

const PickLocFromMap = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'locateOnMap'>>();
    const props = route.params;
    return (
        <MapProvider
            initialCoordinate={{
                latitude: props.lat,
                longitude: props.lng,
            }}
            mapId="MapAfterRide"
            fitToMapElementFlag={true}>
            <PickLocFromMapView {...props} />
        </MapProvider>
    );
};

const PickLocFromMapView = (props: PickLocFromMapProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<MainNavigationParamList, 'locateOnMap'>>();
    const { lat, lng } = route.params;
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const [selectedLocation, setSelectedLocation] = React.useState<location | null>(null);
    const { bottom, top } = useSafeAreaInsets();
    const onPressHandle = () => {
        if (selectedLocation) {
            props.onLocationConfirm(selectedLocation);
            navigation.goBack();
        }
    };

    const { mapRef } = useContext(MapContext);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.animateCamera({
                lat: lat,
                lon: lng,
                zoom: 15,
                duration: undefined,
            });
        }
    }, []);

    return (
        <HardwareBackpressHandler>
            <View style={{ height: '100%' }}>
                <View style={tailwind.style(`flex-row justify-between px-4`)}>
                    <Button
                        testID="map_location_back_press"
                        size="md"
                        type="secondary"
                        prefix={<LeftArrow />}
                        style={[styles.buttonShadow, { marginTop: top }]}
                        onPress={() => navigation.goBack()}
                    />
                </View>

                <GmapAfterRender
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    locationType={props.locationType}
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
                                accessibilityLabel={props.title}
                                accessibilityRole={undefined}
                                numberOfLines={undefined}
                                isAnimate={undefined}>
                                {props.title}
                            </Typography>
                        </Animated.View>
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
                            testID="map_location_confirm"
                            type="primary"
                            style={{ marginTop: 16, marginBottom: 16, justifyContent: 'center', width: '100%' }}
                            text={props.ctaText}
                            onPress={onPressHandle}
                        />
                    </Animated.View>
                </Animated.View>
            </View>
        </HardwareBackpressHandler>
    );
};

interface GmapAfterRenderProps {
    selectedLocation: location | null;
    setSelectedLocation: React.Dispatch<React.SetStateAction<location | null>>;
    locationType: 'source' | 'destination' | 'stop' | 'rental_add_edit_stop';
}

function GmapAfterRender(props: GmapAfterRenderProps): React.JSX.Element {
    const { mapRef } = useContext(MapContext);
    const reduxCurrentRegion = useAppSelector(state => {
        return selectCurrentRegion(state, mapRef.current?.mapId ?? null);
    });
    const ReducIsMapMoved = useAppSelector(state => {
        return selectMapIsMoved(state, mapRef.current?.mapId ?? null);
    });
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current?.setCurrentLocationMarkerVisibility(true);
            const resp = getPlaceIdByLatLon(
                mapRef.current.currentRegion.current.region.latitude,
                mapRef.current.currentRegion.current.region.longitude,
                props.locationType,
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
    }, [reduxCurrentRegion.isGesture, reduxCurrentRegion.region]);
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.changeAutoAnimationToCurrentLocation(false);
            mapRef.current.setCenterView(() => (
                <AnimatedPickupMarker isMoved={ReducIsMapMoved} markerRingColor={undefined} />
            ));
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.changeAutoAnimationToCurrentLocation(true);
                mapRef.current.setCenterView(() => <></>);
            }
        };
    }, [ReducIsMapMoved]);

    return <View />;
}

export default PickLocFromMap;

const styles = StyleSheet.create({
    backArrow: {
        margin: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: 'white',
        position: 'absolute',
        borderColor: '#E0E3E8',
        borderWidth: 1,
        borderRadius: 20,
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
    buttonShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1,
    },
});
