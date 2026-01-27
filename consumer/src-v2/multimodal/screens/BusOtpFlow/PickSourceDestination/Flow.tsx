import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createDispatcher, Resolver } from '../../../../../src/typescript/utils/common';
import { HomeTabParamList, MainNavigationParamList } from '../../../../../src/typescript/navigation/globalParamList';
import { RootState } from '../../../../../src/typescript/state/store';
import { VehicleCategory_vehicleCategory } from '../../../../../src/readOnly/api/types/Enums.gen';
import {
    selectSortedStations,
    selectDetectedRoute,
    selectNearestStation,
    // selectBusOtpError,
    selectSourceStopsList,
    selectDestinationStopsList,
    updateNearestStation,
    updateSourceStation,
    updateDestinationStation,
    selectSourceStation,
    selectDestinationStation,
    selectDetectedRouteCode,
    resetState,
    switchRouteIndex,
    selectCurrentRouteIndex,
    selectTotalRoutes,
    selectDetectedRouteObject,
    selectServiceTierInfo,
} from '../busOtp';
import { transportStation } from '../../../../../src/readOnly/api/types/PublicTransportData.gen';
import { PickSourceDestinationAction, PickSourceDestinationViewState } from './Types';
import { PickSourceDestinationUI } from './UI';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Additional imports for journey logic
import {
    selectCurrentLocation,
    setHideLoader,
    setSearchedSource,
    setToastProps,
} from '../../../../../src/typescript/state/client/session';
import { selectSearchId, setSearchId } from '../../../../../src/typescript/state/client/user';
import { selectSelectedJourney } from '../../../../../src/typescript/state/client/search';
import { JourneyDetailsProps } from '../../JourneyInfoScreen';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectToken } from '@/typescript/state/client/auth';
import { findNearestStationForBusOtp } from '../utils';
import { selectValidBusOtpLastClickLocation, selectOperatingCity } from '@/typescript/state/client/session';
import Danger from '@/typescript/components/svg/Danger';
import { useFrfsRouteDataForBusOtp } from '../hooks/useFrfsRouteDataForBusOtp';
import { usePublicTransportUtils } from '@/src-v2/multimodal/utils/PublicTransportUtils';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { resetIds } from '@/typescript/state/sharedReducer';
import { useRecentMultimodalTrips } from '@/src-v2/multimodal/hooks/useRecentMultimodalTrips';
import { useTelephonyInfo } from '@/src-v2/multimodal/hooks/useTelephonyInfo';

type PickSourceDestinationRouteProp = RouteProp<HomeTabParamList, 'busOTPViaTicketBookingFlow'>;

export const PickSourceDestinationFlow = () => {
    const route = useRoute<PickSourceDestinationRouteProp>();
    const { otp, routeCode, resetKey } = route.params;
    const dispatch = useDispatch();
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();

    const { getRouteByCode, mapCityToFrfsCity } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    const [currentRouteCode, setCurrentRouteCode] = useState<string>(routeCode ?? '');
    const [hasReverseRoute, setHasReverseRoute] = useState<boolean>(false);
    const [isSwitchingToReverse, setIsSwitchingToReverse] = useState<boolean>(false);
    const { recentSingleModeTrips } = useRecentMultimodalTrips(false);
    const cityName = useAppSelector(selectOperatingCity);

    // Gets the Nearby Cell Tower Information.
    useTelephonyInfo();

    const detectedRouteFromCode = useMemo(() => {
        if (currentRouteCode) {
            const route = getRouteByCode(currentRouteCode);
            return route?.shortName ?? '-----';
        }
        return '-----';
    }, [currentRouteCode]);

    const frfsRouteData = useFrfsRouteDataForBusOtp({
        routeCode: currentRouteCode,
        otp,
        vehicleType: 'BUS',
        city: cityName ? mapCityToFrfsCity(cityName) : 'Chennai',
        detectedRoute: detectedRouteFromCode,
        skip: !currentRouteCode,
    });
    // Redux selectors
    const userToken = useAppSelector(selectToken);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const storedLoc = useAppSelector(selectValidBusOtpLastClickLocation);
    const sortedStations = useSelector((state: RootState) => selectSortedStations(state, otp));
    const sourceStopsList = useSelector((state: RootState) => selectSourceStopsList(state, otp));
    const destinationStopsList = useSelector((state: RootState) => selectDestinationStopsList(state, otp));
    const nearestStation = useSelector((state: RootState) => selectNearestStation(state, otp));

    const sourceStation = useSelector((state: RootState) => selectSourceStation(state, otp));
    const destinationStation = useSelector((state: RootState) => selectDestinationStation(state, otp));
    const detectedRoute = useSelector((state: RootState) => selectDetectedRoute(state, otp));
    const detectedRouteCode = useSelector((state: RootState) => selectDetectedRouteCode(state, otp));
    const detectedRouteObject = useSelector((state: RootState) => selectDetectedRouteObject(state, otp));
    const serviceTierForFallback = useSelector((state: RootState) => selectServiceTierInfo(state, otp));

    const frequentVisitDestinations = useMemo(() => {
        const destinations = new Set(recentSingleModeTrips.map(trip => trip.toStopCode));
        return destinationStopsList.filter(stop => destinations.has(stop.code));
    }, [recentSingleModeTrips, destinationStopsList]);

    const [serviceTypeFromCode, serviceTypeNameFromCode] = useMemo(() => {
        if (detectedRoute) {
            return [
                detectedRouteObject?.serviceType ?? serviceTierForFallback?.serviceTierType,
                detectedRouteObject?.serviceTypeName?.toUpperCase() ??
                    serviceTierForFallback?.serviceTierName?.toUpperCase(),
            ];
        }
        return [undefined, undefined];
    }, [detectedRoute, serviceTierForFallback]);

    // Additional Redux selectors for journey logic
    const currentLocation = useSelector(selectCurrentLocation);
    const _currentJourney = useSelector((state: RootState) => selectSelectedJourney(state, searchId));
    const searchId = useSelector((state: RootState) => selectSearchId(state, null));
    const totalRoutes = useSelector((state: RootState) => selectTotalRoutes(state, otp));
    const currentRouteIndex = useSelector((state: RootState) => selectCurrentRouteIndex(state, otp));

    const isSwitchedAutomatically = useRef(false);

    // Reset component state when resetKey changes
    useEffect(() => {
        if (resetKey) {
            console.info('ResetKey detected, clearing bus OTP state');
            dispatch(resetState({}));
            // Reset any local refs and state
            isSwitchedAutomatically.current = false;
            setCurrentRouteCode(routeCode ?? '');
            setHasReverseRoute(false);
            setIsSwitchingToReverse(false);
            setIsJourneyConfirmed(false);
            setLoadingDataForLeg(null);
        }
    }, [resetKey, routeCode]);

    useEffect(() => {
        if (currentRouteCode) {
            const currentRoute = getRouteByCode(currentRouteCode);
            setHasReverseRoute(!!currentRoute?.reverseRoute);
        } else {
            setHasReverseRoute(false);
        }
    }, [currentRouteCode]);

    // Handle completion of reverse route switching
    useEffect(() => {
        if (isSwitchingToReverse && frfsRouteData.isSuccess) {
            setIsSwitchingToReverse(false);
        }
    }, [isSwitchingToReverse, frfsRouteData.isSuccess]);

    useEffect(() => {
        // Only fetch nearest station if we have sorted stations and the FRFS data is successfully loaded
        if (sortedStations.length > 0) {
            const fetchNearestStation = async () => {
                const userLocationOverride = storedLoc ? { coords: storedLoc.coords } : undefined;
                const computedNearestStation = await findNearestStationForBusOtp(
                    sortedStations,
                    100,
                    50,
                    userLocationOverride,
                );
                if (computedNearestStation) {
                    dispatch(updateSourceStation({ otp, payload: computedNearestStation }));
                    dispatch(
                        updateNearestStation({
                            otp,
                            payload: {
                                transportStation: computedNearestStation,
                                enableSourceStopsSlicing: newFeatureFlags.enableSourceStopsSlicing,
                            },
                        }),
                    );
                }
            };
            void fetchNearestStation();
        }
    }, [sortedStations]);

    // Journey-related state
    const [isJourneyConfirmed, setIsJourneyConfirmed] = useState<boolean>(false);
    const [loadingDataForLeg, setLoadingDataForLeg] = useState<number | null>(null);
    // Journey logic
    const currentJourney = useMemo(() => {
        if (!_currentJourney) {
            return null;
        }
        return {
            ..._currentJourney,
            journeyLegs: _currentJourney.journeyLegs?.filter(leg => !['Walk', 'Taxi'].includes(leg.journeyMode)),
            modes: _currentJourney.modes?.filter(mode => !['Walk', 'Taxi'].includes(mode)),
        };
    }, [_currentJourney]);

    // Define vehicle type constant
    const BUS_VEHICLE_TYPE: VehicleCategory_vehicleCategory = 'BUS';

    const publicTransportSearch: JourneyDetailsProps = useMemo(
        () => ({
            destinationStop: destinationStation,
            originStop: sourceStation,
            recentLocationId: undefined,
            routeCode: detectedRouteCode ?? detectedRoute ?? undefined,
            startTime: undefined,
            vehicleType: BUS_VEHICLE_TYPE,
            serviceableStartTime: undefined,
            otp: otp,
            routeCodeEditedManually: currentRouteIndex !== 0,
            isSingleModeMetro: false,
        }),
        [sourceStation, destinationStation, detectedRouteCode, detectedRoute, otp],
    );

    // Set nearest station as default source when data is loaded
    useEffect(() => {
        if (nearestStation && !sourceStation) {
            dispatch(updateSourceStation({ otp, payload: nearestStation }));
        }
    }, [nearestStation, sourceStation, otp]);

    const handleSourceSelect = (station: transportStation, selectedSourceIndex: number) => {
        if (sourceStation?.code === station.code) {
            return;
        }
        dispatch(updateSourceStation({ otp, payload: station }));
        dispatch(
            updateNearestStation({
                otp,
                payload: {
                    transportStation: station,
                    enableSourceStopsSlicing: newFeatureFlags.enableSourceStopsSlicing,
                },
            }),
        );

        const remainingStations = sortedStations.slice(selectedSourceIndex + 1);

        const isDestinationInRemainingStops =
            destinationStation && remainingStations.some(station => station.code === destinationStation.code);

        if (!isDestinationInRemainingStops) {
            dispatch(updateDestinationStation({ otp, payload: undefined }));
        } else {
            setLoadingDataForLeg(0);
            dispatch(setSearchId({ payload: null, id: userToken }));
        }
    };

    const handleDestinationSelect = (station: transportStation) => {
        if (destinationStation?.code === station.code) {
            return;
        }

        setLoadingDataForLeg(0); // Set loading state for new journey search
        dispatch(setSearchId({ payload: null, id: userToken })); // reset search if destination is changing
        dispatch(updateDestinationStation({ otp, payload: station }));
    };

    const handleProceed = () => {
        if (sourceStation && destinationStation) {
            console.info('Proceeding with:', {
                otp,
                source: sourceStation.name,
                destination: destinationStation.name,
                busNumber: detectedRoute,
            });
            // TODO: Navigate to next screen or handle booking logic
        } else {
            console.warn('Please select both source and destination');
        }
    };

    const handleSwitchRoute = () => {
        if (routeCode && currentRouteCode) {
            // Handle reverse route logic when routeCode prop is provided
            const currentRoute = getRouteByCode(currentRouteCode);
            if (currentRoute?.reverseRoute) {
                console.info('Switching to reverse route:', currentRoute.reverseRoute);
                setIsSwitchingToReverse(true);
                setCurrentRouteCode(currentRoute.reverseRoute);
                // Reset destination when switching routes
                dispatch(updateDestinationStation({ otp, payload: undefined }));
                return;
            }
        }
        dispatch(switchRouteIndex(otp));
        dispatch(updateDestinationStation({ otp, payload: undefined }));
    };

    const resolver: Resolver<PickSourceDestinationAction> = async (action: PickSourceDestinationAction) => {
        switch (action.type) {
            case 'SELECT_SOURCE': {
                handleSourceSelect(action.payload.station, action.payload.selectedSourceIndex);
                break;
            }
            case 'SELECT_DESTINATION': {
                handleDestinationSelect(action.payload.station);
                break;
            }
            case 'PROCEED': {
                handleProceed();
                break;
            }
            case 'EDIT_BUS': {
                navigation.navigate(
                    'ServicesTab',
                    {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'singleModeSearch',
                            params: { bookingType: 'Bus', sourceStop: undefined, fallbackView: true, otp: otp },
                        },
                    },
                    { pop: true },
                );
                break;
            }
            case 'UNSET_SOURCE_DESTINATION': {
                dispatch(resetState({}));
                resetIds(userToken, null, dispatch);
                dispatch(setSearchedSource(currentLocation));
                dispatch(setHideLoader(false));
                break;
            }
            case 'SWITCH_ROUTE': {
                handleSwitchRoute();
                break;
            }
            default:
                break;
        }
    };

    useEffect(() => {
        if (
            destinationStopsList.length === 1 &&
            destinationStopsList[0]?.code === sourceStation?.code &&
            !isSwitchedAutomatically.current &&
            totalRoutes > 1
        ) {
            isSwitchedAutomatically.current = true;
            handleSwitchRoute();
            dispatch(updateSourceStation({ otp, payload: undefined }));
            dispatch(
                setToastProps({
                    message: 'You are on the destination stop. So we have switched the route.',
                    visible: true,
                    useSpannedToast: false,
                    spannerType: 'top',
                    backgroundColor: '#016ACD',
                    autoDismissAfter: 2000,
                    buttons: [],
                    logo: undefined,
                    onSpannedToastLoad: undefined,
                    margin: undefined,
                    customToast: undefined,
                    bottomSpanDescription: undefined,
                    dismissButton: undefined,
                }),
            );
        } else if (sourceStation && destinationStation && sourceStation.code === destinationStation.code) {
            dispatch(
                setToastProps({
                    message: 'Source and destination cannot be the same',
                    backgroundColor: '#14171F',
                    autoDismissAfter: 1500,
                    visible: true,
                    logo: <Danger />,
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
    }, [sourceStation, destinationStation, destinationStopsList]);

    const mpDispatch = createDispatcher(resolver);

    const viewState: PickSourceDestinationViewState = {
        otp,
        busNumber: detectedRoute,
        stops: sortedStations,
        selectedSource: sourceStation || undefined,
        selectedDestination: destinationStation || undefined,
        sourceStopsList,
        destinationStopsList,
        frequentVisitDestinations,
        detectedRouteCode,
        mpDispatch,
        onGoBack: () => mpDispatch({ type: 'UNSET_SOURCE_DESTINATION', payload: undefined }),
        // Journey-related data
        correctedJourneyInfoData: {
            legs: [],
            estimatedDuration: 0,
            journeyId: '',
        },
        currentJourney,
        currentLocation,
        publicTransportSearch,
        searchId,
        isSingleMode: true,
        isJourneyConfirmed,
        loadingDataForLeg: frfsRouteData.isLoading || isSwitchingToReverse ? 0 : loadingDataForLeg, // Show loading when fetching FRFS data or switching routes
        setLoadingDataForLeg,
        setIsJourneyConfirmed,
        navigation,
        onMoreOptions: undefined,
        fetchingLegsFare: false,
        isSwitchRouteEnabled:
            (totalRoutes > 1 || (!!routeCode && hasReverseRoute)) && !frfsRouteData.isLoading && !isSwitchingToReverse,
        frfsRouteDataError: frfsRouteData.error,
        frfsRouteDataLoading: frfsRouteData.isLoading,
        currentRouteCode,
        hasReverseRoute,
        isSwitchingToReverse,
        serviceType: serviceTypeFromCode,
        serviceTypeName: serviceTypeNameFromCode,
    };

    return <PickSourceDestinationUI {...viewState} />;
};
