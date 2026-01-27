import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import type { LatLng } from 'react-native-maps';
import type MapView from 'react-native-maps';
import type { EdgePadding } from 'react-native-maps';
import { fitToCoordinates } from '../MapUtils.ts';

const DEFAULT_FIT_DURATION = Platform.OS === 'ios' ? 650 : 450;

export function useSerializedFitToCoordinates(
    mapPaddingRef: React.RefObject<EdgePadding>,
    mapRef: React.RefObject<MapView | null>,
) {
    const isAnimatingFitRef = useRef(false);
    const pendingFitRef = useRef<null | (() => void)>(null);

    const fitToCoordinatesSerialized = useCallback(
        (params: { coordinates: LatLng[]; duration: number | undefined }) => {
            const run = () => {
                isAnimatingFitRef.current = true;

                fitToCoordinates(params, mapPaddingRef, mapRef);

                const duration = params.duration ?? DEFAULT_FIT_DURATION;
                console.info('duration', duration);

                setTimeout(() => {
                    isAnimatingFitRef.current = false;

                    if (pendingFitRef.current) {
                        const next = pendingFitRef.current;
                        pendingFitRef.current = null;
                        next();
                    }
                }, duration);
            };

            if (isAnimatingFitRef.current) {
                pendingFitRef.current = run;
            } else {
                run();
            }
        },
        [mapPaddingRef, mapRef],
    );

    return {
        fitToCoordinatesSerialized,
        isAnimatingFit: isAnimatingFitRef,
    };
}
