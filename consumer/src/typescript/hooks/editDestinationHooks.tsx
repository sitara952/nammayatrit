import { ActivityIndicator } from 'react-native';
import { getRoutesReq } from '../../readOnly/api/types/GetRoutesReq.gen';
import { getLocationsFromPredictions } from '../../api/autoComplete/AutoComplete.gen';
import {
    useEditBookingUpdateRequestIdResultGet,
    Keys as EditBookingKey,
} from '../../api/integrations/EditBookingUpdateRequestIdResultGetRQ.bs';
import { autoCompleteReq } from '../../readOnly/api/types/AutoCompleteReq.gen.tsx';
import { debounce } from 'lodash';
import { location, locationWithServiceability } from '../../helpers/utils/Location/LocationTypes.gen';
import {
    EditDestinationProps,
    EditDestSubView,
    MultimodalExtendLegPropsType,
} from '../screens/editLocation/EditDestination';
import { useNavigation } from '@react-navigation/native';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import Toast from 'react-native-root-toast';
import { decodeError } from '../utils/error';
import { transformSnappedToLatLon } from '@/api/apiTypes/RouteAPI.gen';
import { routeInfo } from '@/readOnly/api/types/RouteInfo.gen';
import type { latLng as ReactMap_latLng } from '@/helpers/externalModules/GMap/ReactMap.gen';
import { setToastProps } from '@/typescript/state/client/session';
import { useAppSelector } from '../state/hooks';

import { useDispatch } from 'react-redux';
import { selectEditLocationAttempts, selectRideDetailsWithId, setEditLocationAttempts } from '../state/client/ride';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { useRoutePostMutation } from '@/api/integrations/rtk/RoutePost';
import { useConfigContext } from '../context/ConfigContext';
import { useMapsAutoCompletePostMutation } from '@/api/integrations/rtk/MapsAutoCompletePost';
import { useMultimodalExtendJourneyIdLegGetfarePostMutation } from '@/api/integrations/rtk/MultimodalExtendJourneyIdLegGetfarePost';
import { extendLegGetFareResp } from '@/readOnly/api/types/ExtendLegGetFareResp.gen';
import {
    multimodalExtendJourneyIdLegPostWithParams,
    useMultimodalExtendJourneyIdLegPostMutation,
} from '@/api/integrations/rtk/MultimodalExtendJourneyIdLegPost';
import { extendLegStartPoint } from '@/readOnly/api/types/ExtendLegStartPoint.gen';
import { transformLocationToAPIEntity } from '../utils/placeUtils';
import React from 'react';
import { setJourneyRefreshFlag } from '@/typescript/state/client/journey';
import {
    rideRideIdEditLocationPostWithParams,
    useRideRideIdEditLocationPostMutation,
} from '@/api/integrations/rtk/RideRideIdEditLocationPost';
import { useEditResultBookingUpdateRequestIdConfirmPostMutation } from '@/api/integrations/rtk/EditResultBookingUpdateRequestIdConfirmPost';
import { createRideId } from '../state/client/booking';
import { emptyLocationAddress } from '@/src-v2/utils/location';
import { KeyboardController } from 'react-native-keyboard-controller';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../navigation/globalParamList.tsx';
import { selectBookedStopsWithId } from '../state/client/booking';
import { selectBookingId } from '../state/client/user';

export const useEditDestination = (
    props: EditDestinationProps,
    bookingUpdateRequestId: string | null,
    setBookingUpdateRequestId: React.Dispatch<React.SetStateAction<string | null>>,
    getUpdatedDataInterval: number,
    setSearchData: React.Dispatch<React.SetStateAction<location[]>>,
    editDestSubView: EditDestSubView,
    setEditDestSubView: React.Dispatch<React.SetStateAction<EditDestSubView>>,
    setExtendLegFare: React.Dispatch<React.SetStateAction<extendLegGetFareResp | null>>,
) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useDispatch();
    const [callEditLocationApi] = useRideRideIdEditLocationPostMutation();

    const [extendLegFareApi] = useMultimodalExtendJourneyIdLegGetfarePostMutation();
    const [extendLegConfirmApi] = useMultimodalExtendJourneyIdLegPostMutation();
    const [callConfirmEditLocationApi] = useEditResultBookingUpdateRequestIdConfirmPostMutation();
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, props.rideId ?? null));
    const [postMapAutoComplete] = useMapsAutoCompletePostMutation();
    const { data: revisedData } = useEditBookingUpdateRequestIdResultGet(
        EditBookingKey.all,
        bookingUpdateRequestId,
        getUpdatedDataInterval,
    );
    const bookingId = useAppSelector(selectBookingId);
    const stops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    const [routeAPICall] = useRoutePostMutation();

    const handleRoute = async (
        srcLat: number,
        srcLon: number,
        destLat: number,
        destLon: number,
        gotRoute: (latlng: ReactMap_latLng[]) => void,
    ) => {
        const formatedStops = stops.slice(0, -1).map(stop => ({ lat: stop.lat, lon: stop.lng }));
        const srcLocation = { lat: srcLat, lon: srcLon };
        const destLocation = { lat: destLat, lon: destLon };
        const wayPoints =
            rideDetails?.status !== 'NEW' && props.currentDriverLat && props.currentDriverLon
                ? [
                      srcLocation,
                      { lat: props.currentDriverLat, lon: props.currentDriverLon },
                      ...formatedStops,
                      destLocation,
                  ]
                : [srcLocation, ...formatedStops, destLocation];
        const body: getRoutesReq = {
            calcPoints: true,
            mode: 'CAR',
            waypoints: wayPoints,
        };
        routeAPICall({ body })
            .then(resp => {
                const route: routeInfo = resp.data?.at(0) ?? {
                    boundingBox: undefined,
                    distance: undefined,
                    distanceWithUnit: undefined,
                    duration: undefined,
                    points: [],
                    snappedWaypoints: [],
                    staticDuration: undefined,
                };
                const latLonArr = route.points.map(transformSnappedToLatLon);
                gotRoute(latLonArr);
            })
            .catch(error => {
                console.error('Error in get route API', error);
            });
    };

    const handleAutoCompleteSearch = async (searchText: string) => {
        const source = { lat: props.lat, lng: props.lon };
        const body: autoCompleteReq = {
            autoCompleteType: 'DROP',
            input: searchText,
            language: 'ENGLISH',
            location: source?.lat + ',' + source?.lng,
            origin: {
                lat: source?.lat,
                lon: source?.lng,
            },
            radius: 50000,
            radiusWithUnit: {
                unit: 'Meter',
                value: 50000.0,
            },
            sessionToken: undefined,
            strictbounds: false,
            types_: undefined,
        };
        if (searchText.length > 0) {
            postMapAutoComplete({ body })
                .then(resp => {
                    if (resp.data) {
                        const sortedPredictions = [...resp.data.predictions].sort(
                            (a, b) => (a.distance ?? 0) - (b.distance ?? 0),
                        );
                        const responseData = getLocationsFromPredictions(sortedPredictions);
                        setSearchData(responseData);
                    } else if (resp.error) {
                        console.error('Error in autocomplete else block:', resp.error);
                    }
                })
                .catch(error => {
                    console.error('Error in autocomplete catch block:', error);
                });
        }
    };

    const debouncedHandleSearch = debounce(handleAutoCompleteSearch, 500);
    const editLocationApiCall = (locationItemByPlaceId: location) => {
        setEditDestSubView(EditDestSubView.ReqDestChange);
        if (props.multimodalExtendLegProps) {
            handleExtendLegGetFare(locationItemByPlaceId, props.multimodalExtendLegProps);
            return;
        }

        const body: rideRideIdEditLocationPostWithParams = {
            rideId: createRideId(props.rideId ?? ''),
            body: {
                destination: {
                    address: locationItemByPlaceId?.addressComponents ?? emptyLocationAddress,
                    gps: {
                        lat: locationItemByPlaceId?.lat ?? 0,
                        lon: locationItemByPlaceId?.lng ?? 0,
                    },
                },
                origin: undefined, // in edit dest, origin will be Nothing
            },
        };
        callEditLocationApi(body)
            .then(dataWithUpdateId => {
                const bookingUpdateRequestId = dataWithUpdateId?.data?.bookingUpdateRequestId;
                if (bookingUpdateRequestId) {
                    setBookingUpdateRequestId(bookingUpdateRequestId);
                } else {
                    // handle error
                }
            })
            .catch(error => {
                console.error('Error fetching:', error);
                const decodedError = decodeError(error);
                Toast.show(decodedError.errorMessage);
            });
    };

    const backPress = () => {
        KeyboardController.dismiss();
        if (editDestSubView == EditDestSubView.LocationList) {
            navigation.goBack();
        } else {
            setExtendLegFare(null);
            setEditDestSubView(EditDestSubView.LocationList);
        }
        return true;
    };

    const locationByPlaceId = async (item: location) => {
        const result: locationWithServiceability =
            await GetLocationAndServiceability.getLocationObjectAndServiceability(
                {
                    TAG: 'PlaceByPlaceId',
                    _0: {
                        contents: item.placeId ?? '',
                        tag: 'ByPlaceId',
                    },
                },
                item?.title,
                item?.subtitle,
                item?.locationType,
                'destination',
            );
        return result.location;
    };

    const editLocationAttempts = useAppSelector(state => selectEditLocationAttempts(state, props.rideId ?? null));

    const handleReqDestChange = () => {
        callConfirmEditLocationApi({ bookingUpdateRequestId: bookingUpdateRequestId ?? '' })
            .then(_ => {
                dispatch(
                    setToastProps({
                        // need to do some changes in toast component because we are using Modal internally which is not allowing background view to be clicked
                        message: userLanguageStrings.Waitfordrivertorespondtoyoureditrequest,
                        backgroundColor: `#14171F`,
                        autoDismissAfter: 2000,
                        visible: true,
                        logo: <ActivityIndicator />,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
                props.setIsUpdateRequired(true);
                dispatch(
                    setEditLocationAttempts({
                        id: props.rideId ?? null,
                        payload: editLocationAttempts - 1,
                    }),
                );
                navigation.goBack();
            })
            .catch(error => {
                const decodedError = decodeError(error);
                dispatch(
                    setToastProps({
                        visible: true,
                        message: decodedError.errorMessage,
                        backgroundColor: `${colors?.primitive?.red?.danger}`,
                        autoDismissAfter: 1000,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        logo: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
            });
    };

    const handleExtendLegGetFare = async (
        locationItem: location | undefined,
        multimodalExtendLegProps: MultimodalExtendLegPropsType,
    ) => {
        setEditDestSubView(EditDestSubView.ReqDestChange);
        const resp = await extendLegFareApi({
            journeyId: multimodalExtendLegProps.journeyId,
            body: {
                endLocation: locationItem && transformLocationToAPIEntity(locationItem),
                startLocation: multimodalExtendLegProps.startLocation,
            },
        });
        if (resp.error) return;
        setExtendLegFare(resp.data);
    };

    const handleExtendLegConfirm = (
        extendLegFare: extendLegGetFareResp | null,
        startLocation: extendLegStartPoint,
        selectedDropLocation: location | null,
    ) => {
        if (props.multimodalExtendLegProps?.journeyId && extendLegFare && extendLegFare.totalFare) {
            const req: multimodalExtendJourneyIdLegPostWithParams = {
                journeyId: props.multimodalExtendLegProps.journeyId,
                body: {
                    distance: extendLegFare.distance,
                    duration: extendLegFare.duration || 0,
                    endLocation: selectedDropLocation ? transformLocationToAPIEntity(selectedDropLocation) : undefined,
                    fare: extendLegFare.totalFare,
                    startLocation: startLocation,
                    bookingUpdateRequestId: extendLegFare.bookingUpdateRequestId,
                },
            };

            extendLegConfirmApi(req)
                .then(resp => {
                    if (resp.error) return;
                    dispatch(
                        setJourneyRefreshFlag({ id: props.multimodalExtendLegProps?.journeyId ?? null, payload: true }),
                    );
                    if (extendLegFare.bookingUpdateRequestId)
                        dispatch(
                            setToastProps({
                                message: userLanguageStrings.Waitfordrivertorespondtoyoureditrequest,
                                backgroundColor: '#14171F',
                                autoDismissAfter: 2000,
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
                    navigation.goBack();
                })
                .catch(error => {
                    console.error('Error in extend confirm API', error);
                });
        } else {
            console.error('Error in extendLegConfirmApi', extendLegFare);
        }
    };

    return {
        editLocationApiCall,
        debouncedHandleSearch,
        revisedData,
        callConfirmEditLocationApi,
        backPress,
        locationByPlaceId,
        handleReqDestChange,
        handleRoute,
        handleExtendLegGetFare,
        handleExtendLegConfirm,
    };
};
