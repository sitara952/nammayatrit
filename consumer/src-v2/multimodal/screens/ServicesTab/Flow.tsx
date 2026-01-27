import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ServicesTabScreen from './UI';

import { TransportationTypes } from '../SingleModeSearch/Types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils';
import {
    BottomSheetStage,
    selectBoatingPlaceConfig,
    selectCityConfig,
    selectCurrentLocationCoords,
    selectAppConfig,
    setBottomSheetStage,
    setFareProductType,
    selectOperatingCity,
} from '@/typescript/state/client/session';
import { useSelector } from 'react-redux';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { capitalize, isNull } from 'lodash';
import { createAction, createDispatcher, Resolver } from '@/typescript/utils/common';
import { ServiceCardProps, ServicesTabAction } from './Types';
import { useNearbyBusesData } from '../SingleModeSearch/hooks/useNearbyBusesData';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { serviceOptionList } from '@/typescript/components/ny-service/ServiceOptionList';
import { ServiceTag } from '@/src-v2/systems/configs/types';
import { logEvent, EventName } from '@/typescript/utils/logger';
import busTransit from '@/src-v2/assets/3D-assets/full-asset/bus_transit.webp';
import metroTransit from '@/src-v2/assets/3D-assets/full-asset/metro_transit.webp';
import suburbanTransit from '@/src-v2/assets/3D-assets/full-asset/suburban_transit.webp';
import mtIcBoating from '../../../../../consumer/src/typescript/assets/ny-service/mt_ic_boating_icon.webp';
import { useLazyTicketPlacePlaceIdGetQuery } from '@/api/integrations/rtk/TicketPlacePlaceIdGet';
import { ticketPlaceResp } from '@/readOnly/api/types/TicketPlaceResp.gen';
import mtIcAmbulance from '../../../../../consumer/src/typescript/assets/ny-service/mt_ic_ambulance.webp';
import { PUJA_PANDALS_URL } from '@/typescript/constants/common';
import mtIcDurgaPuja from '../../../../../consumer/src/typescript/assets/ny-service/mt_ic_durgaPuja.webp';
import { useStatusBarColor } from '@/src-v2/hooks/useStatusbarcolor';

const ServicesTab: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const currentLocation = useSelector(selectCurrentLocationCoords);

    const location = useMemo(() => {
        return {
            latitude: currentLocation?.coords?.latitude ?? 0,
            longitude: currentLocation?.coords?.longitude ?? 0,
        };
    }, [currentLocation]);

    const { nearbyRoutes, isLoading: _isNearbyBusStopsLoading } = useNearbyBusesData(location, 'BUS', true, false);
    const [nearestBusStop, setNearestBusStop] = useState<(transportStation & { distance: number }) | null>(null);
    const {
        getTwoNearestStations,
        getNearbyStations,
        getNearestStation,
        getStopRoutes,
        updateUserLocation,
        getRouteByCode,
    } = usePublicTransportUtils({
        maxStopDistance: undefined,
        enabled: true,
    });
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [getTicketPlaces] = useLazyTicketPlacePlaceIdGetQuery();
    const boatingPlaceConfig = useAppSelector(selectBoatingPlaceConfig);
    const appSystemConfig = useAppSelector(selectAppConfig);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);

    const enabledServicesV3 = useAppSelector(state => selectCityConfig(state, 'enabled_services_v3'));
    const servicesList = useMemo(
        () => serviceOptionList(userLanguageStrings, enabledServicesV3.services, undefined),
        [userLanguageStrings, enabledServicesV3],
    );

    const dispatch = useAppDispatch();
    const operatingCity = useAppSelector(selectOperatingCity);
    const cityInPascalCase = capitalize(operatingCity);

    const busList = useMemo(() => {
        if (nearbyRoutes) {
            const busList = nearbyRoutes.map(route => {
                const routeDetails = getRouteByCode(route.routeCode);
                return {
                    busNo: routeDetails?.shortName,
                    destination: routeDetails?.longName.split(' To ')[1] ?? '',
                    onPress: () => mpDispatch(createAction('BOOK_FOR_BUS_ROUTE', { routeCode: route.routeCode })),
                };
            });
            return busList;
        }
        return [];
    }, [nearbyRoutes, getRouteByCode]);

    useEffect(() => {
        if (currentLocation?.coords?.latitude && currentLocation?.coords?.longitude) {
            updateUserLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
        }
    }, [currentLocation]);

    const [nearbyStops, setNearbyStops] = useState<
        Record<VehicleCategory_vehicleCategory, (transportStation & { distance: number })[] | null>
    >({
        METRO: null,
        SUBWAY: null,
        BUS: null,
    });

    const getNearbyQuickStops = (serviceTag: ServiceTag) => {
        switch (serviceTag) {
            case 'METRO_V2':
                return nearbyStops['METRO'];
            case 'SUBWAY':
                return nearbyStops['SUBWAY'];
            case 'BUS':
            case 'BUS_V2':
                return nearbyStops['BUS'];
            default:
                return [];
        }
    };

    const quickStops =
        getNearbyQuickStops(enabledServicesV3.mainServiceTag)
            ?.slice(0, 3)
            .map(stop => ({
                name: stop.name,
                distance: stop.distance,
                onPress: () =>
                    mpDispatch(
                        createAction('SEARCH_FOR_STOP', {
                            bookingType: enabledServicesV3.mainServiceTag,
                            sourceStop: stop,
                        }),
                    ),
            })) ?? [];

    const getPublicServiceConfig = (serviceTag: ServiceTag): ServiceCardProps | undefined => {
        switch (serviceTag) {
            case 'BUS':
            case 'BUS_V2':
                return {
                    title: userLanguageStrings.Bus,
                    imgSrc: busTransit,
                    subtitle: nearbyStops['BUS']?.[0]?.distance
                        ? userLanguageStrings.StationKmAway(
                              Number((nearbyStops['BUS']?.[0]?.distance / 1000).toFixed(2)),
                          )
                        : undefined,
                    serviceTag: serviceTag,
                    onPress: () => {
                        logEvent(EventName.USER_CLICKED_SERVICES_BUS);
                        mpDispatch(
                            createAction('SINGLE_MODE_BOOKING', {
                                bookingType: 'Bus',
                                isSourceSelected: undefined,
                                isDestinationSelected: undefined,
                            }),
                        );
                    },
                    buttonText: '',
                };
            case 'METRO_V2':
                return {
                    title: userLanguageStrings.Metro,
                    imgSrc: metroTransit,
                    serviceTag: serviceTag,
                    subtitle: nearbyStops['METRO']?.[0]?.distance
                        ? userLanguageStrings.StationKmAway(
                              Number((nearbyStops['METRO']?.[0]?.distance / 1000).toFixed(2)),
                          )
                        : undefined,
                    onPress: () => {
                        logEvent(EventName.USER_CLICKED_SERVICES_METRO);
                        mpDispatch(
                            createAction('SINGLE_MODE_BOOKING', {
                                bookingType: 'Metro',
                                isSourceSelected: undefined,
                                isDestinationSelected: undefined,
                            }),
                        );
                    },
                    buttonText: '',
                };
            case 'SUBWAY':
                return {
                    title: userLanguageStrings.SubUrban,
                    imgSrc: suburbanTransit,
                    serviceTag: serviceTag,
                    subtitle: nearbyStops['SUBWAY']?.[0]?.distance
                        ? userLanguageStrings.StationKmAway(
                              Number((nearbyStops['SUBWAY']?.[0]?.distance / 1000).toFixed(2)),
                          )
                        : undefined,
                    onPress: () => {
                        logEvent(EventName.USER_CLICKED_SERVICES_SUBWAY);
                        mpDispatch(
                            createAction('SINGLE_MODE_BOOKING', {
                                bookingType: 'Train',
                                isSourceSelected: undefined,
                                isDestinationSelected: undefined,
                            }),
                        );
                    },
                    buttonText: '',
                };
            case 'BOATING':
                return {
                    title: userLanguageStrings.Boating,
                    imgSrc: mtIcBoating,
                    serviceTag: serviceTag,
                    subtitle: undefined,
                    onPress: () => {
                        const boatingPlaceId = boatingPlaceConfig.boatingPlaceId;
                        if (boatingPlaceId) {
                            getTicketPlaces({ placeId: boatingPlaceId })
                                .unwrap()
                                .then((data: ticketPlaceResp) => {
                                    navigation.navigate('EventDetails', { place: data });
                                })
                                .catch((error: Error) => {
                                    console.error('Error loading boating ticket places:', error);
                                });
                        }
                    },
                    buttonText: '',
                };
            case 'AMBULANCE_SERVICE':
                return {
                    title: userLanguageStrings.Ambulance,
                    imgSrc: mtIcAmbulance,
                    serviceTag: serviceTag,
                    subtitle: undefined,
                    onPress: () => {
                        dispatch(setFareProductType('AMBULANCE'));
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'serviceOptionCard' }));
                        navigation.navigate(
                            'mainTabNavigation',
                            {
                                screen: 'homeTab_homeScreen',
                            },
                            { pop: true },
                        );
                    },
                    buttonText: '',
                };
            case 'DURGA_PUJO':
                return {
                    title: userLanguageStrings.DiscoverPandals,
                    imgSrc: mtIcDurgaPuja,
                    serviceTag: serviceTag,
                    subtitle: undefined,
                    onPress: () => {
                        navigation.navigate('webView', {
                            url: PUJA_PANDALS_URL(
                                currentLocationCoords?.coords?.latitude || 0.0,
                                currentLocationCoords?.coords?.longitude || 0.0,
                            ),
                            goBack: undefined,
                        });
                    },
                    buttonText: '',
                };
            case 'BUS_HYBRID':
                return {
                    title: userLanguageStrings.Bus,
                    imgSrc: busTransit,
                    subtitle: userLanguageStrings.TrackAndBookYourBusRides,
                    serviceTag: serviceTag,
                    onPress: () => {
                        navigation.navigate('HomeTab', {
                            screen: 'baseHybridFlow',
                            params: {
                                viewParam: 'bt',
                                sharedPrefValues: {
                                    CUSTOMER_LOCATION: cityInPascalCase,
                                },
                            },
                        });
                    },
                    buttonText: '',
                };
            default:
                return undefined;
        }
    };

    const getMainServiceCardConfig = (serviceTag: ServiceTag): ServiceCardProps | undefined => {
        switch (serviceTag) {
            case 'BUS':
            case 'BUS_V2':
                return {
                    title: userLanguageStrings.BusBook,
                    subtitle: `${quickStops.length} ${userLanguageStrings.StopsNearYou}`,
                    buttonText: userLanguageStrings.SearchBusOrDestination,
                    imgSrc: busTransit,
                    onPress: () => {
                        logEvent(EventName.USER_CLICKED_SERVICES_BUS);
                        mpDispatch(
                            createAction('SINGLE_MODE_BOOKING', {
                                bookingType: 'Bus',
                            }),
                        );
                    },
                    serviceTag: serviceTag,
                };
            case 'BUS_HYBRID':
                return {
                    title: userLanguageStrings.BusBook,
                    subtitle: userLanguageStrings.TrackAndBookYourBusRides,
                    buttonText: userLanguageStrings.SearchBusOrDestination,
                    imgSrc: busTransit,
                    onPress: () => {
                        logEvent(EventName.USER_CLICKED_SERVICES_BUS);
                        navigation.navigate('HomeTab', {
                            screen: 'baseHybridFlow',
                            params: {
                                viewParam: 'bt',
                                sharedPrefValues: {
                                    CUSTOMER_LOCATION: cityInPascalCase,
                                },
                            },
                        });
                    },
                    serviceTag: serviceTag,
                };
            case 'SUBWAY':
                return {
                    title: userLanguageStrings.TrainBook,
                    subtitle: `${quickStops.length} ${userLanguageStrings.StationsNearYou}`,
                    buttonText: userLanguageStrings.SearchTrainOrDestination,
                    imgSrc: suburbanTransit,
                    onPress: () => {
                        logEvent(EventName.USER_CLICKED_SERVICES_SUBWAY);
                        mpDispatch(
                            createAction('SINGLE_MODE_BOOKING', {
                                bookingType: 'Train',
                            }),
                        );
                    },
                    serviceTag: serviceTag,
                };
            case 'METRO_V2':
                return {
                    title: userLanguageStrings.MetroBook,
                    subtitle: `${quickStops.length} ${userLanguageStrings.StationsNearYou}`,
                    buttonText: userLanguageStrings.SearchMetroOrDestination,
                    imgSrc: metroTransit,
                    onPress: () => {
                        logEvent(EventName.USER_CLICKED_SERVICES_METRO_V2);
                        mpDispatch(
                            createAction('SINGLE_MODE_BOOKING', {
                                bookingType: 'Metro',
                            }),
                        );
                    },
                    serviceTag: serviceTag,
                };
            default:
                return undefined;
        }
    };

    const mainServiceCardConfig = getMainServiceCardConfig(enabledServicesV3.mainServiceTag);
    const privateServices = servicesList.filter(v => v.category === 'PRIVATE');
    const publicServices = enabledServicesV3.services
        .filter(v => v.category === 'PUBLIC')
        .map(v => getPublicServiceConfig(v.serviceTag));
    const displayPublicServices = mainServiceCardConfig
        ? publicServices.filter(v => v?.serviceTag !== enabledServicesV3.mainServiceTag)
        : publicServices;

    const [isLoading, setIsLoading] = useState(true);

    const fetchNearbyStops = useCallback(() => {
        if (!location.latitude || !location.longitude) return;

        try {
            setIsLoading(true);
            const metroStation = getTwoNearestStations(location, 'METRO');
            const subwayStation = getTwoNearestStations(location, 'SUBWAY');
            const busStops = getNearbyStations('BUS', 10);

            const nearestBusStop = busStops.reduce<(transportStation & { distance: number }) | null>(
                (prev, current) => {
                    if (!prev) return current;
                    return prev.distance < current.distance ? prev : current;
                },
                null,
            );

            // keep distinct bus stops
            const distinctBusStops = busStops.filter(
                (stop, index, self) => index === self.findIndex(t => t.name === stop.name),
            );

            const filteredBusStops = appSystemConfig.flowConfig.showFirstNearestStopInServiceTab
                ? distinctBusStops
                : distinctBusStops.filter(stop => stop.code !== nearestBusStop?.code);

            if (!isNull(nearestBusStop)) {
                setNearestBusStop(nearestBusStop);
            }

            setNearbyStops({
                METRO: metroStation ? metroStation : null,
                SUBWAY: subwayStation ? subwayStation : null,
                BUS: filteredBusStops,
            });
        } catch (error) {
            console.error('Error fetching nearby stops:', error);
        } finally {
            setIsLoading(false);
        }
    }, [location, getNearbyStations, getNearestStation, getStopRoutes]);

    useEffect(() => {
        fetchNearbyStops();
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [fetchNearbyStops]);

    const resolver: Resolver<ServicesTabAction> = async action => {
        switch (action.type) {
            case 'GO_BACK':
                navigation.goBack();
                break;
            case 'SINGLE_MODE_BOOKING':
                if (action.payload) {
                    handleSingleModeBooking(action.payload.bookingType, undefined);
                }
                break;
            case 'SEARCH_FOR_STOP':
                if (action.payload) {
                    switch (action.payload.bookingType) {
                        case 'BUS_V2':
                        case 'BUS':
                            navigation.navigate('ServicesTab', {
                                screen: 'singleModeBookingNavigator',
                                params: {
                                    screen: 'singleModeSearch',
                                    params: {
                                        bookingType: 'Bus',
                                        sourceStop: action.payload.sourceStop,
                                        fallbackView: false,
                                        otp: undefined,
                                    },
                                },
                            });
                            break;
                        case 'METRO_V2':
                            handleSingleModeBooking('Metro', action.payload.sourceStop);
                            break;
                        case 'SUBWAY':
                            handleSingleModeBooking('Train', action.payload.sourceStop);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case 'BOOK_FOR_BUS_ROUTE':
                if (action.payload) {
                    navigation.navigate('ServicesTab', {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'singleModeTicketBooking',
                            params: {
                                routeCode: action.payload.routeCode,
                                vehicleType: 'BUS',
                                selectedSourceStopCode: undefined,
                            },
                        },
                    });
                }
                break;
            default:
                break;
        }
    };

    useStatusBarColor(true);

    const mpDispatch = createDispatcher(resolver);

    const handleSingleModeBooking = useCallback(
        (bookingType: TransportationTypes, station: (transportStation & { distance: number }) | undefined) => {
            switch (bookingType) {
                case 'Bus':
                    navigation.navigate('ServicesTab', {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'singleModeSearch',
                            params: {
                                bookingType: bookingType,
                                sourceStop: undefined,
                                fallbackView: false,
                                otp: undefined,
                            },
                        },
                    });
                    break;
                case 'Train':
                    navigation.navigate('ServicesTab', {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'metroSubwayBooking',
                            params: {
                                vehicleType: 'SUBWAY',
                                station,
                                triggerEditDestination: undefined,
                            },
                        },
                    });
                    break;
                case 'Metro':
                    // navigation.navigate('singleModeBookingNavigator', {
                    //     screen: 'metroSubwayBooking',
                    //     params: {
                    //         vehicleType: 'METRO',
                    //         station,
                    //         triggerEditDestination: undefined,
                    //     },
                    // });
                    navigation.navigate('ServicesTab', {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'metroSubwayBooking',
                            params: {
                                vehicleType: 'METRO',
                                station,
                                triggerEditDestination: undefined,
                            },
                        },
                    });
                    break;
                default:
                    break;
            }
        },
        [navigation],
    );

    return (
        <ServicesTabScreen
            isLoading={isLoading}
            nearestBusStop={nearestBusStop}
            busList={busList}
            publicServices={displayPublicServices.filter(v => v !== undefined)}
            privateServices={privateServices}
            mainServiceCardConfig={mainServiceCardConfig}
            quickStops={quickStops}
        />
    );
};

export default ServicesTab;
