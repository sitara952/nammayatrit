import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import Animated, { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import MapView, { LatLng, Region, EdgePadding, Polyline, Camera } from 'react-native-maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { NativeModules, Text, useWindowDimensions, View } from 'react-native';
import PickLocationIcon from './PickLocationIcon';
import demoRoute from './DemoRoute';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentLocation } from '@/typescript/state/client/session';
import AnimatedMapPin, { AnimatedMapPinRef } from '../../components/AnimatedMapPin';
import { getGradientColor } from '@/helpers/externalModules/GMap/GMapUtils.gen';
import { computeHeading, dedupCoords, hideSplash } from '@/typescript/utils/common';
import { GET_EXT_PATH_MIN_DISTANCE_IN_M } from '@/typescript/constants/common';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

const { MapUtils } = NativeModules;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const routeColor = {
    color: '#c2d3e6',
};

const roadFill = {
    elementType: 'geometry.fill',
    featureType: 'road',
    stylers: [routeColor],
};

const roadStroke = {
    elementType: 'geometry.stroke',
    featureType: 'road',
    stylers: [routeColor],
};

type MarkerData = {
    latitude: number;
    longitude: number;
    calloutText: string | undefined;
};

const MapTest = (): React.JSX.Element => {
    const { MainAppUtils } = NativeModules;
    MainAppUtils.hideSplash();
    const currentLocation = useAppSelector(selectCurrentLocation);
    const initialMapPadding = {
        top: 60,
        right: 30,
        bottom: 0,
        left: 30,
    };
    const [mapPadding, setMapPadding] = useState(initialMapPadding);
    const animatedPosition = useSharedValue(0);
    const [markerData, setMarkerData] = useState<MarkerData[]>([]);
    const [isAnimate, setIsAnimate] = useState(false);
    const [currRouteIndex, setCurrRouteIndex] = useState(1);
    const [currRoute, setCurrRoute] = useState<LatLng[]>([]);

    const mapRef = React.useRef<MapView>(null);
    const { height } = useWindowDimensions();
    const [centerCoordinate, setCenterCoordinate] = useState<LatLng>({
        latitude: currentLocation?.lat || 0,
        longitude: currentLocation?.lng || 0,
    });
    const initialRegion = {
        latitude: currentLocation?.lat || 0,
        longitude: currentLocation?.lng || 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    hideSplash();

    const [currRegion, setCurrRegion] = useState<Region | Camera | undefined>(initialRegion);

    const updateMapPadding = (padding: EdgePadding) => {
        setMapPadding(padding);
        if (currRoute.length > 0) {
            mapRef?.current?.fitToCoordinates(demoRoute, {
                edgePadding: { ...mapPadding, top: 60, bottom: 60 },
            });
        }
    };
    const markerRef = React.useRef<React.RefObject<AnimatedMapPinRef | null>[]>([]);

    useAnimatedReaction(
        () => {
            return animatedPosition.value;
        },
        currPosition => {
            const bottomPad = height - currPosition;
            runOnJS(updateMapPadding)({ ...initialMapPadding, bottom: bottomPad });
        },
        [],
    );

    // Simulate route updates
    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (currRouteIndex >= currRoute.length - 1) {
                setCurrRouteIndex(0);
                return;
            }
            const prevCoordinate = currRoute[currRouteIndex];
            const newCoordinate = currRoute[currRouteIndex + 1];
            setCurrRouteIndex(currRouteIndex + 1);
            if (isAnimate && currRoute.length > 0) {
                if (prevCoordinate && newCoordinate) {
                    const mRef = markerRef.current[0];

                    mRef?.current?.updateText('Source ' + currRouteIndex);
                    mRef?.current?.moveMarker(newCoordinate, 1200);
                    const rot = computeHeading(prevCoordinate, newCoordinate);
                    // console.log('rot', rot);
                    mRef?.current?.rotateMarker(rot, 1200);
                    await delay(1000);
                    if (currRouteIndex % 3 === 0) {
                        mapRef.current?.fitToCoordinates(currRoute.slice(currRouteIndex + 1), {
                            edgePadding: { ...initialMapPadding, top: 60, bottom: 60 },
                        });
                    }
                }
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isAnimate, currRoute, currRouteIndex]);

    const handleDrawRoute = async () => {
        console.info('draw route');
        const startPoint = demoRoute[0];
        const endPoint = demoRoute[demoRoute.length - 1];
        const startMarker: MarkerData = {
            latitude: startPoint?.latitude || 0,
            longitude: startPoint?.longitude || 0,
            calloutText: undefined,
        };
        const endMarker: MarkerData = {
            latitude: endPoint?.latitude || 0,
            longitude: endPoint?.longitude || 0,
            calloutText: undefined,
        };

        setMarkerData([startMarker, endMarker]);
        markerRef.current = [startMarker, endMarker].map(() => React.createRef<AnimatedMapPinRef>());

        setIsAnimate(true);

        // Get and process route data
        const route = dedupCoords(await MapUtils.getExtendedPath(demoRoute, GET_EXT_PATH_MIN_DISTANCE_IN_M));
        setCurrRoute(route);

        mapRef.current?.fitToCoordinates(demoRoute, {
            edgePadding: { ...initialMapPadding, top: 60, bottom: 60 },
        });
        mapRef.current?.render();
    };

    const handleRouteAnimation = async () => {
        console.info('handleRouteAnimation');
        const zoomIn = (dataOfAddress: LatLng | undefined) => {
            console.info('Animating to source zoomIn');
            mapRef.current?.animateCamera(
                { center: dataOfAddress, zoom: 18.0, heading: undefined, pitch: undefined },
                { duration: 2500 },
            );
        };

        const zoomOut = () => {
            console.info('Animating to source zoomOut');
            mapRef.current?.fitToCoordinates(demoRoute, {
                edgePadding: { left: 30, top: 60, right: 20, bottom: 60 },
            });
        };

        zoomIn(markerData[0]);
        await delay(3000);
        zoomOut();
        await delay(3000);
        zoomIn(markerData[1]);
        await delay(3000);
        zoomOut();
    };

    const handleOnRegionChange = async (_region: Region) => {
        // setCurrRegion(region);
        const camera = await mapRef.current?.getCamera();
        setCurrRegion(camera);
        if (camera)
            setCenterCoordinate({
                latitude: camera.center.latitude,
                longitude: camera.center.longitude,
            });
    };

    const handleOnRegionChangeContinous = async () => {
        const camera = await mapRef.current?.getCamera();
        if (camera)
            setCenterCoordinate({
                latitude: camera.center.latitude,
                longitude: camera.center.longitude,
            });
    };

    const handleCenterMarkerAction = () => {
        console.info('handleCenterMarkerAction', currRegion);
        mapRef.current?.animateCamera(
            { center: centerCoordinate, zoom: 15, heading: undefined, pitch: undefined },
            { duration: 1000 },
        );
    };

    const handleRemoveRoute = () => {
        console.info('handleRemoveRoute');
        setCurrRoute([]);
        setMarkerData([]);
        setIsAnimate(false);
        mapRef.current?.forceUpdate();
    };

    const handleResetView = () => {
        console.info('handleResetView');
        mapRef.current?.fitToCoordinates(demoRoute, {
            edgePadding: { ...initialMapPadding, bottom: 50 },
        });
    };

    const handleCalloutPress = useCallback((key: string) => {
        console.info('handleCalloutPress', key);
    }, []);

    const renderMarkerView = (): ReactNode => {
        return markerData.map((marker, index) => {
            return (
                <AnimatedMapPin
                    ref={markerRef.current[index]}
                    coordinate={marker}
                    markerKey={index.toString()}
                    pinIconType={index === 0 ? 'vehicle' : 'dropoff'}
                    vehicleVariant="AUTO_RICKSHAW"
                    calloutText={index === 0 ? 'Source' : 'Completing drop-off nearby'}
                    calloutOnPress={handleCalloutPress}
                    showEditIcon={index === 0 ? false : true}
                    zIndex={index - 10}
                    onClick={undefined}
                    children={null}
                    multimodalVariant={undefined}
                    markerOnPress={undefined}
                    showCallout={undefined}
                    displayCalloutOnPress={undefined}
                    busStopEtaCallout={undefined}
                    primaryEtaMinutes={undefined}
                    secondaryEtaMinutes={undefined}
                />
            );
        });
    };

    const renderPolylines = useCallback((): ReactNode => {
        const route = currRoute.slice(currRouteIndex);
        const gradient = getGradientColor('#F78118', '#161622', route.length);
        // console.log('renderPolylines', currRouteIndex, currRoute.length, route.length, gradient.length);
        if (currRoute.length > 0) {
            return <Polyline coordinates={route} strokeWidth={4} strokeColor="#000" strokeColors={gradient} />;
        } else {
            return null;
        }
    }, [currRoute, currRouteIndex]);

    const renderMapView = useMemo(() => {
        return (
            <MapView
                style={{ width: '100%', height: '100%' }}
                provider="google"
                googleRenderer="LEGACY"
                showsUserLocation={true}
                customMapStyle={[roadFill, roadStroke]}
                zoomTapEnabled={true}
                rotateEnabled={false}
                initialRegion={initialRegion}
                onRegionChangeComplete={handleOnRegionChange}
                onRegionChange={handleOnRegionChangeContinous}
                ref={mapRef}
                mapPadding={mapPadding}>
                {/* <MapCenterMarker coordinate={centerCoordinate} /> */}
                {renderMarkerView()}
                {renderPolylines()}
            </MapView>
        );
    }, [mapPadding, currRoute, currRouteIndex]);

    return (
        <Animated.View style={tailwind.style('flex-1')}>
            <View
                style={{
                    position: 'absolute',
                    zIndex: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#FFFFFF00',
                    display: 'flex',
                    pointerEvents: 'box-none',
                }}>
                {renderMapView}
                <PickLocationIcon />
            </View>
            <BottomSheet
                snapPoints={['20%', '50%', '90%']}
                index={0}
                style={{ flex: 1 }}
                animatedPosition={animatedPosition}
                activeOffsetX={undefined}
                activeOffsetY={undefined}
                failOffsetY={undefined}
                failOffsetX={undefined}
                simultaneousHandlers={undefined}
                waitFor={undefined}>
                <BottomSheetView style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <Text>Bottom Sheet Content</Text>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="a5a8a1c2-3928-4843-a62c-603bcd0944a3"
                            style={{ backgroundColor: 'grey', padding: 10 }}
                            onPress={handleDrawRoute}>
                            <Text>Draw route</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="752c0e4c-c8b3-44eb-bb6a-372659c0c0c4"
                            style={{ backgroundColor: 'grey', padding: 10 }}
                            onPress={handleRouteAnimation}>
                            <Text>Animate Route</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="a0d3b21c-b9ee-4e1c-955f-de93232f6567"
                            style={{ backgroundColor: 'grey', padding: 10 }}
                            onPress={handleCenterMarkerAction}>
                            <Text>Center marker</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="42043033-636c-4e85-8f97-decf3fa318a6"
                            style={{ backgroundColor: 'grey', padding: 10 }}
                            onPress={handleResetView}>
                            <Text>Reset view</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="c271425d-3019-4c81-b106-07775c034f7f"
                            style={{ backgroundColor: 'grey', padding: 10 }}
                            onPress={handleRemoveRoute}>
                            <Text>Remove Route</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </Animated.View>
    );
};

export default React.memo(MapTest);
