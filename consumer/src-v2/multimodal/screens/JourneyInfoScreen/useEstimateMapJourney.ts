import {
    MultimodalTravelMode_multimodalTravelMode,
    VehicleCategory_vehicleCategory,
} from '@/readOnly/api/types/Enums.gen.tsx';
import { pickupRoutePostWithParams, usePickupRoutePostMutation } from '@/api/integrations/rtk/PickupRoutePost.ts';
import useMapRoute from '@/typescript/Maps/UseMapRouteTS.tsx';
import { useFrfsRouteRouteCodeGetMutation } from '../../../../src/api/integrations/rtk/FrfsRouteRouteCodeGet';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType.tsx';
import { useState, useEffect, useContext, useMemo, useRef } from 'react';

import { getMmStrokeColor } from '@/typescript/utils/common';

import { MapContext } from '@/typescript/Maps/MapContext.tsx';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen.tsx';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { mergeCoordinates } from '../../../../../consumer/src/typescript/Maps/helpers/mapUtils';
import { getFrfsRoute, getWaypointsWithFallback, processWaypoints } from '@/typescript/utils/MultiModal';
import { captureMapSnapshotSafely } from '../../utils/mapSnapshotUtils';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppState } from '@/typescript/state/client/session';
import { mapCityToFrfsCityType } from '@/src-v2/utils/common';
import { legRouteInfo } from '@/readOnly/api/types/LegRouteInfo.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import useLiveTracking from '@/typescript/hooks/useLiveTracking';
import { PathConfig, StaticMarker, TrackedEntity } from '@/typescript/tracking/trackingTypes';
import { selectMapIsMoved } from '@/typescript/state/client/maps';
import { LatLng } from 'react-native-maps';
import { trackingResp } from '@/readOnly/api/types/TrackingResp.gen';

import { isTransitLeg, recenterMap } from './utils';
import { isUndefined } from 'lodash';
import { getBusVariantonServiceTier, getBusVariantonServiceTierCaption } from '../../utils/busTrackingUtils';
import { vehicleTrackingInfo } from '@/readOnly/api/types/VehicleTrackingInfo.gen';

export const useEstimateMapJourney = (
    currentJourney: journeyData | null,
    journeyInfoData: journeyInfoResp | null,
    bottomPad: number,
    pollJourneyInfo: boolean,
    vehicleType: VehicleCategory_vehicleCategory | undefined,
    trackVehiclesData: trackingResp | undefined,
) => {
    const appState = useAppSelector(selectAppState);
    const [journeyMapData, setJourneyMapData] = useState<Record<number, mmEstimateRouteType | mmEstimateRouteType[]>>(
        {},
    );

    const memoizedJourneyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]> = useMemo(
        () => journeyMapData,
        [journeyMapData],
    );

    const orderedLegs = useMemo(() => {
        return Object.entries(memoizedJourneyMapData)
            .sort(([a], [b]) => Number(a) - Number(b))
            .flatMap(([, leg]) => (Array.isArray(leg) ? leg : [leg]));
    }, [memoizedJourneyMapData]);

    const firstFrfsLeg = useMemo(() => {
        return orderedLegs.find(l => isTransitLeg(l.legMode)) ?? null;
    }, [orderedLegs]);

    const { mapRef } = useContext(MapContext);
    const isMapDataLoaded = useRef<boolean>(false);
    const isMapDrawnInitially = useRef<boolean>(false);

    const [pickupRoutePost] = usePickupRoutePostMutation();
    const { multiModelDrawRoute } = useMapRoute(null, undefined);
    const [getFrfsRoutes] = useFrfsRouteRouteCodeGetMutation();
    const [isReadyToDrawRoute, setIsReadyToDrawRoute] = useState(false);
    const isMapDragged = useAppSelector(state => selectMapIsMoved(state, 'BusTrackingMap'));

    const prevJourneyId = useRef<string | null>(null);
    useEffect(() => {
        const processJourneys = async () => {
            if (!currentJourney || !journeyInfoData) return;

            // Case 1: Journey ID changed
            if (
                isMapDrawnInitially.current &&
                (prevJourneyId.current !== currentJourney.journeyId || pollJourneyInfo)
            ) {
                prevJourneyId.current !== currentJourney.journeyId && setJourneyMapData({});
                isMapDataLoaded.current = false;
                prevJourneyId.current !== currentJourney.journeyId &&
                    (prevJourneyId.current = currentJourney.journeyId);
            }
            try {
                if (isMapDataLoaded.current) return;
                isMapDataLoaded.current = true;

                const fetchedData = await Promise.all(
                    journeyInfoData.legs.map(leg =>
                        processJourneyMap(
                            leg,
                            getFrfsRoutes,
                            pickupRoutePost,
                            journeyInfoData.merchantOperatingCityName,
                        ),
                    ),
                );

                const journeyMap = fetchedData.reduce<Record<number, mmEstimateRouteType | mmEstimateRouteType[]>>(
                    (acc, data, index) => {
                        if (Array.isArray(data) && data[0]?.journeyLegOrder !== undefined) {
                            return { ...acc, [data[0].journeyLegOrder]: data };
                        } else if (!Array.isArray(data)) {
                            if (index < fetchedData.length - 1) {
                                const nextLeg = fetchedData[index + 1];
                                const nextLegData = Array.isArray(nextLeg) ? nextLeg[0] : nextLeg;
                                if (nextLegData)
                                    updateLegCoordinates(
                                        data,
                                        data.journeyLegOrder,
                                        nextLegData,
                                        data.legMode ?? 'Walk',
                                    );
                            }
                            return { ...acc, [data.journeyLegOrder]: data };
                        }
                        return acc;
                    },
                    {},
                );
                setIsReadyToDrawRoute(false);
                setJourneyMapData(journeyMap);
                prevJourneyId.current = journeyInfoData.journeyId;
                setIsReadyToDrawRoute(true);
            } catch (error) {
                console.error('Error fetching journeyInfo:', error);
                setIsReadyToDrawRoute(false);
            }
        };

        processJourneys();
    }, [currentJourney, journeyInfoData, pollJourneyInfo]);

    // Paths should only be calculated for buses (single mode only)
    const paths: PathConfig[] = useMemo(
        () => [
            {
                id: 'stableRouteId',
                coordinates: (() => {
                    return firstFrfsLeg?.wayPoints ?? [];
                })(),
                style: {
                    strokeColor: '#BCB9B5',
                    strokeWidth: 8,
                },
                highlightUntil: undefined,
            },
            {
                id: 'highlightRouteId',
                coordinates: (() => {
                    return firstFrfsLeg?.coordinates ?? [];
                })(),
                style: {
                    strokeColor: '#F8CD4D',
                    strokeWidth: 8,
                },
                highlightUntil: undefined,
            },
        ],
        [memoizedJourneyMapData],
    );

    // Create static markers for first and last bus stops
    const staticMarkers: StaticMarker[] = useMemo(() => {
        const firstJourneyData = memoizedJourneyMapData[1];
        if (!firstJourneyData) return [];

        // Get stops array from the journey data
        const stops = Array.isArray(firstJourneyData) ? firstJourneyData[0]?.stops : firstJourneyData.stops;

        if (!stops || !Array.isArray(stops) || stops.length === 0) return [];

        const markers: StaticMarker[] = [];

        // Add first stop marker
        const firstStop = stops[0];
        if (firstStop && firstStop.lat !== undefined && firstStop.lon !== undefined) {
            // eslint-disable-next-line functional/immutable-data
            markers.push({
                id: `first-stop-${firstStop.code || 'start'}`,
                location: {
                    latitude: firstStop.lat,
                    longitude: firstStop.lon,
                },
                style: {
                    iconType: 'multimodal' as const,
                    multimodalVariant: 'BusStop',
                },
                title: firstStop.name || 'Start Stop',
                stopName: undefined,
                stopCode: undefined,
                showCallout: undefined,
                displayCalloutOnPress: undefined,
                busStopEtaCallout: undefined,
                primaryEtaMinutes: undefined,
                secondaryEtaMinutes: undefined,
            });
        }

        // Add last stop marker (only if different from first stop)
        if (stops.length > 1) {
            const lastStop = stops[stops.length - 1];
            if (lastStop && lastStop.lat !== undefined && lastStop.lon !== undefined) {
                // eslint-disable-next-line functional/immutable-data
                markers.push({
                    id: `last-stop-${lastStop.code || 'end'}`,
                    location: {
                        latitude: lastStop.lat,
                        longitude: lastStop.lon,
                    },
                    style: {
                        iconType: 'multimodal' as const,
                        multimodalVariant: 'BusStop',
                    },
                    title: lastStop.name || 'End Stop',
                    stopName: undefined,
                    stopCode: undefined,
                    showCallout: undefined,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                });
            }
        }

        return markers;
    }, [memoizedJourneyMapData]);

    const trackFromUserToValue = useMemo(() => {
        const firstJourneyData = firstFrfsLeg;

        if (!firstJourneyData) return undefined;

        // Get stops array from the journey data
        const stops = Array.isArray(firstJourneyData) ? firstJourneyData[0]?.stops : firstJourneyData.stops;
        if (!stops || !Array.isArray(stops) || stops.length === 0) return undefined;

        const firstStop = stops[0];

        if (firstStop && firstStop.lat !== undefined && firstStop.lon !== undefined) {
            return {
                latitude: firstStop.lat,
                longitude: firstStop.lon,
                updateInterval: 10,
                routingMode: 'straight-line',
            };
        }

        return undefined;
    }, [memoizedJourneyMapData]);

    const autoFocusConfig = useMemo(() => {
        const coordinates: LatLng[] =
            trackFromUserToValue?.latitude && trackFromUserToValue?.longitude
                ? [{ latitude: trackFromUserToValue.latitude, longitude: trackFromUserToValue.longitude }]
                : [];
        // const pathIds = paths.length > 0 ? paths.map(path => path.id) : [];
        return { coordinates, pathIds: ['highlightRouteId'] };
    }, [trackFromUserToValue]);

    // Call useLiveTracking unconditionally to follow Rules of Hooks
    const trackedEntities: TrackedEntity[] = useMemo(
        () =>
            (trackVehiclesData?.vehicleTrackingInfo ?? []).map((vehicle: vehicleTrackingInfo) => {
                const isConfirmed =
                    vehicle.vehicleInfo.routeState === 'ConfirmedHigh' ||
                    vehicle.vehicleInfo.routeState === 'ConfirmedMed';
                return {
                    id: `${vehicle.vehicleId}`,
                    captionText: getBusVariantonServiceTierCaption(
                        vehicle.serviceTierType,
                        vehicle.routeShortName,
                        vehicle.vehicleId,
                    ),
                    pathId: 'stableRouteId',
                    location: {
                        latitude: vehicle.vehicleInfo.latitude ?? 0,
                        longitude: vehicle.vehicleInfo.longitude ?? 0,
                    },
                    style: {
                        iconType: 'multimodal' as const,
                        multimodalVariant: isConfirmed
                            ? getBusVariantonServiceTier(vehicle.serviceTierType)
                            : 'GhostBus',
                        anchor: { x: 0.5, y: 0.5 },
                        blur: !isConfirmed,
                    },
                    onClick: () => {
                        // _onVehicleClick(`vehicle_${vehicle.id}`)
                    },
                    showCallout: undefined,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                };
            }),
        [trackVehiclesData],
    );

    const trackFromUserTo = vehicleType === 'BUS' ? trackFromUserToValue : undefined;

    const { performAutoFocus, userLocationMarker } = useLiveTracking({
        paths: vehicleType === 'BUS' ? paths : [],
        staticMarkers: vehicleType === 'BUS' ? staticMarkers : [],
        trackedEntities,
        autoFocus: vehicleType === 'BUS' ? autoFocusConfig : undefined,
        animationDuration: 1800,
        isMapDragged,
        trackFromUserTo,
        performAutoFocusOnlyOnInit: false,
    });

    // Create stable function that returns performAutoFocus for BUS or no-op for others
    const recenterBusTracking = useMemo(
        () => (vehicleType === 'BUS' ? performAutoFocus : () => {}),
        [vehicleType, performAutoFocus],
    );

    useEffect(() => {
        const journeyMapSize = Object.keys(memoizedJourneyMapData).length;
        if (
            journeyMapSize > 0 &&
            currentJourney !== null &&
            memoizedJourneyMapData &&
            isMapDataLoaded.current &&
            currentJourney?.journeyId === prevJourneyId.current &&
            isReadyToDrawRoute &&
            (!pollJourneyInfo || !isMapDrawnInitially.current) &&
            (trackFromUserTo === undefined || userLocationMarker !== null)
        ) {
            mapRef.current?.multiModalRemoveRoute('defaultRoute');
            if (vehicleType !== 'BUS') {
                multiModelDrawRoute(memoizedJourneyMapData, '', '', [], false);
            }
            mapRef.current?.addMapPadding({
                top: 60,
                bottom: bottomPad,
                left: undefined,
                right: undefined,
            });
            isMapDrawnInitially.current = true;
            setIsReadyToDrawRoute(false);

            // Capturing snapshot when route is drawn
            if (currentJourney?.journeyId && mapRef.current) {
                recenterMap(memoizedJourneyMapData, mapRef, bottomPad, userLocationMarker);
                captureMapSnapshotSafely(mapRef, currentJourney.journeyId, appState, 2000);
            }
        }
    }, [
        isReadyToDrawRoute,
        journeyInfoData?.journeyId,
        pollJourneyInfo,
        isMapDrawnInitially.current,
        userLocationMarker,
    ]);

    return {
        journeyMapData: memoizedJourneyMapData,
        setJourneyMapData,
        pickupRoutePost,
        isMapDataLoaded,
        recenterBusTracking,
    };
};

const convertRouteDetailsToRouteDetail = (routeDetails: legRouteInfo[]) => {
    return routeDetails.map(routeDetail => ({
        fromStationCode: routeDetail.originStop.code,
        toStationCode: routeDetail.destinationStop.code,
        routeCode: routeDetail.routeCode,
        fromStationLatLong: { lat: routeDetail.originStop.lat ?? 0, lon: routeDetail.originStop.lon ?? 0 },
        toStationLatLong: { lat: routeDetail.destinationStop.lat ?? 0, lon: routeDetail.destinationStop.lon ?? 0 },
        color: routeDetail.lineColor,
        subOrder: routeDetail.subOrder,
        lineColorCode: routeDetail.lineColorCode,
    }));
};

const processJourneyMap = async (
    leg: legInfo,
    getFrfsRoutes: ReturnType<typeof useFrfsRouteRouteCodeGetMutation>[0],
    pickupRoutePost: ReturnType<typeof usePickupRoutePostMutation>[0],
    merchantOperatingCityName: string | undefined,
): Promise<mmEstimateRouteType | mmEstimateRouteType[]> => {
    if (leg.travelMode === 'Metro' || leg.travelMode === 'Subway') {
        const routeDetails =
            leg?.legExtraInfo.TAG === 'Metro' || leg?.legExtraInfo.TAG === 'Subway'
                ? convertRouteDetailsToRouteDetail(leg?.legExtraInfo._0.routeInfo)
                : [];

        const sortedRouteDetails = [...routeDetails].sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0));

        const metroRoutes = await Promise.all(
            sortedRouteDetails.map(async (routeDetail, index) => {
                const resp = await getFrfsRoute(
                    leg,
                    mapCityToFrfsCityType(merchantOperatingCityName ?? 'Bangalore'),
                    getFrfsRoutes,
                    routeDetail.fromStationCode,
                    routeDetail.toStationCode,
                    routeDetail.routeCode,
                );
                const finalLatLongArray = getWaypointsWithFallback(resp);
                const journeyData = processWaypoints(
                    leg.travelMode,
                    finalLatLongArray,
                    routeDetail.fromStationLatLong,
                    routeDetail.toStationLatLong,
                );

                return {
                    ...journeyData,
                    journeyLegOrder: leg.order,
                    color: !isUndefined(routeDetail.lineColorCode)
                        ? '#' + routeDetail.lineColorCode
                        : routeDetail.color && leg.travelMode === 'Metro'
                          ? routeDetail.color.toLowerCase()
                          : getMmStrokeColor(leg.travelMode),
                    marker: undefined,
                    stops: resp?.stops,
                    lastStop: Array.isArray(resp?.lastStop) ? resp.lastStop[index] : resp?.lastStop,
                    lineDashPattern: undefined,
                    fullStopsList: resp?.allRouteStops,
                    wayPoints: finalLatLongArray?.map(point => ({
                        latitude: point.lat,
                        longitude: point.lon,
                    })),
                };
            }),
        );

        return metroRoutes;
    }
    if (['Bus'].includes(leg.travelMode)) {
        const data = await getFrfsRoute(
            leg,
            mapCityToFrfsCityType(merchantOperatingCityName ?? 'Bangalore'),
            getFrfsRoutes,
            undefined,
            undefined,
            undefined,
        );
        const legExtraInfo = leg.legExtraInfo.TAG === 'Bus' ? leg.legExtraInfo._0 : null;
        const finalLatLongArray = getWaypointsWithFallback(data);
        const journeyData = processWaypoints(
            leg.travelMode,
            finalLatLongArray,
            { lat: legExtraInfo?.originStop.lat ?? 0, lon: legExtraInfo?.originStop.lon ?? 0 },
            { lat: legExtraInfo?.destinationStop.lat ?? 0, lon: legExtraInfo?.destinationStop.lon ?? 0 },
        );

        return {
            ...journeyData,
            journeyLegOrder: leg.order,
            color: getMmStrokeColor(leg.travelMode),
            marker: undefined,
            stops: data?.stops,
            lastStop: undefined,
            lineDashPattern: undefined,
            fullStopsList: undefined,
            wayPoints: data?.wayPoints?.map(point => ({
                latitude: point.lat,
                longitude: point.lon,
            })),
        };
    }

    // Handle other travel modes (Taxi, Walk, etc.)

    const legExtraInfo =
        leg.legExtraInfo.TAG === 'Taxi' || leg.legExtraInfo.TAG === 'Walk' ? leg.legExtraInfo._0 : null;
    const reqBody: pickupRoutePostWithParams = {
        body: {
            calcPoints: true,
            mode: leg.travelMode === 'Taxi' ? 'CAR' : leg.travelMode === 'Walk' ? 'FOOT' : 'CAR',
            waypoints: [
                { lat: legExtraInfo?.origin.lat ?? 0, lon: legExtraInfo?.origin.lon ?? 0 },
                { lat: legExtraInfo?.destination.lat ?? 0, lon: legExtraInfo?.destination.lon ?? 0 },
            ],
            rideId: undefined,
        },
    };

    const payload = reqBody.body.mode !== 'FOOT' ? await pickupRoutePost(reqBody).unwrap() : [];

    const coordinates =
        payload[0]?.points.map(point => ({
            latitude: point.lat,
            longitude: point.lon,
        })) ||
        reqBody.body.waypoints.map(point => ({
            latitude: point.lat,
            longitude: point.lon,
        }));

    return {
        coordinates,
        legMode: leg.travelMode,
        journeyLegOrder: leg.order,
        color: getMmStrokeColor(leg.travelMode),
        marker: undefined,
        stops: undefined,
        lineDashPattern: reqBody.body.mode === 'FOOT' ? [5, 5, 5, 5] : undefined,
        lastStop: undefined,
        fullStopsList: undefined,
        wayPoints: undefined,
    };
};

export const updateLegCoordinates = (
    journeys: mmEstimateRouteType | mmEstimateRouteType[],
    _index: number,
    nextLeg: mmEstimateRouteType | mmEstimateRouteType[],
    legMode: string,
) => {
    const isTransit = ['Metro', 'Bus', 'Subway'].includes(legMode);

    // Handle the case where `journeys` is an array
    if (Array.isArray(journeys)) {
        const lastJourney = journeys[journeys.length - 1];

        // Handle nextLeg being an array or a single journey
        if (Array.isArray(nextLeg)) {
            const firstNextLeg = nextLeg[0];
            mergeCoordinates(lastJourney, firstNextLeg, isTransit);
        } else {
            mergeCoordinates(lastJourney, nextLeg, isTransit);
        }
    } else {
        // Handle the case where `journeys` is a single journey
        if (Array.isArray(nextLeg)) {
            const firstNextLeg = nextLeg[0];
            mergeCoordinates(journeys, firstNextLeg, isTransit);
        } else {
            mergeCoordinates(journeys, nextLeg, isTransit);
        }
    }
};

export const updateJourneyMapData = async (
    legOrder: number,
    newMode: MultimodalTravelMode_multimodalTravelMode,
    currentJourney: journeyData | null,
    setJourneyMapData: React.Dispatch<
        React.SetStateAction<Record<number, mmEstimateRouteType | mmEstimateRouteType[]>>
    >,
    pickupRoutePost: ReturnType<typeof usePickupRoutePostMutation>[0],
) => {
    const src = {
        lat: currentJourney?.journeyLegs[legOrder]?.fromLatLong.lat ?? 0,
        lon: currentJourney?.journeyLegs[legOrder]?.fromLatLong.lon ?? 0,
    };
    const dest = {
        lat: currentJourney?.journeyLegs[legOrder]?.toLatLong.lat ?? 0,
        lon: currentJourney?.journeyLegs[legOrder]?.toLatLong.lon ?? 0,
    };

    const reqBody: pickupRoutePostWithParams = {
        body: {
            calcPoints: true,
            mode: newMode === 'Taxi' ? 'CAR' : newMode === 'Walk' ? 'FOOT' : 'CAR',
            waypoints: [src, dest],
            rideId: undefined,
        },
    };

    const payload = await pickupRoutePost(reqBody).unwrap();
    const coordinates =
        payload[0]?.points.map(point => ({
            latitude: point.lat,
            longitude: point.lon,
        })) || [];

    setJourneyMapData(prevData => {
        const newData = { ...prevData };

        if (newData[legOrder]) {
            const newItem: mmEstimateRouteType = {
                coordinates,
                legMode: newMode,
                journeyLegOrder: legOrder,
                color: getMmStrokeColor(newMode),
                marker: undefined,
                stops: undefined,
                lineDashPattern: newMode === 'Walk' ? [5, 2, 3, 2] : undefined,
                lastStop: undefined,
                fullStopsList: undefined,
                wayPoints: undefined,
            };

            // Find the next leg, whether it's a single route or part of an array
            const nextLegOrder = legOrder + 1;

            const nextLeg: mmEstimateRouteType | undefined =
                nextLegOrder in newData
                    ? Array.isArray(newData[nextLegOrder])
                        ? newData[nextLegOrder][0]
                        : newData[nextLegOrder]
                    : undefined;

            // Update coordinates
            if (nextLeg) {
                updateLegCoordinates(newItem, legOrder, nextLeg, newMode);
            }

            return { ...newData, [legOrder]: newItem };
        }

        return newData;
    });
};
