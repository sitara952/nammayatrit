import {
    selectDisabilityListResp,
    selectSearchId,
    selectSpecialAssistance,
    selectUserProfile,
    setDisabilityListResp,
    setSearchId,
    setSpecialAssistance,
} from '@/typescript/state/client/user';
import { HomeScreenView, HomeScreenViewProps } from './UI';
import { HomeScreenFragmentProps, HomeScreenScreenAction } from './Types';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectToken } from '@/typescript/state/client/auth';
import {
    BottomSheetStage,
    clearSession,
    SearchInput,
    selectBottomSheetStage,
    selectCityConfig,
    selectCurrentLocationCoords,
    selectIsCurrentLocationServiceable,
    selectNewFeatureFlags,
    selectOperatingCity,
    selectScreenReaderEnabled,
    setActiveInput,
    setBottomSheetStage,
    setCurrentLocation,
    setGreetedUser,
    setIsCurrentLocationServiceable,
    setIsServiceable,
    selectFlowStatusValidated,
    setOperatingCity,
    setSearchedSource,
    setRecallFlowStatus,
    selectRecallFlowStatus,
    setIsMetroServiceable,
    setIsSubwayServiceable,
    selectNearbyDriversConfig,
    setToastProps,
    resetToastProps,
    setChooseRideGoBackStage,
    selectAppConfig,
    setPtRestrictedHours,
} from '@/typescript/state/client/session';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NotificationContext } from '@/typescript/context/NotificationContext';
import { useFollowRideMutation } from '@/typescript/state/server/followRide';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import { checkPtServiceable, createDispatcher, getCityFromCode, Resolver, safe } from '@/typescript/utils/common';
import { useNetInfo } from '@react-native-community/netinfo';
import { disabilityArray } from '@/readOnly/api/types/DisabilityArray.gen';
import { transformDisabilityTypeToDescription } from '@/typescript/components/SpecialAssistance';
import { useSharedValue } from 'react-native-reanimated';
import CleverTap from 'clevertap-react-native';
import { capitalize } from 'lodash';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { getPlaceNameByEnum } from '@/api/apiTypes/GetPlaceNameApi.gen';
import { deleteItem, getNumberItem, getStringItem, MMKVKey, setStringItem } from '@/typescript/utils/MMKV';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useDeepLinking } from '@/typescript/screens/home/hooks/useDeepLinking';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getCityComponentConfig } from '@/src-v2/systems/configs/helpers';
import { useLazyDisabilityListGetQuery } from '@/api/integrations/rtk/DisabilityListGet';
import { AccessibilityInfo, ActivityIndicator, Platform } from 'react-native';
import { MapContext } from '@/typescript/Maps/MapContext';
import { resetIdsAndPurge } from '@/typescript/state/sharedReducer';
import { useGetNearbyDriversMutation } from '@/typescript/state/server/nearbyDriversApi';
import { selectNearbyMarkerLocation } from '@/typescript/state/client/maps';
import { usePublicTransportUtils } from '@/src-v2/multimodal/utils/PublicTransportUtils';
import { markerData } from '@/typescript/Maps/MapType';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { useLocationServices } from '@/typescript/hooks/useLocationServices';
import { usePublicTransportData } from '@/src-v2/multimodal/hooks/usePublicTransportData';
import { useFlowStatusHandler } from '@/typescript/hooks/useFlowStatusHandler';
import { logger } from '@/src-v2/systems/logger';
import { useLazyGetProfileQuery } from '@/typescript/state/server/userApi';

export const HomeScreen_ = ({ multimodalProps }: { multimodalProps: MultimodalTaxiTrackingProps | undefined }) => {
    const configManager = useConfigContext();
    const componentConfig = getCityComponentConfig(configManager);
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const userToken = useAppSelector(selectToken);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const { enableLocationUnserviceable } = useAppSelector(selectNewFeatureFlags);
    const isCurrentLocationServiceable = useAppSelector(selectIsCurrentLocationServiceable);
    const userProfile = useAppSelector(selectUserProfile);
    const customerCancellationBannerConfig = useAppSelector(state =>
        selectCityConfig(state, 'customer_cancellation_banner_threshold'),
    );
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const appConfig = useAppSelector(selectAppConfig);
    const isMultimodal = appConfig.appType === 'multimodal';
    const { updateUserLocation, getNearbyStations } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: isMultimodal,
    });

    const screenReaderEnabled = useAppSelector(selectScreenReaderEnabled);
    const specialAssistance = useAppSelector(selectSpecialAssistance);
    const disabilityListRes = useAppSelector(selectDisabilityListResp);

    const dispatch = useAppDispatch();
    const { referralModalRef } = useDeepLinking();

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [notificationData, _] = useContext(NotificationContext);
    const { mapRef } = useContext(MapContext);
    const { tipsBottomSheetModalRef, retryBoostedSearchModalRef, newBookingFlowSheetRef } = useRefsContext();

    const progress = useSharedValue<number>(0);
    const [hideAccessibility, setHideAccessibility] = useState(false);
    const [searchPollingInterval, setSearchPollingInterval] = useState(1000);
    const [isTryBoostedSearchModalOpen, setIsTryBoostedSearchModalOpen] = useState(false);
    const [triggerDisabilityListApi, disabilityListResp] = useLazyDisabilityListGetQuery();
    const [followRide] = useFollowRideMutation();
    const [fetchProfile] = useLazyGetProfileQuery();
    const mapId = mapRef.current?.mapId ?? 'MapBeforeRide';
    const nearbyMarkerLocation = useAppSelector(state => selectNearbyMarkerLocation(state, mapId));
    const nearbyDriversConfig = useAppSelector(selectNearbyDriversConfig);
    // const { isConnected } = useNetworkSpeedCheck();
    const netinfo = useNetInfo();
    const rawNetInfo = useNetInfo();
    const recallFlowStatus = useAppSelector(selectRecallFlowStatus);

    const flowStatusValidated = useAppSelector(selectFlowStatusValidated);
    const { checkFlowStatus } = useFlowStatusHandler({ autoTrigger: false });

    useFocusEffect(
        useCallback(() => {
            const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            if (verificationStartTime) {
                fetchProfile()
                    .unwrap()
                    .then(profileData => {
                        // If business email is verified, delete the key as it's no longer needed
                        if (profileData?.businessEmail && profileData?.businessProfileVerified === true) {
                            deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                        }
                    })
                    .catch(() => {
                        // Silently handle errors, don't break the flow
                    });
            }
        }, [fetchProfile]),
    );

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                if (verificationStartTime) {
                    fetchProfile()
                        .unwrap()
                        .then(profileData => {
                            // If business email is verified, delete the key as it's no longer needed
                            if (profileData?.businessEmail && profileData?.businessProfileVerified === true) {
                                deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                            }
                        })
                        .catch(() => {
                            // Silently handle errors, don't break the flow
                        });
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [fetchProfile]);

    useEffect(() => {
        if (rawNetInfo.isConnected && !flowStatusValidated) {
            console.info('[FlowStatus]: Checking flow status', netinfo.isConnected);
            checkFlowStatus(true);
        }
    }, [rawNetInfo.isConnected]);

    useEffect(() => {
        if (recallFlowStatus) {
            checkFlowStatus(true);
            logger.logError('had to recall flow status', 'HSStage');
            dispatch(setRecallFlowStatus(false));
        }
    }, [recallFlowStatus]);

    const [getNearbyDrivers] = useGetNearbyDriversMutation();

    const { checkingForGps, locationGranted, setLocationGranted, recenterLocation } = useLocationServices({
        initialize: bottomSheetStage == BottomSheetStage.Home,
    });

    useEffect(() => {
        if (
            !nearbyDriversConfig.enabled ||
            nearbyMarkerLocation.lat == null ||
            nearbyMarkerLocation.lon == null ||
            (Platform.OS === 'android' && !nearbyDriversConfig.androidEnabled)
        )
            return;

        if (bottomSheetStage !== BottomSheetStage.Home) {
            return;
        }

        let mutableIsActive = true;

        const fetchLoop = async () => {
            if (!mutableIsActive) return;

            try {
                getNearbyDrivers({
                    body: {
                        location: {
                            lat: nearbyMarkerLocation.lat,
                            lon: nearbyMarkerLocation.lon,
                        },
                        radius: nearbyDriversConfig.radius,
                    },
                });
            } catch (err) {
                console.error('[DebugNearByDrivers] HomeScreen - Fetch error:', err);
            } finally {
                if (mutableIsActive) {
                    setTimeout(fetchLoop, nearbyDriversConfig.refreshInterval);
                }
            }
        };

        fetchLoop();

        return () => {
            mutableIsActive = false;
        };
    }, [
        nearbyDriversConfig.enabled,
        nearbyDriversConfig.radius,
        nearbyDriversConfig.refreshInterval,
        nearbyDriversConfig.androidEnabled,
        nearbyMarkerLocation.lat,
        nearbyMarkerLocation.lon,
        bottomSheetStage,
    ]);

    useEffect(() => {
        updateUserLocation(currentLocationCoords?.coords?.latitude, currentLocationCoords?.coords?.longitude);
    }, [currentLocationCoords]);

    useEffect(() => {
        const nearbyStations = getNearbyStations(undefined, undefined);
        if (nearbyStations && mapRef?.current && isMultimodal) {
            // Add current location marker
            mapRef.current?.addMarker({
                coordinate: {
                    latitude: currentLocationCoords?.coords?.latitude || 0.0,
                    longitude: currentLocationCoords?.coords?.longitude || 0.0,
                },
                id: 'current-location',
                title: '',
                iconType: 'you',
                vehicleVariant: undefined,
                multimodalVariant: undefined,
                showEditIcon: false,
                zIndex: 2, // Higher zIndex to show above other markers
                anchor: { x: 0.5, y: 0.5 },
                rotateEnabled: false,
                rotation: 0,
                children: null,
                style: undefined,
                onClick: undefined,
                markerOnPress: undefined,
            });

            const markersData: markerData[] = nearbyStations.map((station: transportStation) => {
                const isMetro = station.vehicleType === 'METRO';
                return {
                    id: station.name,
                    coordinate: {
                        latitude: station.lat,
                        longitude: station.lon,
                    },
                    children: null,
                    zIndex: 1,
                    anchor: { x: 0.5, y: 0.5 },
                    rotation: 0,
                    rotationEnabled: false,
                    visible: true,
                    title: '',
                    description: '',
                    style: {},
                    ref: undefined,
                    markerKey: station.name,
                    pinIconType: 'multimodal',
                    multimodalVariant: isMetro ? 'Metro' : 'Bus',
                    showEditIcon: false,
                    onClick: undefined,
                    calloutText: undefined,
                    calloutOnPress: undefined,
                    vehicleVariant: undefined,
                    markerOnPress: undefined,
                    showCallout: undefined,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                };
            });
            mapRef.current?.addMarkersFromArray({
                markersArray: markersData,
                routeId: undefined,
                forceUpdate: undefined,
            });
        }
    }, [isMultimodal]);

    const resetSearch = useCallback(() => {
        setSearchPollingInterval(1000);
    }, []);

    const stopSearch = useCallback(() => {
        setSearchPollingInterval(0);
    }, []);

    const retryBoostSearchBackPress = () => {
        logEvent(EventName.NY_NO_RETRY);
        setIsTryBoostedSearchModalOpen(false);
        retryBoostedSearchModalRef?.current?.close();
        tipsBottomSheetModalRef?.current?.close();
        resetSearch();
        dispatch(clearSession());
        resetIdsAndPurge(userToken, null, dispatch);
        navigation.popTo('mainTabNavigation', {
            screen: 'homeTab_homeScreen',
            params: {
                journeyDetailsProps: undefined,
                multimodalProps: multimodalProps,
            },
        });
    };

    const navigateToSearch = () => {
        dispatch(setSearchId({ id: userToken, payload: null }));
        dispatch(setActiveInput(SearchInput.Destination));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'home_navigateToSearch' }));
        navigation.popTo('mainTabNavigation', {
            screen: 'homeTab_homeScreen',
            params: {
                journeyDetailsProps: undefined,
                multimodalProps: multimodalProps,
            },
        });
    };

    const currentCity = useAppSelector(selectOperatingCity);
    const { refreshData, isDataLoaded, isDataAvailable } = usePublicTransportData(true);
    const isCUG = getStringItem(MMKVKey.LOCAL_CUG_ENABLED);

    useEffect(() => {
        if (isCUG === 'true') {
            if (!isDataAvailable && !isDataLoaded) {
                dispatch(
                    setToastProps({
                        message: userLanguageStrings.SettingUpThings,
                        backgroundColor: '#14171F',
                        autoDismissAfter: undefined,
                        visible: true,
                        logo: <ActivityIndicator />,
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
            } else if (isDataAvailable || isDataLoaded) {
                dispatch(resetToastProps());
            }
        }
    }, [isDataAvailable, dispatch]);

    const sourceData = useMemo(() => {
        if (currentLocationCoords?.coords !== undefined) {
            const getAsyncSourceLocation = async () => {
                const placeNameEnum: getPlaceNameByEnum = {
                    TAG: 'PlaceByLatLon',
                    _0: {
                        contents: {
                            lat: currentLocationCoords?.coords.latitude,
                            lon: currentLocationCoords?.coords.longitude,
                        },
                        tag: '',
                    },
                };
                const data = await safe(
                    GetLocationAndServiceability.getLocationObjectAndServiceability(
                        placeNameEnum,
                        undefined,
                        undefined,
                        undefined,
                        'source',
                    ),
                );
                if (data.result) {
                    const { location, isMetroServiceable, isSubwayServiceable, ptRestrictedHours } = data.result;

                    const ptServiceable = checkPtServiceable(ptRestrictedHours);
                    const city = getCityFromCode(location.serviceabilityCity || '');
                    if (city !== currentCity) {
                        dispatch(
                            setToastProps({
                                message: userLanguageStrings.LoadingStopsAndStations,
                                backgroundColor: '#14171F',
                                autoDismissAfter: 10000,
                                visible: true,
                                logo: <ActivityIndicator />,
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
                        await refreshData();
                        dispatch(resetToastProps());
                    }
                    dispatch(setOperatingCity(city));
                    dispatch(setSearchedSource(location));
                    dispatch(setCurrentLocation(location));
                    dispatch(setIsServiceable(location.serviceable ?? true));
                    dispatch(setIsMetroServiceable(ptServiceable?.isMetroServiceable ?? isMetroServiceable ?? true));
                    dispatch(setIsSubwayServiceable(ptServiceable?.isSubwayServiceable ?? isSubwayServiceable ?? true));
                    dispatch(setPtRestrictedHours(ptRestrictedHours));
                    dispatch(setIsCurrentLocationServiceable(location.serviceable ?? true));
                    setStringItem(MMKVKey.OPERATING_CITY, capitalize(city));
                    const customerLocation = {
                        'Customer Location': city,
                    };
                    CleverTap.profileSet(customerLocation);
                }
                return data.result?.location ?? null;
            };
            return getAsyncSourceLocation();
        }
        return undefined;
    }, [currentLocationCoords?.coords?.latitude, currentLocationCoords?.coords?.longitude]);

    const triggerDisabilityApiParams = useMemo(() => ({}), []);

    useEffect(() => {
        // Only trigger if we don't already have the data
        if (!disabilityListResp.data && !disabilityListResp.isLoading) {
            triggerDisabilityListApi(triggerDisabilityApiParams);
        }
    }, [disabilityListResp.data, disabilityListResp.isLoading]);

    const updateDisabilityState = useCallback(
        (data: disabilityArray | undefined) => {
            if (data) {
                const disabilityObj = data?.find(
                    item => item.description === transformDisabilityTypeToDescription(userProfile?.disability),
                );
                dispatch(setSpecialAssistance({ id: userToken, payload: disabilityObj }));
            }
        },
        [userProfile?.disability, userToken],
    );

    const disabilityRespPayload = useMemo(() => {
        if (disabilityListResp.data) {
            return {
                id: userToken,
                payload: disabilityListResp.data,
            };
        }
        return null;
    }, [userToken, disabilityListResp.data]);

    useEffect(() => {
        if (disabilityRespPayload) {
            dispatch(setDisabilityListResp(disabilityRespPayload));
            updateDisabilityState(disabilityListResp.data);
        }
    }, [disabilityRespPayload, disabilityListResp.data]);

    useEffect(() => {
        console.info('ComponentConfig Info: ', componentConfig);
        if (
            ['FOLLOW_RIDE', 'SHARE_RIDE', 'SOS_RESOLVED'].includes(notificationData.notification_type) ||
            userProfile?.followsRide
        ) {
            followRide({});
        }
    }, [notificationData.notification_type, userProfile?.followsRide]);

    useEffect(() => {
        return () => {
            // Dismiss Modal Reference when this unmounts
            referralModalRef?.current?.dismiss();
        };
    }, []);

    useEffect(() => {
        if (bottomSheetStage !== BottomSheetStage.Home) {
            dispatch(setGreetedUser(true));
        }
        if (bottomSheetStage !== BottomSheetStage.Search) {
            newBookingFlowSheetRef.current?.snapToIndex(0);
        }
        // handling Accessibility
        switch (bottomSheetStage) {
            case BottomSheetStage.Home:
                mapRef.current?.addMapPadding({ left: 0, top: 10, right: 0, bottom: 0 });
                mapRef.current?.clearRoute();
                updateDisabilityState(disabilityListRes);
                AccessibilityInfo.announceForAccessibility('Home Screen');
                break;
            case BottomSheetStage.Search:
                AccessibilityInfo.announceForAccessibility('Location Search Screen');
                dispatch(setChooseRideGoBackStage(BottomSheetStage.Search));
                break;
            case BottomSheetStage.ChooseRide:
                AccessibilityInfo.announceForAccessibility('Confirm your ride Screen');
                break;
            case BottomSheetStage.ConfirmPickup:
                AccessibilityInfo.announceForAccessibility('Confirm pickup location screen');
                break;
            case BottomSheetStage.LookingForRides:
                AccessibilityInfo.announceForAccessibility('Searching for Driver Screen');
                break;
            case BottomSheetStage.IntercitySearchDetails:
                AccessibilityInfo.announceForAccessibility('Intercity Driver search Screen');
                break;
            case BottomSheetStage.RetryBoostedSearch:
                AccessibilityInfo.announceForAccessibility('');
                break;
            case BottomSheetStage.SearchErrorStates:
                AccessibilityInfo.announceForAccessibility('');
                break;
        }
    }, [bottomSheetStage]);

    const resolver: Resolver<HomeScreenScreenAction> = useCallback(async action => {
        switch (action.type) {
            case 'DUMMY_ACTION':
                break;

            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    }, []);

    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);
    const homeScreenFragmentState: HomeScreenFragmentProps = {
        bottomSheetStage,
        profile: userProfile,
        isMultimodal,
        customerCancellationBannerConfig,
        navigation,
        screenReaderEnabled,
        specialAssistance,
        rcsDispatch,
        hideAccessibility,
        setHideAccessibility,
        locationGranted,
        checkingForGps,
        sourceData,
        progress,
        searchPollingInterval,
        stopSearch,
        resetSearch,
        recenterLocation,
        setLocationGranted,
        navigateToSearch,
        retryBoostSearchBackPress,
        setIsTryBoostedSearchModalOpen,
        isTryBoostedSearchModalOpen,
        searchId,
        multimodalProps,
    };

    const viewState: HomeScreenViewProps = {
        userProfile,
        enableLocationUnserviceable,
        isCurrentLocationServiceable,
        homeScreenFragmentState,
    };

    return <HomeScreenView {...viewState} />;
};
