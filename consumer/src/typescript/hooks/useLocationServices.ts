import { useCallback, useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    selectAppState,
    selectCurrentLocationCoords,
    setCurrentLocationCoords,
    setToastProps,
    selectAppConfig,
    setHasRequestedForeGps,
} from '@/typescript/state/client/session';
import {
    GeolocationResponse,
    getBestPossibleLocation,
    isGpsEnabled,
    isLocationPermissionGranted,
} from '@/typescript/utils/location';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { isEqual } from 'lodash';
import { DEFAULT_CAMERA_ZOOM, DEFAULT_CAMERA_ZOOM_HOME_SCREEN } from '@/typescript/constants/common';
import { useAppStateChange } from '@/typescript/hooks/useAppState';
import { Platform } from 'react-native';
import { MapContext } from '../Maps/MapContext';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';
import { useLocationPermissionModal } from '@/src-v2/utils/common';

interface UseLocationServicesProps {
    initialize: boolean;
}

export const useLocationServices = ({ initialize }: UseLocationServicesProps) => {
    const appConfig = useAppSelector(selectAppConfig);
    const isMultiModal = appConfig.appType === 'multimodal';
    const dispatch = useAppDispatch();
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const [checkingForGps, setCheckingForGps] = useState(false);
    const [locationGranted, setLocationGranted] = useState(false);
    const appState = useAppSelector(selectAppState);
    const { mapRef } = useContext(MapContext);
    const { openLocationPermissionModal, dismissLocationPermissionModal } = useLocationPermissionModal();
    const { setAutoClearTimeout } = useAutoClearTimeout();
    const recenterLocationAsync = useCallback(
        async (zoomLevel: number | undefined, position: GeolocationResponse | undefined) => {
            const overrideZoomLevel = Platform.OS === 'ios' ? DEFAULT_CAMERA_ZOOM_HOME_SCREEN : DEFAULT_CAMERA_ZOOM;
            const location = position ? position : await getBestPossibleLocation();
            if (location && mapRef.current) {
                setAutoClearTimeout(
                    () =>
                        mapRef.current &&
                        mapRef.current.animateCamera({
                            lat: location?.coords?.latitude,
                            lon: location?.coords?.longitude,
                            zoom: zoomLevel ?? overrideZoomLevel,
                            duration: undefined,
                        }),
                    300,
                );
                !isMultiModal && mapRef.current.removeAllPolylines();
                !isEqual(currentLocationCoords, location) && dispatch(setCurrentLocationCoords(location));
            }
        },
        [currentLocationCoords, mapRef],
    );

    const recenterLocation = useCallback(
        (zoomLevel?: number, position?: GeolocationResponse) => {
            recenterLocationAsync(zoomLevel, position);
        },
        [recenterLocationAsync],
    );

    const updateCurrentPosition = useCallback(
        async (position: GeolocationResponse) => {
            position && dispatch(setCurrentLocationCoords(position));
            await recenterLocation(undefined, position);
        },
        [dispatch, recenterLocation],
    );

    const fetchPermissionStatus = useCallback(async () => {
        const locationPermissionGranted = await isLocationPermissionGranted();
        if (!locationPermissionGranted) {
            setCheckingForGps(false);
            openLocationPermissionModal();
        } else {
            const gpsGranted = await isGpsEnabled();
            if (!gpsGranted) {
                setCheckingForGps(true);
                openLocationPermissionModal();
                dispatch(setHasRequestedForeGps(true));
            }
        }
    }, [openLocationPermissionModal, dispatch]);

    const initCurrentLocation = useCallback(async () => {
        const granted = await isLocationPermissionGranted();
        if (granted) {
            const gpsEnable = await isGpsEnabled();
            if (gpsEnable) {
                mapRef.current?.setCurrentLocationMarkerVisibility(true);
                try {
                    const location = await getBestPossibleLocation();
                    updateCurrentPosition(location);
                    dismissLocationPermissionModal();
                } catch (error) {
                    console.error('Failed to get location with all fallback strategies:', error);
                    dispatch(
                        setToastProps({
                            visible: true,
                            message: 'Failed to get your location. Please check your location settings and try again.',
                            backgroundColor: `${colors.red900}`,
                            autoDismissAfter: 1500,
                            logo: undefined,
                            buttons: [],
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            customToast: undefined,
                            margin: undefined,
                        }),
                    );
                }
            } else {
                setCheckingForGps(true);
                setTimeout(() => openLocationPermissionModal(), 200);
            }
        } else {
            setCheckingForGps(false);
            openLocationPermissionModal();
        }
    }, [mapRef, updateCurrentPosition, openLocationPermissionModal]);

    useEffect(() => {
        const initCurrentLocAndRecenter = async () => {
            await initCurrentLocation();
        };
        if (appState === 'active' && initialize) initCurrentLocAndRecenter();
    }, [locationGranted, appState]);

    useAppStateChange({
        onActive: async () => {
            if (initialize) {
                console.info('handleRequestPermission onActive');
                await fetchPermissionStatus();
            }
        },
        onBackground: () => {
            if (initialize) {
                console.info('App is in background.');
            }
        },
    });
    return {
        checkingForGps,
        locationGranted,
        setLocationGranted,
        initCurrentLocation,
        recenterLocation,
        fetchPermissionStatus,
        updateCurrentPosition,
    };
};
