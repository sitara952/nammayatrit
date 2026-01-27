import React, { forwardRef, useImperativeHandle } from 'react';
import Animated, {
    cancelAnimation,
    Easing,
    interpolate,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { LatLng, MapMarkerProps, Marker } from 'react-native-maps';
import { delay } from '../utils/common';

// CRITICAL: Create animated marker component ONCE at module level
// Moving this inside the component causes marker recreation on every render (flickering)
const ReanimatedMarker = Animated.createAnimatedComponent(Marker);

// DEBUG: Marker flickering investigation logs
const MARKER_DEBUG = false;
const markerRenderCount = new Map<string, number>();
const debugLog = (markerKey: string, ...args: (string | number | object)[]) => {
    if (MARKER_DEBUG && (markerKey === 'routeStart' || markerKey === 'routeStart_pin')) {
        console.info(`[MARKER_FLICKER][AnimatedMarker][${markerKey}]`, ...args);
    }
};

type AnimatedMarkerProps = MapMarkerProps & {
    markerKey: string;
};

export interface AnimatedMarkerRef {
    moveMarker: (coord: LatLng, duration: number, rotation?: number, rotationDuration?: number) => Promise<void>;
    rotateMarker: (angle: number, duration: number) => Promise<void>;
    cancelAnimation: () => void;
}

const AnimatedMarker = React.memo(
    forwardRef<AnimatedMarkerRef, AnimatedMarkerProps>((props, ref) => {
        // DEBUG: Track render count per marker
        const count = (markerRenderCount.get(props.markerKey) || 0) + 1;
        // eslint-disable-next-line functional/immutable-data
        markerRenderCount.set(props.markerKey, count);
        debugLog(props.markerKey, 'RENDER #' + count, 'coord:', props.coordinate);

        const animLat = useSharedValue(props.coordinate.latitude);
        const animLon = useSharedValue(props.coordinate.longitude);
        const animRotation = useSharedValue(props.rotation || 0);
        const isInitialRender = React.useRef(true);

        // // Sync animated values when props.coordinate changes (e.g., when marker is re-added)
        React.useEffect(() => {
            const latDiff = Math.abs(animLat.value - props.coordinate.latitude);
            const lonDiff = Math.abs(animLon.value - props.coordinate.longitude);

            debugLog(
                props.markerKey,
                'useEffect SYNC - latDiff:',
                latDiff.toFixed(6),
                'lonDiff:',
                lonDiff.toFixed(6),
                'isInitial:',
                String(isInitialRender.current),
            );

            // Snap if it's the first render or a massive jump (>0.01 deg ~= 1km)
            if (isInitialRender.current || latDiff > 0.01 || lonDiff > 0.01) {
                debugLog(props.markerKey, 'useEffect SNAPPING coordinates');
                animLat.value = props.coordinate.latitude;
                animLon.value = props.coordinate.longitude;
                animRotation.value = props.rotation || 0;
                isInitialRender.current = false;
            }
        }, [props.coordinate.latitude, props.coordinate.longitude, props.rotation]);

        const animatedProps = useAnimatedProps(() => {
            const iLat = interpolate(animLat.value, [0, 1], [0, 1]);
            const iLon = interpolate(animLon.value, [0, 1], [0, 1]);
            const iRot = interpolate(animRotation.value, [0, 1], [0, 1]);
            return {
                coordinate: {
                    latitude: iLat,
                    longitude: iLon,
                },
                rotation: iRot,
            };
        });

        useImperativeHandle(ref, () => {
            return {
                moveMarker: async (coord: LatLng, duration = 500, rotation?: number, rotationDuration?: number) => {
                    debugLog(props.markerKey, 'moveMarker called - to:', coord, 'duration:', duration);
                    const timingConfig = {
                        duration,
                        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                    };
                    animLat.value = withTiming(coord.latitude, timingConfig);
                    animLon.value = withTiming(coord.longitude, timingConfig);

                    if (rotation !== undefined) {
                        animRotation.value = withTiming(rotation, {
                            ...timingConfig,
                            duration: rotationDuration ?? duration,
                        });
                    }
                    await delay(duration);
                },
                rotateMarker: async (angle: number, duration = 500) => {
                    animRotation.value = withTiming(angle, { duration });
                    await delay(duration);
                },
                cancelAnimation: () => {
                    cancelAnimation(animLat);
                    cancelAnimation(animLon);
                    cancelAnimation(animRotation);
                },
            };
        }, []);

        const { coordinate: _coord, rotation: _rot, ...restProps } = props;

        const currentCoord: LatLng = {
            latitude: animLat.value,
            longitude: animLon.value,
        };
        const currentRotation = animRotation.value;

        return (
            <ReanimatedMarker
                animatedProps={animatedProps}
                key={props.markerKey}
                {...restProps}
                coordinate={currentCoord}
                rotation={currentRotation}>
                {props.children}
            </ReanimatedMarker>
        );
    }),
);

export default AnimatedMarker;
