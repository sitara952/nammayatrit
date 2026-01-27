import mtIcStop2 from '../../resources/assets/png/mt_ic_stop_2.png';
import mtIcStop1 from '../../resources/assets/png/mt_ic_stop_1.png';
import icBikeNavOnMap from '@/resources/assets/png/cab-markers/ic_bike_nav_on_map.webp';
import icSedanNavOnMap from '@/resources/assets/png/cab-markers/ic_sedan_nav_on_map.webp';
import icHatchbackNavOnMap from '@/resources/assets/png/cab-markers/ic_hatchback_nav_on_map.webp';
import icAutoNavOnMap from '@/resources/assets/png/cab-markers/ic_auto_nav_on_map.webp';
import icERickshawNavOnMap from '@/resources/assets/png/cab-markers/ic_e_rickshaw_nav_on_map.webp';
import mtIcPickupGate from '../../resources/assets/png/mt_ic_pickup_gate.webp';
import NymapLocEdit from '@/resources/assets/png/map_loc_edit_black.webp';
import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Image, ImageSourcePropType, Text, TextProps, View, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LatLng, MapMarkerProps } from 'react-native-maps';
import AnimatedMarker, { AnimatedMarkerRef } from './AnimatedMarker';
import { AnotherRideDrop } from '../components/svg/AnotherRideDrop';
import PickupMarker from '../components/svg/PickupMarker';
import { VehicleVariant_vehicleVariant } from '@/readOnly/api/types/Enums.gen';
import icSuvNavOnMap from '@/resources/assets/png/cab-markers/ic_suv_nav_on_map.webp';
import NyPickUpMarker from '../components/svg/NyPickUpMarker';
import NyDropMarker from '../components/svg/NyDropMarker';
import { BusIcon } from '@/src-v2/multimodal/components/svg/transport';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import auto0 from '@/typescript/assets/nearby/mt_ic_auto_0.webp';
import auto30 from '@/typescript/assets/nearby/mt_ic_auto_30.webp';
import auto60 from '@/typescript/assets/nearby/mt_ic_auto_60.webp';
import auto90 from '@/typescript/assets/nearby/mt_ic_auto_90.webp';
import auto120 from '@/typescript/assets/nearby/mt_ic_auto_120.webp';
import auto150 from '@/typescript/assets/nearby/mt_ic_auto_150.webp';
import auto180 from '@/typescript/assets/nearby/mt_ic_auto_180.webp';
import auto210 from '@/typescript/assets/nearby/mt_ic_auto_210.webp';
import auto240 from '@/typescript/assets/nearby/mt_ic_auto_240.webp';
import auto270 from '@/typescript/assets/nearby/mt_ic_auto_270.webp';
import auto300 from '@/typescript/assets/nearby/mt_ic_auto_300.webp';
import auto330 from '@/typescript/assets/nearby/mt_ic_auto_330.webp';
import mini0 from '@/typescript/assets/nearby/mt_ic_mini_0.webp';
import mini30 from '@/typescript/assets/nearby/mt_ic_mini_30.webp';
import mini60 from '@/typescript/assets/nearby/mt_ic_mini_60.webp';
import mini90 from '@/typescript/assets/nearby/mt_ic_mini_90.webp';
import mini120 from '@/typescript/assets/nearby/mt_ic_mini_120.webp';
import mini150 from '@/typescript/assets/nearby/mt_ic_mini_150.webp';
import mini180 from '@/typescript/assets/nearby/mt_ic_mini_180.webp';
import mini210 from '@/typescript/assets/nearby/mt_ic_mini_210.webp';
import mini240 from '@/typescript/assets/nearby/mt_ic_mini_240.webp';
import mini270 from '@/typescript/assets/nearby/mt_ic_mini_270.webp';
import mini300 from '@/typescript/assets/nearby/mt_ic_mini_300.webp';
import mini330 from '@/typescript/assets/nearby/mt_ic_mini_330.webp';

import bike0 from '@/typescript/assets/nearby/mt_ic_bike_0.webp';
import bike30 from '@/typescript/assets/nearby/mt_ic_bike_30.webp';
import bike60 from '@/typescript/assets/nearby/mt_ic_bike_60.webp';
import bike90 from '@/typescript/assets/nearby/mt_ic_bike_90.webp';
import bike120 from '@/typescript/assets/nearby/mt_ic_bike_120.webp';
import bike150 from '@/typescript/assets/nearby/mt_ic_bike_150.webp';
import bike180 from '@/typescript/assets/nearby/mt_ic_bike_180.webp';
import bike210 from '@/typescript/assets/nearby/mt_ic_bike_210.webp';
import bike240 from '@/typescript/assets/nearby/mt_ic_bike_240.webp';
import bike270 from '@/typescript/assets/nearby/mt_ic_bike_270.webp';
import bike300 from '@/typescript/assets/nearby/mt_ic_bike_300.webp';
import bike330 from '@/typescript/assets/nearby/mt_ic_bike_330.webp';

import sedan0 from '@/typescript/assets/nearby/mt_ic_sedan_0.webp';
import sedan30 from '@/typescript/assets/nearby/mt_ic_sedan_30.webp';
import sedan60 from '@/typescript/assets/nearby/mt_ic_sedan_60.webp';
import sedan90 from '@/typescript/assets/nearby/mt_ic_sedan_90.webp';
import sedan120 from '@/typescript/assets/nearby/mt_ic_sedan_120.webp';
import sedan150 from '@/typescript/assets/nearby/mt_ic_sedan_150.webp';
import sedan180 from '@/typescript/assets/nearby/mt_ic_sedan_180.webp';
import sedan210 from '@/typescript/assets/nearby/mt_ic_sedan_210.webp';
import sedan240 from '@/typescript/assets/nearby/mt_ic_sedan_240.webp';
import sedan270 from '@/typescript/assets/nearby/mt_ic_sedan_270.webp';
import sedan300 from '@/typescript/assets/nearby/mt_ic_sedan_300.webp';
import sedan330 from '@/typescript/assets/nearby/mt_ic_sedan_330.webp';

import xl0 from '@/typescript/assets/nearby/mt_ic_xl_0.webp';
import xl30 from '@/typescript/assets/nearby/mt_ic_xl_30.webp';
import xl60 from '@/typescript/assets/nearby/mt_ic_xl_60.webp';
import xl90 from '@/typescript/assets/nearby/mt_ic_xl_90.webp';
import xl120 from '@/typescript/assets/nearby/mt_ic_xl_120.webp';
import xl150 from '@/typescript/assets/nearby/mt_ic_xl_150.webp';
import xl180 from '@/typescript/assets/nearby/mt_ic_xl_180.webp';
import xl210 from '@/typescript/assets/nearby/mt_ic_xl_210.webp';
import xl240 from '@/typescript/assets/nearby/mt_ic_xl_240.webp';
import xl270 from '@/typescript/assets/nearby/mt_ic_xl_270.webp';
import xl300 from '@/typescript/assets/nearby/mt_ic_xl_300.webp';
import xl330 from '@/typescript/assets/nearby/mt_ic_xl_330.webp';

import xl_plus0 from '@/typescript/assets/nearby/mt_ic_xl_plus_0.webp';
import xl_plus30 from '@/typescript/assets/nearby/mt_ic_xl_plus_30.webp';
import xl_plus60 from '@/typescript/assets/nearby/mt_ic_xl_plus_60.webp';
import xl_plus90 from '@/typescript/assets/nearby/mt_ic_xl_plus_90.webp';
import xl_plus120 from '@/typescript/assets/nearby/mt_ic_xl_plus_120.webp';
import xl_plus150 from '@/typescript/assets/nearby/mt_ic_xl_plus_150.webp';
import xl_plus180 from '@/typescript/assets/nearby/mt_ic_xl_plus_180.webp';
import xl_plus210 from '@/typescript/assets/nearby/mt_ic_xl_plus_210.webp';
import xl_plus240 from '@/typescript/assets/nearby/mt_ic_xl_plus_240.webp';
import xl_plus270 from '@/typescript/assets/nearby/mt_ic_xl_plus_270.webp';
import xl_plus300 from '@/typescript/assets/nearby/mt_ic_xl_plus_300.webp';
import xl_plus330 from '@/typescript/assets/nearby/mt_ic_xl_plus_330.webp';
import icYSHeritageCabIcon from '@/resources/assets/png/cab-markers/ys_ic_heritage_cab_map_marker.webp';
// import mtIcMultimodalBus from '@/resources/assets/png/cab-markers/mt_ic_multimodal_bus.webp';
import mtIcMultimodalBus from '@/resources/assets/png/cab-markers/mt_ic_multimodal_bus_new.png';
// mt_ic_multimodal_bus_new
// import mtIcMultimodalBusNew from '@/resources/assets/png/cab-markers/mt_ic_multimodal_bus_new.webp';
// import mtIcMultimodalBusStop from '@/resources/assets/png/cab-markers/mt_ic_bus_stop';
import mtIcMultimodalBusDepot from '@/resources/assets/png/cab-markers/mt_bus_depo.png';
// import mtTrial from '@/resources/assets/png/cab-markers/bus_trial.png';
import mtBusStops from '@/resources/assets/png/cab-markers/bus_trial1.png';
// import mtTrial2 from '@/resources/assets/png/cab-markers/bus_trial2.png';
import mtUserWithoutYou from '@/resources/assets/png/cab-markers/mt_user_without_you.png';
import mtIcMultimodalGhostBus from '@/resources/assets/png/cab-markers/mt_ic_multimodal_ghost_bus.webp';
import mtIcStops from '../assets/multimodal/mt_ic_stops.webp';
import mtIcAuto from '../assets/multimodal/mt_ic_auto.webp';
import mtIcAutoLive from '../assets/multimodal/mt_ic_auto_live.webp';
import mtIcWalk from '../assets/multimodal/mt_ic_walk.webp';
import mtIcBusLive from '../assets/multimodal/mt_ic_bus_live.webp';
import mtIcWalkLive from '../assets/multimodal/mt_ic_walk_live.webp';
import mtIcMetroLive from '../assets/multimodal/mt_ic_metro_live.webp';
import mtIcEllipse from '../assets/multimodal/mt_ic_ellipse.webp';
import MapBusSvg from '@/src-v2/assets/svg/MapBusSvg';
import MapMetroSvg from '@/src-v2/assets/svg/MapMetroSvg';
import MapWalkSvg from '@/src-v2/assets/svg/MapWalkSvg';
import MapTaxiSvg from '@/src-v2/assets/svg/MapTaxiSvg';
import MapTrainSvg from '../../../src-v2/assets/svg/MapTrainSvg';
import mtIcStopDot from '../assets/multimodal/mt_ic_stop_dot.webp';
import busAndUser from '@/src-v2/assets/bus_and_user.webp';
import mtIcDeluxeBus from '@/resources/assets/png/cab-markers/mt_deluxe_bus.webp';
// import mtIcAcBus from '../assets/multimodal/mt_ic_ac_bus.webp';
import mtIcOrdinaryBus from '@/resources/assets/png/cab-markers/mt_ordinary_bus.webp';
import mtExpressBus from '@/resources/assets/png/cab-markers/mt_express_bus.webp';
import mtAcBus from '@/resources/assets/png/cab-markers/mt_ac_buses.webp';
// import mtIcExpressBus from '../assets/multimodal/mt_ic_express_bus.webp';
import nyIcAmbulanceIcon from '@/resources/assets/png/cab-markers/ny_ic_ambulance_map_marker.webp';

// -------------------- CalloutText component -------------------------------
type CalloutProps = TextProps & {
    text: string | undefined;
    showEditIcon: boolean | undefined;
    backgroundColor: string;
    textColor: string;
    enableTitleCase: boolean | undefined;
};

export interface CalloutRef {
    updateText: (text: string) => void;
}

import { LayoutChangeEvent } from 'react-native';
import { Z_INDEX_DEFAULT_MARKER } from '../constants/common';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useIsFocused } from '@react-navigation/native';

// DEBUG: Marker flickering investigation
const MARKER_FLICKER_DEBUG = false;
const mapPinRenderCount = new Map<string, number>();
import { MapContext } from '../Maps/MapContext';

// Utility function to convert text to title case
const toTitleCase = (text: string): string => {
    if (!text) return text;

    return text
        .split(/[\s_-]+/) // Split by spaces, underscores, or hyphens
        .map(word => {
            if (!word) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
};

const calloutTextCache = new Map<string, string>();

export const clearCalloutTextCache = (markerKey: string | undefined) => {
    if (markerKey) {
        // eslint-disable-next-line functional/immutable-data
        calloutTextCache.delete(markerKey);
    } else {
        // eslint-disable-next-line functional/immutable-data
        calloutTextCache.clear();
    }
};

const getCachedOrPropsText = (
    markerKey: string | undefined,
    propsText: string | undefined,
    enableTitleCase: boolean | undefined,
): string | undefined => {
    if (markerKey && calloutTextCache.has(markerKey)) {
        const cached = calloutTextCache.get(markerKey);
        const result = enableTitleCase && cached ? toTitleCase(cached) : cached;
        return result;
    }
    // Otherwise use props
    const result = propsText ? (enableTitleCase ? toTitleCase(propsText) : propsText) : propsText;
    return result;
};

type CalloutPropsWithKey = CalloutProps & { markerKey: string | undefined };

const Callout = forwardRef<CalloutRef, CalloutPropsWithKey>((props, ref) => {
    const initialText = getCachedOrPropsText(props.markerKey, props.text, props.enableTitleCase);
    const [calloutText, setCalloutText] = useState<string | undefined>(initialText);

    useImperativeHandle(ref, () => {
        return {
            updateText: (text: string) => {
                const newText = props.enableTitleCase ? toTitleCase(text) : text;
                if (props.markerKey) {
                    // eslint-disable-next-line functional/immutable-data
                    calloutTextCache.set(props.markerKey, text);
                }
                setCalloutText(newText);
            },
        };
    }, [props.enableTitleCase, props.markerKey]);

    const handleEditIcon = () => {
        return NymapLocEdit;
    };

    const onLayoutHandler = (event: LayoutChangeEvent) => {
        if (props.onLayout) {
            props.onLayout(event);
        }
    };

    const isTimeStamp = calloutText?.includes('ago');

    // Check if calloutText contains '|' for split styling
    const hasSplitText = calloutText?.includes('|') ?? false;
    const splitTextParts = hasSplitText && calloutText ? calloutText.split('|') : null;
    const firstPart = splitTextParts?.[0] || '';
    const secondPart = splitTextParts?.[1] || '';

    return calloutText ? (
        <Animated.View
            onLayout={onLayoutHandler}
            style={{
                backgroundColor: props.backgroundColor,
                borderRadius: 25,
                paddingVertical: hasSplitText || isTimeStamp ? 2 : 6,
                paddingHorizontal: hasSplitText || isTimeStamp ? 10 : 16,
                flexDirection: 'row',
                borderColor: '#D3D3D3',
                borderWidth: 1,
                elevation: 5,
            }}>
            <Text
                style={{
                    color: props.textColor,
                    fontFamily: 'AreaNormal-SemiBold',
                    maxWidth: 150,
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
                numberOfLines={2}
                ellipsizeMode="tail">
                {hasSplitText || isTimeStamp ? (
                    <>
                        <Text style={{ fontFamily: 'AreaNormal-Bold', color: '#3B3A3C', fontSize: 10 }}>
                            {firstPart || calloutText}
                        </Text>
                        {hasSplitText ? (
                            <Text style={{ fontFamily: 'AreaNormal-Bold', color: '#969696', fontSize: 10 }}>
                                {' '}
                                |{secondPart}
                            </Text>
                        ) : null}
                    </>
                ) : (
                    calloutText
                )}
            </Text>
            {props.showEditIcon ? (
                <Image
                    accessible={true}
                    accessibilityLabel="edit icon image"
                    source={handleEditIcon()}
                    style={{
                        width: 12,
                        height: 12,
                        margin: 'auto',
                        marginLeft: 4,
                        marginRight: 4,
                    }}
                />
            ) : null}
        </Animated.View>
    ) : null;
});

// -------------------- End CalloutText component -------------------------------

export type IconType =
    | 'pickup'
    | 'dropoff'
    | 'vehicle'
    | 'specialZone'
    | 'lastDrop'
    | 'nearBy'
    | 'callout_primary'
    | 'multimodal'
    | 'you'
    | 'stops'
    | 'stopDot'
    | 'default'
    | 'nearByBus'
    | 'stop1'
    | 'stop2';

export type AnimatedMapPinProps = MapMarkerProps & {
    markerKey: string;
    calloutText: string | undefined;
    onClick: (() => void) | undefined;
    pinIconType: IconType;
    vehicleVariant: VehicleVariant_vehicleVariant | undefined;
    multimodalVariant: string | undefined;
    showEditIcon: boolean | undefined;
    calloutOnPress: ((markerKey: string) => void) | undefined;
    children: React.ReactNode | null;
    markerOnPress: ((markerKey: string) => void) | undefined;
    showCallout: boolean | undefined;
    displayCalloutOnPress: (() => void) | undefined;
    busStopEtaCallout:
        | ((props: {
              primaryEtaMinutes: number | undefined;
              secondaryEtaMinutes: number | undefined;
          }) => React.ReactNode)
        | undefined;
    primaryEtaMinutes: number | undefined;
    secondaryEtaMinutes: number | undefined;
};

export interface AnimatedMapPinRef extends AnimatedMarkerRef {
    updateText: (text: string) => void;
}

const imageRefs: Record<string, ImageSourcePropType> = {
    // Auto variant images
    auto0: auto0,
    auto30: auto30,
    auto60: auto60,
    auto90: auto90,
    auto120: auto120,
    auto150: auto150,
    auto180: auto180,
    auto210: auto210,
    auto240: auto240,
    auto270: auto270,
    auto300: auto300,
    auto330: auto330,

    // Mini variant images
    mini0: mini0,
    mini30: mini30,
    mini60: mini60,
    mini90: mini90,
    mini120: mini120,
    mini150: mini150,
    mini180: mini180,
    mini210: mini210,
    mini240: mini240,
    mini270: mini270,
    mini300: mini300,
    mini330: mini330,

    // Bike variant images
    bike0: bike0,
    bike30: bike30,
    bike60: bike60,
    bike90: bike90,
    bike120: bike120,
    bike150: bike150,
    bike180: bike180,
    bike210: bike210,
    bike240: bike240,
    bike270: bike270,
    bike300: bike300,
    bike330: bike330,

    // Sedan variant images
    sedan0: sedan0,
    sedan30: sedan30,
    sedan60: sedan60,
    sedan90: sedan90,
    sedan120: sedan120,
    sedan150: sedan150,
    sedan180: sedan180,
    sedan210: sedan210,
    sedan240: sedan240,
    sedan270: sedan270,
    sedan300: sedan300,
    sedan330: sedan330,

    // XL variant images
    xl0: xl0,
    xl30: xl30,
    xl60: xl60,
    xl90: xl90,
    xl120: xl120,
    xl150: xl150,
    xl180: xl180,
    xl210: xl210,
    xl240: xl240,
    xl270: xl270,
    xl300: xl300,
    xl330: xl330,

    // XL Plus variant images
    xl_plus0: xl_plus0,
    xl_plus30: xl_plus30,
    xl_plus60: xl_plus60,
    xl_plus90: xl_plus90,
    xl_plus120: xl_plus120,
    xl_plus150: xl_plus150,
    xl_plus180: xl_plus180,
    xl_plus210: xl_plus210,
    xl_plus240: xl_plus240,
    xl_plus270: xl_plus270,
    xl_plus300: xl_plus300,
    xl_plus330: xl_plus330,
};

const getMarkerByAppName = (isPickup: boolean) => {
    return isPickup ? <NyPickUpMarker width={70} height={80} /> : <NyDropMarker width={63} height={63} />;
};

const getAnchorHeight = () => {
    return 2.7;
};

const getNearestRotationAngle = (angle: number | undefined): number => {
    if (angle === undefined || angle === null) return 90;

    const normalizedAngle = ((angle % 360) + 360) % 360;

    const availableAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

    let mutableClosestAngle = availableAngles[0];
    let mutableMinDifference = 360;

    for (const availableAngle of availableAngles) {
        const difference = Math.min(
            Math.abs(normalizedAngle - availableAngle),
            360 - Math.abs(normalizedAngle - availableAngle),
        );

        if (difference < mutableMinDifference) {
            mutableMinDifference = difference;
            mutableClosestAngle = availableAngle;
        }
    }

    return mutableClosestAngle === undefined ? 90 : mutableClosestAngle;
};

function getRotationImageResource(rotation: number | undefined, variant: string) {
    const exactRotation = getNearestRotationAngle(rotation);
    const imageKey = `${variant}${exactRotation}`;
    if (imageRefs[imageKey] !== undefined) {
        return imageRefs[imageKey];
    } else {
        return imageRefs[`${variant}90`];
    }
}

function getCorrectionAngle(angle: number | undefined, spriteAngle: number): number {
    if (angle === undefined) return 90;
    if (angle > spriteAngle) {
        return -(angle - spriteAngle);
    } else {
        return Math.abs(angle - spriteAngle);
    }
}

export function getVehicleImageKeyFromVariant(variant: VehicleVariant_vehicleVariant | undefined): string {
    switch (variant) {
        case 'AUTO_RICKSHAW':
        case 'E_RICKSHAW':
            return 'auto';
        case 'BIKE':
        case 'BIKE_PLUS':
            return 'bike';
        case 'HATCHBACK':
        case 'TAXI':
            return 'mini';
        case 'SEDAN':
        case 'PREMIUM_SEDAN':
        case 'TAXI_PLUS':
        case 'BLACK':
        case 'AC_PRIORITY':
            return 'sedan';
        case 'SUV':
            return 'xl';
        case 'SUV_PLUS':
        case 'BLACK_XL':
            return 'xl_plus';
        default:
            return 'auto';
    }
}

const getPin = (
    type: IconType,
    vehicleVariant: VehicleVariant_vehicleVariant | undefined,
    rotation: number | undefined,
    handleVehicleIconLoadEnd: () => void,
    multimodalVariant: string | undefined,
    description: string | undefined,
) => {
    switch (type) {
        case 'you':
            return {
                image: (
                    <Image
                        source={mtUserWithoutYou}
                        style={{ width: 42, height: 60 }}
                        accessible={true}
                        accessibilityLabel="you icon image"
                    />
                ),
                anchorHeight: 0,
                anchorOverride: { x: 0.5, y: 1 },
            };
        case 'pickup':
            return {
                image: getMarkerByAppName(true),
                anchorHeight: getAnchorHeight(),
            };
        case 'stops':
            return {
                image: (
                    <Image
                        accessible={true}
                        accessibilityLabel="stops icon image"
                        source={mtIcStops}
                        style={{
                            width: 10,
                            height: 10,
                            marginBottom: 0,
                        }}
                    />
                ),
                anchorHeight: 0,
            };
        case 'stopDot':
            return {
                image: (
                    <Image
                        accessible={true}
                        accessibilityLabel="stop dot image"
                        source={mtIcStopDot}
                        style={{ width: 3, height: 3 }}
                    />
                ),
                anchorHeight: 0,
            };
        case 'dropoff':
            return {
                image: getMarkerByAppName(false),
                anchorOverride: { x: 0.55, y: 0.65 },
                anchorHeight: 2.7,
            };
        case 'lastDrop':
            return {
                image: <AnotherRideDrop />,
                anchorHeight: 1.4,
            };
        case 'specialZone':
            return {
                image: (
                    <Image
                        accessible={true}
                        accessibilityLabel="special zone image"
                        source={mtIcPickupGate}
                        style={{
                            width: 15,
                            height: 15,
                        }}
                    />
                ),
                anchorHeight: 1.5,
            };
        case 'callout_primary':
            return {
                image: <View />,
                anchorHeight: 1,
            };
        case 'multimodal':
            switch (multimodalVariant) {
                case 'DeluxeBus':
                    return {
                        image: (
                            <View style={{ width: 30, height: 55 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="deluxe bus image"
                                    source={mtIcDeluxeBus}
                                    style={{ width: 30, height: 55 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 0.8,
                    };
                case 'AcBus':
                    return {
                        image: (
                            <View style={{ width: 30, height: 55 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ac bus image"
                                    source={mtAcBus}
                                    style={{ width: 30, height: 55 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 0.8,
                    };
                case 'ExpressBus':
                    return {
                        image: (
                            <View style={{ width: 30, height: 55 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="express bus image"
                                    source={mtExpressBus}
                                    style={{ width: 30, height: 55 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 0.8,
                    };
                case 'OrdinaryBus':
                    return {
                        image: (
                            <View style={{ width: 30, height: 55 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ordinary bus image"
                                    source={mtIcOrdinaryBus}
                                    style={{ width: 30, height: 55 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 0.8,
                    };
                case 'Bus':
                    return {
                        image: (
                            <View style={{ width: 40, height: 70 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="multimodal bus image"
                                    source={mtIcMultimodalBus}
                                    style={{ width: 40, height: 70 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'GhostBus':
                    return {
                        image: (
                            <View style={{ width: 40, height: 60 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="multimodal ghost bus image"
                                    source={mtIcMultimodalGhostBus}
                                    style={{ width: 40, height: 60 }}
                                />
                            </View>
                        ),
                        anchorHeight: 0,
                    };
                case 'Walk':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="walk image"
                                source={mtIcWalk}
                                style={{
                                    width: 32,
                                    height: 41,
                                    marginBottom: 45,
                                }}
                            />
                        ),
                        anchorHeight: 0,
                    };
                case 'Metro':
                    return {
                        image: <MapMetroSvg height={undefined} width={undefined} />,
                        anchorHeight: 0,
                    };
                case 'Taxi':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="taxi image"
                                source={mtIcAuto}
                                style={{
                                    width: 32,
                                    height: 45,
                                    marginBottom: 45,
                                }}
                            />
                        ),
                        anchorHeight: 0,
                    };

                // for map before ride
                case 'BusBeforeRide':
                    return {
                        image: <MapBusSvg width={30} height={30} />,
                        anchorHeight: 0,
                    };
                case 'WalkBeforeRide':
                    return {
                        image: <MapWalkSvg width={30} height={30} />,
                        anchorHeight: 0,
                    };
                case 'MetroBeforeRide':
                    return {
                        image: <MapMetroSvg width={30} height={30} />,
                        anchorHeight: 0,
                    };
                case 'TaxiBeforeRide':
                    return {
                        image: <MapTaxiSvg width={30} height={30} />,
                        anchorHeight: 0,
                    };
                case 'SubwayBeforeRide':
                    return {
                        image: <MapTrainSvg width={30} height={30} />,
                        anchorHeight: 0,
                    };
                case 'BusStop':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="bus stop image"
                                source={mtBusStops}
                                style={{ width: 42, height: 60 }}
                            />
                        ),
                        anchorOverride: { x: 0.5, y: 1 },
                        anchorHeight: 3.0,
                    };
                case 'BusDepot':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="bus depot image"
                                source={mtIcMultimodalBusDepot}
                                style={{ width: 35, height: 35 }}
                            />
                        ),
                        anchorOverride: { x: 0.5, y: 1 },
                        anchorHeight: 2.2,
                    };
                case 'MetroStop':
                    return {
                        image: <MapMetroSvg width={55} height={75} />,
                        anchorOverride: { x: 0.5, y: 1 },
                        anchorHeight: 2.2,
                    };
                case 'SubwayStop':
                    return {
                        image: <MapTrainSvg width={55} height={75} />,
                        anchorOverride: { x: 0.5, y: 1 },
                        anchorHeight: 2.2,
                    };
                case 'BusAndUser':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="bus and user image"
                                source={busAndUser}
                                style={{ width: 55, height: 34 }}
                            />
                        ),
                        anchorOverride: { x: 0.5, y: 1 },
                        anchorHeight: 2.2,
                    };
                case 'StartMarker':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="start marker image"
                                source={mtIcEllipse}
                                style={{
                                    width: 16,
                                    height: 16,
                                }}
                            />
                        ),
                        anchorHeight: 0,
                    };
                case 'TrackingBus':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="tracking bus image"
                                source={mtIcBusLive}
                                style={{
                                    width: 30,
                                    height: 40,
                                }}
                            />
                        ),
                        anchorHeight: 2,
                    };
                case 'TrackingDirectedBus':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="tracking directed bus image"
                                source={mtIcMultimodalBus}
                                style={{ width: 42, height: 70 }}
                            />
                        ),
                        anchorHeight: 1.6,
                    };
                case 'TrackingMetro':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="tracking metro image"
                                source={mtIcMetroLive}
                                style={{
                                    width: 30,
                                    height: 40,
                                }}
                            />
                        ),
                        anchorHeight: 2,
                    };
                case 'TrackingWalk':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="tracking walk image"
                                source={mtIcWalkLive}
                                style={{
                                    width: 50,
                                    height: 50,
                                }}
                            />
                        ),
                        anchorHeight: 2,
                    };
                case 'TrackingTaxi':
                    return {
                        image: (
                            <Image
                                accessible={true}
                                accessibilityLabel="tracking taxi image"
                                source={mtIcAutoLive}
                                style={{
                                    width: 30,
                                    height: 40,
                                }}
                            />
                        ),
                        anchorHeight: 2,
                    };
                default:
                    return {
                        image: <PickupMarker width={60} height={60} />,
                        anchorHeight: 2,
                    };
            }
        case 'stop1':
            return {
                image: (
                    <Image
                        source={mtIcStop1}
                        style={{
                            width: 26,
                            height: 33.1825,
                        }}
                    />
                ),
                anchorHeight: 1.8,
            };
        case 'stop2':
            return {
                image: (
                    <Image
                        source={mtIcStop2}
                        style={{
                            width: 26,
                            height: 33.1825,
                        }}
                    />
                ),
                anchorHeight: 1.8,
            };
        case 'vehicle':
            switch (vehicleVariant) {
                case 'AUTO_RICKSHAW':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="auto rickshaw image"
                                    source={icAutoNavOnMap}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'HATCHBACK':
                case 'TAXI':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="hatchback image"
                                    source={icHatchbackNavOnMap}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'SEDAN':
                case 'PREMIUM_SEDAN':
                case 'TAXI_PLUS':
                case 'AC_PRIORITY':
                    return {
                        image: (
                            <View style={{ width: 40, height: 60 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="sedan image"
                                    source={icSedanNavOnMap}
                                    style={{ width: 40, height: 60 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'SUV':
                case 'SUV_PLUS':
                case 'BLACK':
                case 'BLACK_XL':
                    return {
                        image: (
                            <View style={{ width: 40, height: 70 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="suv image"
                                    source={icSuvNavOnMap}
                                    style={{ width: 40, height: 70 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'DELIVERY_BIKE':
                case 'BIKE':
                case 'BIKE_PLUS':
                    return {
                        image: (
                            <View style={{ width: 25, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="bike image"
                                    source={icBikeNavOnMap}
                                    style={{ width: 25, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'HERITAGE_CAB':
                    return {
                        image: (
                            <View style={{ width: 25, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="heritage cab image"
                                    source={icYSHeritageCabIcon}
                                    style={{ width: 25, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'EV_AUTO_RICKSHAW':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ev auto rickshaw image"
                                    source={icAutoNavOnMap}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'AMBULANCE_TAXI':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ambulance taxi image"
                                    source={nyIcAmbulanceIcon}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'AMBULANCE_TAXI_OXY':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ambulance taxi oxy image"
                                    source={nyIcAmbulanceIcon}
                                    style={{ width: 40, height: 60 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'AMBULANCE_AC':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ambulance ac image"
                                    source={nyIcAmbulanceIcon}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'AMBULANCE_AC_OXY':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ambulance ac oxy image"
                                    source={nyIcAmbulanceIcon}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'AMBULANCE_VENTILATOR':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="ambulance ventilator image"
                                    source={nyIcAmbulanceIcon}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'E_RICKSHAW':
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="e rickshaw image"
                                    source={icERickshawNavOnMap}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                default:
                    return {
                        image: (
                            <View style={{ width: 40, height: 40 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="vehicle image"
                                    source={icAutoNavOnMap}
                                    style={{ width: 40, height: 40 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 2,
                    };
            }
        case 'nearBy': {
            switch (multimodalVariant) {
                case 'ClusterBus':
                    return {
                        image: (
                            <View style={{ width: 60, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    source={{ uri: 'mt_ic_ordinary_bus' }}
                                    style={{ width: 60, height: 100, position: 'absolute' }}
                                    resizeMode="contain"
                                />
                                <View
                                    style={{
                                        width: 35,
                                        height: 35,
                                        backgroundColor: '#007AFF',
                                        borderRadius: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 2,
                                        marginTop: 24,
                                        marginLeft: 3,
                                        borderColor: 'white',
                                        zIndex: 1,
                                    }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                                        {description}
                                    </Text>
                                </View>
                            </View>
                        ),
                        anchorHeight: 2,
                    };
                case 'Bus': {
                    const BusVariantIcon = (() => {
                        switch (description) {
                            case 'AC':
                                return 'mt_ic_ac_bus';
                            case 'EXECUTIVE':
                                return 'mt_ic_deluxe_bus';
                            case 'EXPRESS':
                                return 'mt_ic_express_bus';
                            case 'ORDINARY':
                                return 'mt_ic_ordinary_bus';
                            default:
                                return 'mt_ic_ordinary_bus';
                        }
                    })();
                    return {
                        image: (
                            <View style={{ width: 30, height: 80 }}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="multimodal bus image"
                                    source={{ uri: BusVariantIcon }}
                                    style={{ width: 30, height: 80 }}
                                    onLoadEnd={handleVehicleIconLoadEnd}
                                />
                            </View>
                        ),
                        anchorHeight: 1.8,
                    };
                }
                default: {
                    const vehicleIconType = vehicleVariant ? getVehicleImageKeyFromVariant(vehicleVariant) : 'bus';
                    const randomRotation = rotation === undefined || rotation === -1 ? Math.random() * 360 : rotation;
                    return {
                        image: (
                            <Animated.View
                                style={{ width: 50, height: 50 }}
                                entering={FadeIn.duration(1000)}
                                exiting={FadeOut.duration(1000)}>
                                <Image
                                    accessible={true}
                                    accessibilityLabel="nearby vehicle image"
                                    source={getRotationImageResource(randomRotation, vehicleIconType)}
                                    style={{ width: 50, height: 50 }}
                                />
                            </Animated.View>
                        ),
                        anchorHeight: 2,
                    };
                }
            }
        }
        case 'nearByBus': {
            const iconColor = (() => {
                switch (multimodalVariant) {
                    case 'ORDINARY':
                        return 'blue-500';
                    default:
                        return 'red-500';
                }
            })();

            return {
                image: (
                    <View
                        style={tailwind.style(
                            `flex-row min-w-10 h-5 bg-${iconColor} rounded-sm border border-white items-center px-1`,
                        )}>
                        <Icon icon={<BusIcon fill={undefined} />} size={10} color="white" />

                        <Text style={tailwind.style('text-white text-xs font-bold ml-1')}>{description}</Text>
                    </View>
                ),
                anchorHeight: 2,
            };
        }
        default:
            return {
                image: (
                    <View style={{ width: 40, height: 40 }}>
                        <Image
                            accessible={true}
                            accessibilityLabel="default marker image"
                            source={icAutoNavOnMap}
                            style={{ width: 40, height: 40 }}
                            onLoadEnd={handleVehicleIconLoadEnd}
                        />
                    </View>
                ),
                anchorHeight: 2,
            };
    }
};

const AnimatedMapPin = React.memo(
    forwardRef<AnimatedMapPinRef, AnimatedMapPinProps>((props, ref): React.JSX.Element => {
        // DEBUG: Track render count
        if (MARKER_FLICKER_DEBUG && (props.markerKey === 'routeStart' || props.markerKey === 'routeStart_pin')) {
            const count = (mapPinRenderCount.get(props.markerKey) || 0) + 1;
            // eslint-disable-next-line functional/immutable-data
            mapPinRenderCount.set(props.markerKey, count);
            console.info(
                '[MARKER_FLICKER][AnimatedMapPin] RENDER #' + count,
                'key:',
                props.markerKey,
                'coord:',
                props.coordinate,
            );
        }

        const markerRef = React.useRef<AnimatedMarkerRef>(null);
        const calloutMarkerRef = React.useRef<AnimatedMarkerRef>(null);
        const busStopEtaCalloutMarkerRef = React.useRef<AnimatedMarkerRef>(null);
        const calloutTextRef = React.useRef<CalloutRef>(null);
        const [customAnchorHeight, setCustomAnchorHeight] = useState(0.5);
        const tracksViewCondition = props.pinIconType === 'vehicle' && Platform.OS === 'android';
        const [tracksViewChanges, setTracksViewChanges] = useState<boolean>(tracksViewCondition);
        const vehicleImageLoadedRef = useRef(!tracksViewCondition);
        const isScreenFocused = useIsFocused();

        const handleVehicleIconLoadEnd = useCallback(() => {
            if (Platform.OS !== 'ios' && !vehicleImageLoadedRef.current) {
                vehicleImageLoadedRef.current = true;
                setTracksViewChanges(false);
            }
        }, []);

        useEffect(() => {
            if (!isScreenFocused) vehicleImageLoadedRef.current = false;
        }, [isScreenFocused]);

        const { image, anchorOverride, anchorHeight } = getPin(
            props.pinIconType,
            props.vehicleVariant,
            props.rotation,
            handleVehicleIconLoadEnd,
            props.multimodalVariant,
            props.description,
        );
        const spriteAngle = getNearestRotationAngle(props.rotation);
        const correctionAngle = getCorrectionAngle(props.rotation, spriteAngle);

        useImperativeHandle(ref, () => {
            return {
                moveMarker: async (coord: LatLng, duration = 500, rotation?: number, rotationDuration?: number) => {
                    // awaiting only one, since both are expected to move together
                    markerRef.current?.moveMarker(coord, duration, rotation, rotationDuration);
                    await calloutMarkerRef.current?.moveMarker(coord, duration);
                },
                rotateMarker: async (angle: number, duration = 500) => {
                    await markerRef.current?.rotateMarker(angle, duration);
                },
                updateText: (text: string) => {
                    calloutTextRef.current?.updateText(text);
                },
                cancelAnimation: () => {
                    markerRef.current?.cancelAnimation();
                    calloutMarkerRef.current?.cancelAnimation();
                },
            };
        }, []);

        const handleBackgroundColor = (type: IconType) => {
            if (type === 'vehicle') {
                return 'black';
            }
            return 'white';
        };

        const handleTextColor = (type: IconType) => {
            if (type === 'vehicle') {
                return 'white';
            }
            return 'black';
        };

        // Function to calculate anchor height based on callout height
        const updateAnchorHeight = (calloutHeight: number) => {
            const anchorOffset = 40;
            const newAnchorHeight = anchorOffset / calloutHeight + 9 / calloutHeight + 1;

            setCustomAnchorHeight(newAnchorHeight);
        };

        const handleCalloutLayout = (event: LayoutChangeEvent) => {
            const { height } = event.nativeEvent.layout;
            updateAnchorHeight(height);
        };

        const dynamicAnchorHeight =
            props.pinIconType === 'dropoff' || props.pinIconType === 'pickup' ? customAnchorHeight : anchorHeight;

        const { onMarkerPress } = useContext(MapContext);
        const handleOnMarkerPress = () => {
            handleCalloutPress();
            if (props.pinIconType === 'specialZone' && props.onClick) {
                props.onClick();
            } else if (props.pinIconType === 'multimodal' && props.markerOnPress) {
                props.markerOnPress(props.markerKey);
            }
        };

        const handleCalloutPress = () => {
            if (props.displayCalloutOnPress) {
                props.displayCalloutOnPress();
                onMarkerPress();
            }
        };

        return (
            <>
                <AnimatedMarker
                    ref={markerRef}
                    coordinate={props.coordinate}
                    markerKey={props.markerKey + '_pin'}
                    onPress={
                        props.pinIconType === 'specialZone' || props.pinIconType === 'multimodal'
                            ? handleOnMarkerPress
                            : props.pinIconType === 'nearBy'
                              ? props.onClick
                              : handleCalloutPress
                    }
                    anchor={anchorOverride || { x: 0.5, y: 0.5 }}
                    zIndex={props.zIndex}
                    tracksViewChanges={Platform.OS === 'ios' ? true : tracksViewChanges}
                    opacity={props.opacity}
                    rotation={
                        props.pinIconType === 'nearBy' && !isBusTrackingIcon(props.multimodalVariant)
                            ? correctionAngle
                            : props.rotation
                    }>
                    {image}
                    {props.children}
                </AnimatedMarker>
                {props.showCallout && (
                    <AnimatedMarker
                        ref={busStopEtaCalloutMarkerRef}
                        coordinate={props.coordinate}
                        markerKey={props.markerKey + '_bus_callout'}
                        onPress={undefined}
                        anchor={{ x: 0.5, y: dynamicAnchorHeight }} // BELOW the marker
                        tracksViewChanges={false}
                        zIndex={Z_INDEX_DEFAULT_MARKER * 2}>
                        {props.busStopEtaCallout &&
                            props.busStopEtaCallout({
                                primaryEtaMinutes: props.primaryEtaMinutes,
                                secondaryEtaMinutes: props.secondaryEtaMinutes,
                            })}
                    </AnimatedMarker>
                )}
                {/* {props.calloutText ? ( */}
                {props.calloutText || (props.pinIconType === 'multimodal' && props.multimodalVariant === 'Bus') ? (
                    <AnimatedMarker
                        ref={calloutMarkerRef}
                        coordinate={props.coordinate}
                        markerKey={props.markerKey + '_callout'}
                        tracksViewChanges={Platform.OS === 'ios'}
                        anchor={{ x: isBusTrackingIcon(props.multimodalVariant) ? -0.31 : 0.5, y: dynamicAnchorHeight }}
                        zIndex={(props.zIndex ?? 0) + Z_INDEX_DEFAULT_MARKER}
                        onPress={props.showEditIcon ? props.onClick : undefined}>
                        <Callout
                            ref={calloutTextRef}
                            markerKey={props.markerKey}
                            enableTitleCase={!isBusTrackingIcon(props.multimodalVariant)}
                            // text={props.calloutText}
                            text={
                                props.calloutText ||
                                (props.pinIconType === 'multimodal' && props.multimodalVariant === 'Bus'
                                    ? props.markerKey
                                    : undefined)
                            }
                            onLayout={handleCalloutLayout}
                            onPress={props.showEditIcon ? props.onClick : undefined}
                            showEditIcon={props.showEditIcon && props.pinIconType !== 'vehicle'}
                            backgroundColor={handleBackgroundColor(props.pinIconType)}
                            textColor={handleTextColor(props.pinIconType)}
                        />
                    </AnimatedMarker>
                ) : null}
            </>
        );
    }),
);

const isBusTrackingIcon = (multimodalVariant: string | undefined) => {
    return (
        multimodalVariant === 'DeluxeBus' ||
        multimodalVariant === 'AcBus' ||
        multimodalVariant === 'ExpressBus' ||
        multimodalVariant === 'OrdinaryBus' ||
        multimodalVariant === 'Bus'
    );
};

export default AnimatedMapPin;
