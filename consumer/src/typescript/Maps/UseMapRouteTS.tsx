import { useCallback, useContext, useMemo } from 'react';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { NativeModules, Platform } from 'react-native';

import { VehicleVariant_vehicleVariant } from '@/readOnly/api/types/Enums.gen';
import { IconType } from '../components/AnimatedMapPin';

import { LatLng } from 'react-native-maps';
import { calculateDisplayDistance } from '../components/CustomCallout';
import { areCoordsEqual, computeHeading, delay } from '../utils/common';
import { AppDispatchType } from '../state/hooks';
import { setDistanceMoved, setPickupDistance, StopInfo } from '../state/client/ride';
import { RideId } from '../state/client/booking';
import { markerData, mmEstimateRouteType, polylineData } from './MapType';
import { convertLatLongToLatLng } from '../utils/MultiModal';
import { JourneyTrackingData } from '@/src-v2/multimodal/screens/LiveJourneyTracking/Types';
import { MapContext } from './MapContext';

import { isBookingConfirmed, isLegOngoing } from '@/typescript/utils/LegStatusUtils';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';

const { MapUtils } = NativeModules;
// TypeScript Hook for MapRoute
interface UseMapRouteRes {
    drawEstimateRoute: (params: {
        coordinates: LatLng[];
        sourceAddress: string | undefined;
        onSourceClick: (() => void) | undefined;
        onDestClick: (() => void) | undefined;
        showEditIcon: boolean | undefined;
        destAddress: string | undefined;
        destinationPoints: LatLng[] | undefined;
        destinationTitles: string[];
    }) => Promise<void>;

    drawTrackingRoute: (params: {
        coordinates: LatLng[];
        isPickup: boolean;
        srcText: string;
        destAddress: string | undefined;
        destinationPoints: LatLng[] | undefined;
        destinationTitles: string[];
        driverPrevRideDest: LatLng | undefined;
        vehicleVariant: VehicleVariant_vehicleVariant | undefined;
        onDestClick: (() => void) | undefined;
        showEditIcon: boolean | undefined;
        stopInfo: StopInfo | null;
    }) => Promise<void>;

    updateTrackingRoute: (
        isPickup: boolean,
        route: LatLng[],
        currIdx: number,
        dispatch: AppDispatchType,
        duration?: number,
    ) => Promise<void>;

    removeRoute: (routeId: string) => void;
    cancelTrackingAnimation: () => void;
    redrawRouteWOTrackingMarker: (params: {
        coordinates: LatLng[];
        destinationPoints: LatLng[];
        destinationTitles: string[];
        driverPrevRideDest: LatLng | undefined;
        stopInfo: StopInfo | null;
    }) => Promise<void>;

    moveTrackingMarker: (params: {
        route: LatLng[];
        currIdx: number;
        calloutText: string | undefined;
        duration: number;
    }) => Promise<void>;
    multiModelDrawRoute: (
        routeInfo: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>,
        sourceAddress: string,
        destAddress: string,
        destinationPoints: LatLng[],
        showBetweenMArkers: boolean,
    ) => void;

    updateMultiModalTrackingRoute: (routeInfo: JourneyTrackingData) => void;

    moveVehicleTrackingMarker: (params: {
        vehiclePosition: LatLng;
        calloutText: string | undefined;
        duration: number;
        markerId: string;
    }) => Promise<void>;
}

const useMapRoute = (
    rideId: RideId | null,
    vehicleVariant: VehicleVariant_vehicleVariant | undefined,
): UseMapRouteRes => {
    const { mapRef } = useContext(MapContext);

    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    // Helper function to generate a range of numbers
    const makeRange = useCallback((start: number, end: number): number[] => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    }, []);

    const drawRouteAndDropMarkers = useCallback(
        async ({
            coordinates,
            destinationPoints,
            destinationTitles,
            dstIconType,
            onDestClick,
            destAddress,
            showEditIcon,
            driverPrevRideDest,
            stopInfo,
        }: {
            coordinates: LatLng[];
            onDestClick: (() => void) | undefined;
            destinationPoints: LatLng[];
            destinationTitles: string[];
            dstIconType: IconType;
            destAddress: string | undefined;
            showEditIcon: boolean | undefined;
            driverPrevRideDest: LatLng | undefined;
            stopInfo: StopInfo | null;
        }) => {
            const completedStopsCount = (stopInfo?.status ?? 0) + (stopInfo?.stop ?? 0);
            if (mapRef.current) {
                const allMarkers = mapRef.current?.getMarkers();

                // Determine finalCoordinatesForRide based on driverPrevRideDest existence and drop-off index.
                const finalCoordinatesForRide = await (async () => {
                    if (coordinates.length !== 0 && driverPrevRideDest) {
                        const maybeIndex = await (async () => {
                            try {
                                return await MapUtils.isCoordinateOnPath(coordinates, driverPrevRideDest, 50);
                            } catch (e) {
                                console.warn('error checking coordinate on path', e);
                                return undefined;
                            }
                        })();

                        if (maybeIndex) {
                            // Add marker only if not present already - to avoid re-render
                            if (!allMarkers.has('oldRideDestination')) {
                                const coordinateOfOldRide = coordinates.at(maybeIndex);
                                if (coordinateOfOldRide) {
                                    mapRef.current?.addMarker({
                                        coordinate: coordinateOfOldRide,
                                        id: 'oldRideDestination',
                                        anchor: { x: 0.5, y: 0.3 },
                                        zIndex: 3.0,
                                        rotateEnabled: true,
                                        rotation: 0,
                                        title: 'Completing drop-off nearby',
                                        iconType: 'lastDrop',
                                        vehicleVariant: vehicleVariant,
                                        multimodalVariant: undefined,
                                        children: undefined,
                                        style: undefined,
                                        onClick: undefined,
                                        showEditIcon: undefined,
                                        markerOnPress: undefined,
                                    });
                                }
                            } else {
                                console.warn('oldRideDestination already present');
                            }

                            // Update the polyline to show the route to the old ride destination
                            const coordinatesToOldRide = coordinates.slice(0, maybeIndex);
                            await mapRef.current?.addPolyline({
                                coordinates: coordinatesToOldRide,
                                id: 'coordinatesToOldRide',
                                visible: true,
                                strokeColor: themeColors.Icon_neutralMidHigh,
                                lineDashPattern: [40, 10],
                                strokeColors: undefined,
                                strokeWidth: undefined,
                                extendPath: undefined,
                            });
                            return coordinates.slice(maybeIndex);
                        }
                    }
                    return coordinates;
                })();

                if (completedStopsCount > 0) {
                    // eslint-disable-next-line functional/no-let
                    for (let i = 0; i < completedStopsCount; i++) {
                        const markerId = `routeWaypoint-${i}`;
                        if (allMarkers.has(markerId)) {
                            mapRef.current.removeMarker(markerId);
                        }
                    }
                }

                // Draw the main route polyline
                await mapRef.current?.addPolyline({
                    coordinates: finalCoordinatesForRide,
                    id: 'defaultPolyline',
                    visible: true,
                    strokeColor: '#5F8FE2', // appName === 'nammaYatri' ? '#5F8FE2' : '#000000', // TODO :: Need to check in android strokeColor and gradient
                    strokeColors: undefined, // appName === 'nammaYatri' ? undefined : [themeColors.APP_THEME_COLOR, '#161622'],
                    strokeWidth: undefined,
                    extendPath: undefined,
                    lineDashPattern: undefined,
                });

                // Add destination markers for all points
                destinationPoints.forEach((coords, index) => {
                    const isLastPoint = index === destinationPoints.length - 1;
                    const markerId = isLastPoint ? 'routeEnd' : `routeWaypoint-${completedStopsCount + index}`;
                    const markerTitle = isLastPoint ? destAddress || '' : destinationTitles[index] || '';
                    const stopIconType = isLastPoint
                        ? dstIconType
                        : index + completedStopsCount === 0
                          ? 'stop1'
                          : 'stop2';

                    // Thinking of this to be a temporary fix, tracking functions needs to be modified
                    // to support forward dispatch || stops related flows
                    if (allMarkers.has(markerId)) {
                        const existingCoord = allMarkers.get(markerId)?.coordinate;
                        if (areCoordsEqual(existingCoord, coords)) {
                            mapRef.current?.removeMarker(markerId);
                        } else {
                            return;
                        }
                    }

                    mapRef.current?.addMarker({
                        coordinate: coords,
                        id: markerId,
                        anchor: { x: 0.5, y: 0.3 },
                        zIndex: 99 - index - 1,
                        rotateEnabled: true,
                        rotation: 0,
                        onClick: onDestClick,
                        showEditIcon,
                        title: markerTitle,
                        iconType: stopIconType,
                        vehicleVariant: vehicleVariant,
                        children: undefined,
                        style: undefined,
                        multimodalVariant: undefined,
                        markerOnPress: undefined,
                    });
                });
            } else {
                console.warn('mapRef.current is null/undefined, cannot draw route');
            }
        },
        [mapRef.current, rideId, vehicleVariant],
    );

    const drawRoute = useCallback(
        async ({
            coordinates,
            destinationPoints,
            destinationTitles,
            srcIconType,
            dstIconType,
            vehicleVariant,
            onSourceClick,
            onDestClick,
            showEditIcon,
            shouldRotateSrcMarker,
            sourceAddress,
            destAddress,
            driverPrevRideDest,
            stopInfo,
        }: {
            coordinates: LatLng[];
            destinationPoints: LatLng[];
            destinationTitles: string[];
            srcIconType: IconType;
            dstIconType: IconType;
            onSourceClick: (() => void) | undefined;
            onDestClick: (() => void) | undefined;
            showEditIcon: boolean | undefined;
            vehicleVariant: VehicleVariant_vehicleVariant | undefined;
            shouldRotateSrcMarker: boolean;
            sourceAddress: string | undefined;
            destAddress: string | undefined;
            driverPrevRideDest: LatLng | undefined;
            stopInfo: StopInfo | null;
        }) => {
            if (coordinates.length !== 0) {
                drawRouteAndDropMarkers({
                    coordinates,
                    destinationPoints,
                    destinationTitles,
                    dstIconType,
                    destAddress,
                    driverPrevRideDest,
                    onDestClick,
                    showEditIcon,
                    stopInfo,
                });

                const startCoord = coordinates.at(0);
                const nextCoord = coordinates.at(1);

                // Add source marker (first point)
                if (startCoord) {
                    const angle = shouldRotateSrcMarker && nextCoord ? computeHeading(startCoord, nextCoord) : 0;

                    mapRef.current?.addMarker({
                        coordinate: startCoord,
                        id: 'routeStart',
                        anchor: { x: 0.5, y: 0.3 },
                        rotateEnabled: true,
                        zIndex: 99,
                        rotation: angle,
                        title: sourceAddress || '',
                        onClick: onSourceClick,
                        showEditIcon,
                        iconType: srcIconType,
                        vehicleVariant,
                        children: undefined,
                        style: undefined,
                        multimodalVariant: undefined,
                        markerOnPress: undefined,
                    });
                }

                // Build route with all markers
                const markersIds = [
                    'routeStart',
                    ...makeRange(0, destinationPoints.length - 2).map(i => `routeWaypoint-${i}`),
                    'routeEnd',
                ];
                mapRef.current?.buildRoute('defaultRoute', 'defaultPolyline', markersIds);
            }
        },
        [mapRef.current, rideId, vehicleVariant],
    );

    const mkMarkerData = (
        stops: fRFSStationAPI[] | undefined,
        showBetweenMarkers: boolean,
        index: number,
    ): { markers: markerData[]; stopIds: string[] } => {
        return stops && showBetweenMarkers
            ? stops
                  .filter(
                      (stop): stop is fRFSStationAPI & { lat: number; lon: number } =>
                          stop?.lat !== undefined && stop?.lon !== undefined,
                  )
                  .reduce<{ markers: markerData[]; stopIds: string[] }>(
                      (acc, stop, stopIndex) => {
                          const stopId = `stop-${index}-${stopIndex}`;
                          const markerData: markerData = {
                              coordinate: {
                                  latitude: stop.lat,
                                  longitude: stop.lon,
                              },
                              id: stopId,
                              title: '',
                              pinIconType: 'stops',
                              anchor: { x: 0.5, y: 0.3 },
                              rotationEnabled: true,
                              zIndex: undefined,
                              rotation: 0,
                              onClick: () => {},
                              showEditIcon: false,
                              style: {},
                              children: undefined,
                              vehicleVariant: undefined,
                              multimodalVariant: undefined,
                              visible: true,
                              description: '',
                              markerKey: stopId,
                              ref: undefined,
                              calloutText: undefined,
                              calloutOnPress: undefined,
                              markerOnPress: undefined,
                              showCallout: undefined,
                              displayCalloutOnPress: undefined,
                              busStopEtaCallout: undefined,
                              primaryEtaMinutes: undefined,
                              secondaryEtaMinutes: undefined,
                          };
                          return {
                              markers: [...acc.markers, markerData],
                              stopIds: [...acc.stopIds, stopId],
                          };
                      },
                      { markers: [], stopIds: [] },
                  )
            : { markers: [], stopIds: [] };
    };

    const multiModelDrawRoute = (
        routeInfo: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>,
        sourceAddress: string,
        destAddress: string,
        _betweenMarker: LatLng[],
        showBetweenMarkers = false,
    ) => {
        if (!Object.keys(routeInfo)?.length) return;

        const routeKeys = Object.keys(routeInfo).map(Number);
        const { markerIds: finalMarkers, polylineIds } = routeKeys.reduce<{
            markerIds: string[];
            polylineIds: string[];
        }>(
            (acc, key, index) => {
                const route = routeInfo[key];
                if (!route) return acc;

                const routes = Array.isArray(route) ? route : [route];

                const routeMarkers = routes.flatMap((subRoute, subIndex) => {
                    const {
                        coordinates,
                        color,
                        stops,
                        legMode,
                    }: {
                        coordinates: LatLng[];
                        color: string | undefined;
                        stops: fRFSStationAPI[] | undefined;
                        legMode: string | undefined;
                        lineDashPattern: number[] | undefined;
                    } = subRoute;

                    const lastCoord = coordinates[coordinates.length - 1];
                    const startCoord = coordinates[0];

                    // Create start marker
                    const startMarkerId = startCoord ? [`routeStart-${index}-${subIndex}`] : [];
                    if (startCoord && startMarkerId[0]) {
                        mapRef.current?.addMarker({
                            coordinate: startCoord,
                            id: startMarkerId[0],
                            title: showBetweenMarkers ? '' : sourceAddress,
                            iconType: 'multimodal',
                            anchor: { x: 0.5, y: 0.3 },
                            rotateEnabled: true,
                            zIndex: 99 - index - 1,
                            rotation: 0,
                            onClick: () => {},
                            showEditIcon: false,
                            style: undefined,
                            children: undefined,
                            vehicleVariant: undefined,
                            multimodalVariant: `${legMode}BeforeRide`,
                            markerOnPress: undefined,
                        });
                    }

                    // Create end marker
                    const endMarkerId = lastCoord ? [`routeEnd-${index}-${subIndex}`] : [];
                    if (lastCoord && endMarkerId[0]) {
                        mapRef.current?.addMarker({
                            coordinate: lastCoord,
                            id: endMarkerId[0],
                            title: showBetweenMarkers ? '' : destAddress,
                            iconType: 'multimodal',
                            anchor: { x: 0.5, y: 0.3 },
                            rotateEnabled: true,
                            zIndex: 3.0,
                            rotation: 0,
                            onClick: () => {},
                            showEditIcon: false,
                            style: undefined,
                            children: undefined,
                            vehicleVariant: undefined,
                            multimodalVariant: `${legMode}BeforeRide`,
                            markerOnPress: undefined,
                        });
                    }
                    // create Stops data
                    const { markers, stopIds: stopMarkerIds } = mkMarkerData(stops, showBetweenMarkers, index);
                    mapRef.current?.addMarkersFromArray({
                        markersArray: markers,
                        routeId: undefined,
                        forceUpdate: undefined,
                    });

                    // Add polyline
                    const polylineId = `polyline-${index}-${subIndex}`;
                    mapRef.current?.addPolyline({
                        coordinates: coordinates,
                        id: polylineId,
                        visible: true,
                        strokeColor: color,
                        strokeColors: undefined,
                        strokeWidth: 7,
                        extendPath: undefined,
                        lineDashPattern: undefined,
                    });

                    return {
                        markerIds: [...startMarkerId, ...endMarkerId, ...stopMarkerIds],
                        polylineId,
                    };
                });

                return {
                    markerIds: [...acc.markerIds, ...routeMarkers.flatMap(r => r.markerIds)],
                    polylineIds: [...acc.polylineIds, ...routeMarkers.map(r => r.polylineId)],
                };
            },
            { markerIds: [], polylineIds: [] },
        );

        // Build final route
        mapRef.current?.multiModalBuildRoute('defaultRoute', polylineIds, finalMarkers);
    };
    // ----------------------------------- moving multimodalTrackingMarker -----------------------------------
    const moveVehicleTrackingMarker = useCallback(
        async ({
            vehiclePosition,
            calloutText,
            duration,
            markerId,
        }: {
            vehiclePosition: LatLng;
            calloutText: string | undefined;
            duration: number;
            markerId: string;
        }) => {
            if (vehiclePosition) {
                mapRef.current?.moveMarker({
                    markerId,
                    newPosition: vehiclePosition,
                    animation: false,
                    animationDuration: duration,
                    rotation: 0,
                    rotationDuration: undefined,
                });
                if (calloutText) {
                    mapRef.current?.updateCalloutText('routeStart', calloutText);
                }
            }
        },
        [mapRef.current, rideId, vehicleVariant],
    );
    const multimodalPolyline = useCallback(
        async (routeId: string, polylineData: polylineData) => {
            if (mapRef.current?.hasPolyline(routeId, polylineData)) {
                mapRef.current?.updatePolyline({
                    polylineId: polylineData.id,
                    newCoordinates: polylineData.coordinates,
                    strokeColor: polylineData.strokeColor,
                    strokeWidth: polylineData.strokeWidth,
                });
            } else {
                console.warn(`Polyline with id ${polylineData.id} not found in route ${routeId}`);
            }
        },
        [mapRef.current],
    );

    const drawMultimodalPolyline = (routeInfo: JourneyTrackingData, _polylineArrayId: string[]) => {
        routeInfo.polyline.forEach(polylineData => {
            const { id: polylineId, coordinates, strokeColor, strokeWidth, lineDashPattern } = polylineData;
            if (!mapRef.current?.hasPolyline(routeInfo.routeId, polylineData)) {
                mapRef.current?.addPolyline({
                    coordinates: coordinates,
                    id: polylineId,
                    visible: true,
                    strokeColor: strokeColor,
                    strokeWidth: strokeWidth,
                    lineDashPattern: lineDashPattern,
                    strokeColors: undefined,
                    extendPath: undefined,
                });
            } else {
                if (isBookingConfirmed(routeInfo.legInfo) || isLegOngoing(routeInfo.legInfo)) {
                    multimodalPolyline(routeInfo.routeId, polylineData);
                }
            }
        });
    };

    const addLegMarkers = (routeInfo: JourneyTrackingData, markersIdsArray: string[]) => {
        if (routeInfo.isAddDestMarker) {
            if (routeInfo.legData.coordinates && routeInfo.legData.coordinates.length <= 0) return markersIdsArray;
        }
        const markerData = routeInfo.marker.filter(data => data !== undefined && !data.isTrackingId);
        const markerIds = markerData.map(marker => marker.id).filter(id => id !== undefined);
        const uniqueMarkerIds = markerIds.filter(id => !markersIdsArray.includes(id));

        const filteredMarkerData: markerData[] = markerData.filter(marker => uniqueMarkerIds.includes(marker.id));

        if (uniqueMarkerIds.length > 0) {
            mapRef.current?.addMarkersFromArray({
                markersArray: filteredMarkerData,
                routeId: routeInfo.routeId,
                forceUpdate: undefined,
            });
            return [...markersIdsArray, ...uniqueMarkerIds];
        } else return markersIdsArray;
    };
    const addTrackingPositionMarker = async (
        routeInfo: JourneyTrackingData,
        addMarkerArray: string[],
    ): Promise<string[]> => {
        const { marker: markerData, trackingPositionLatLng, calloutText, routeId } = routeInfo;

        const initialRecord: Record<string, true> = Object.fromEntries(addMarkerArray.map(id => [id, true]));

        const updatedMarkerRecord = await markerData.reduce<Promise<Record<string, true>>>(
            async (recordPromise, marker) => {
                const record = await recordPromise;
                const { id, pinIconType, zIndex, multimodalVariant, isTrackingId, markerKey } = marker;

                const trackingPosition =
                    routeInfo?.legInfo?.travelMode === 'Bus'
                        ? trackingPositionLatLng?.find(position => position.vehicleId === markerKey)?.position
                        : trackingPositionLatLng?.[0]?.position;

                if (isTrackingId && trackingPosition && trackingPosition.lat !== 0) {
                    const markerExists = mapRef.current?.hasMarker(routeId, id);

                    if (!markerExists) {
                        mapRef.current?.addMarker({
                            coordinate: convertLatLongToLatLng(trackingPosition),
                            id,
                            title: '',
                            iconType: pinIconType,
                            zIndex: zIndex || 99,
                            vehicleVariant,
                            multimodalVariant,
                            anchor: { x: 0.5, y: 0.3 },
                            rotateEnabled: true,
                            rotation: 0,
                            children: undefined,
                            style: undefined,
                            onClick: undefined,
                            showEditIcon: false,
                            markerOnPress: undefined,
                        });

                        return { ...record, [id]: true };
                    } else {
                        await moveVehicleTrackingMarker({
                            vehiclePosition: convertLatLongToLatLng(trackingPosition),
                            calloutText,
                            duration: 500,
                            markerId: id,
                        });
                    }
                }

                return record;
            },
            Promise.resolve(initialRecord),
        );

        return Object.keys(updatedMarkerRecord);
    };

    const extractPolylineIds = (polylineData: polylineData[]): string[] => {
        return polylineData.map(data => data.id);
    };

    const updateMarkers = (routeInfo: JourneyTrackingData): string[] => {
        const markersIdsArray: string[] = mapRef.current?.getMarkerArray(routeInfo.routeId) ?? [];
        const currentMarkerIds = routeInfo.marker.map(marker => marker.id).filter(id => id !== undefined);

        markersIdsArray.forEach(markerId => {
            if (!currentMarkerIds.includes(markerId) && mapRef.current?.hasMarker(routeInfo.routeId, markerId)) {
                mapRef.current?.multimodalRemoveMarker(routeInfo.routeId, markerId);
            }
        });

        return markersIdsArray.filter(id => currentMarkerIds.includes(id));
    };

    const updateMultiModalTrackingRoute = async (routeInfo: JourneyTrackingData) => {
        if (!routeInfo.legData.coordinates) return;
        if (routeInfo.removeDataFlag) {
            mapRef.current?.multiModalRemoveRoute(routeInfo.routeId);
            return;
        }

        const polylineIds = routeInfo.polyline;

        const polylineArrayId = extractPolylineIds(routeInfo.polyline);

        const { coordinates } = routeInfo.legData;
        const lastCoord = coordinates[coordinates.length - 1];
        if (!lastCoord) return;

        // Add polyline
        drawMultimodalPolyline(routeInfo, polylineArrayId);

        const markersIdArray = updateMarkers(routeInfo);

        // Add leg marker
        const addMarkerArray: string[] = await addLegMarkers(routeInfo, markersIdArray);

        // Add and update tracking marker
        const addTrackingArray: string[] = await addTrackingPositionMarker(routeInfo, addMarkerArray);

        // Build the multi-modal route

        if (
            !mapRef.current?.hasRoute(routeInfo.routeId) ||
            addTrackingArray.some(id => !mapRef.current?.hasMarker(routeInfo.routeId, id)) ||
            polylineIds.some(data => !mapRef.current?.hasPolyline(routeInfo.routeId, data))
        ) {
            mapRef.current?.multiModalBuildRoute(routeInfo.routeId, polylineArrayId, addTrackingArray);
        }
    };

    const drawEstimateRoute = useCallback(
        async ({
            coordinates,
            sourceAddress,
            onDestClick,
            onSourceClick,
            showEditIcon,
            destAddress,
            destinationPoints,
            destinationTitles,
        }: {
            coordinates: LatLng[];
            sourceAddress: string | undefined;
            onDestClick: (() => void) | undefined;
            onSourceClick: (() => void) | undefined;
            showEditIcon: boolean | undefined;
            destAddress: string | undefined;
            destinationPoints: LatLng[] | undefined;
            destinationTitles: string[];
        }) => {
            const finalDestinationPoints = (destinationPoints ?? [coordinates[coordinates.length - 1]]).filter(
                (point): point is LatLng => point !== undefined,
            );
            if (mapRef.current) {
                await drawRoute({
                    coordinates,
                    destinationPoints: finalDestinationPoints,
                    destinationTitles,
                    srcIconType: 'pickup',
                    dstIconType: 'dropoff',
                    shouldRotateSrcMarker: false,
                    sourceAddress,
                    onDestClick,
                    onSourceClick,
                    showEditIcon,
                    destAddress,
                    vehicleVariant: undefined,
                    driverPrevRideDest: undefined,
                    stopInfo: null,
                });
            }
            if (coordinates.length > 0) {
                mapRef.current?.addMapPadding({
                    left: 50,
                    top: Platform.OS === 'ios' ? 100 : 150,
                    right: 50,
                    bottom: Platform.OS === 'ios' ? 460 : 700,
                });
                mapRef.current?.fitToCoordinates({
                    coordinates,
                    duration: undefined,
                });
            }
        },
        [mapRef.current, rideId, vehicleVariant],
    );

    const drawTrackingRoute = useCallback(
        async ({
            coordinates,
            isPickup,
            srcText,
            destAddress,
            destinationPoints,
            destinationTitles,
            driverPrevRideDest,
            vehicleVariant,
            onDestClick,
            showEditIcon,
            stopInfo,
        }: {
            coordinates: LatLng[];
            isPickup: boolean;
            srcText: string;
            destAddress: string | undefined;
            destinationPoints: LatLng[] | undefined;
            destinationTitles: string[];
            driverPrevRideDest: LatLng | undefined;
            vehicleVariant: VehicleVariant_vehicleVariant | undefined;
            onDestClick: (() => void) | undefined;
            showEditIcon: boolean | undefined;
            stopInfo: StopInfo | null;
        }) => {
            const dPoints =
                destinationPoints ??
                [coordinates[coordinates.length - 1]].filter((point): point is LatLng => point !== undefined);

            await drawRoute({
                coordinates,
                destinationPoints: dPoints,
                destinationTitles,
                srcIconType: 'vehicle',
                dstIconType: isPickup ? 'pickup' : 'dropoff',
                vehicleVariant: vehicleVariant,
                shouldRotateSrcMarker: true,
                sourceAddress: srcText,
                destAddress: destAddress,
                driverPrevRideDest,
                onSourceClick: undefined,
                onDestClick,
                showEditIcon,
                stopInfo,
            });
        },
        [mapRef, rideId, vehicleVariant, drawRoute],
    );

    const updateTrackingRoute = useCallback(
        async (
            isPickup: boolean,
            route: LatLng[],
            currIdx: number,
            dispatch: AppDispatchType,
            duration: number = 500,
        ) => {
            const currCoord = route.at(currIdx);
            const remainingRoute = route.slice(currIdx);
            if (currCoord) {
                const distancePending = await MapUtils.computeLength(route.slice(currIdx));
                const { displayDistance, displayUnit } = calculateDisplayDistance(distancePending);
                isPickup
                    ? dispatch(setPickupDistance({ id: rideId, payload: distancePending }))
                    : dispatch(setDistanceMoved({ id: rideId, payload: distancePending }));

                const prevCoord = mapRef.current?.getMarkers().has('routeStart')
                    ? mapRef.current?.getMarkers().get('routeStart')?.coordinate
                    : undefined;
                // Only compute new heading if coordinates actually changed - prevents rotation reset when stationary
                const coordsChanged =
                    prevCoord &&
                    (prevCoord.latitude !== currCoord.latitude || prevCoord.longitude !== currCoord.longitude);
                const angle = coordsChanged ? computeHeading(prevCoord, currCoord) : undefined;
                mapRef.current?.moveMarker({
                    markerId: 'routeStart',
                    newPosition: currCoord,
                    animation: false,
                    animationDuration: duration,
                    rotation: angle,
                    rotationDuration: undefined,
                });
                mapRef.current?.updateCalloutText('routeStart', `${displayDistance}${displayUnit} away`);

                if (remainingRoute.length > 1) {
                    // Draw the remainingRoute polyline
                    await mapRef.current?.addPolyline({
                        coordinates: remainingRoute,
                        id: 'defaultPolyline',
                        visible: true,
                        strokeColor: '#5F8FE2', // appName === 'yatriSathi' ? '#5F8FE2' : '#000000', // TODO :: Need to check in android strokeColor and gradient
                        strokeColors: undefined, // appName === 'yatriSathi' ? undefined : [themeColors.APP_THEME_COLOR, '#161622'],
                        strokeWidth: undefined,
                        extendPath: undefined,
                        lineDashPattern: undefined,
                    });
                } else if (remainingRoute.length === 0 || remainingRoute.length === 1) {
                    // await mapRef.current?.addPolyline({
                    //   coordinates: [],
                    //   id: 'defaultPolyline',
                    //   visible: false,
                    // });
                }
                // Adding explicit delay to show the animation, since above operations need to happen in parallel
                await delay(duration);
            } else {
                console.warn('updateTrackingRoute', 'Invalid index', currIdx);
            }
        },
        [mapRef.current, mapRef.current?.getMarkers, rideId, vehicleVariant],
    );

    const removeRoute = useCallback(
        (routeId: string) => {
            mapRef.current?.removeRoute(routeId);
        },
        [mapRef.current, rideId, vehicleVariant],
    );

    const cancelTrackingAnimation = useCallback(() => {
        mapRef.current?.cancelMarkerAnimation('routeStart');
    }, [mapRef.current, rideId, vehicleVariant]);

    const redrawRouteWOTrackingMarker = useCallback(
        async ({
            coordinates,
            destinationPoints,
            destinationTitles,
            driverPrevRideDest,
            stopInfo,
        }: {
            coordinates: LatLng[];
            destinationPoints: LatLng[];
            destinationTitles: string[];
            driverPrevRideDest: LatLng | undefined;
            stopInfo: StopInfo | null;
        }) => {
            if (coordinates.length !== 0) {
                drawRouteAndDropMarkers({
                    coordinates,
                    destinationPoints,
                    destinationTitles,
                    dstIconType: 'dropoff',
                    destAddress: undefined,
                    driverPrevRideDest,
                    onDestClick: undefined,
                    showEditIcon: undefined,
                    stopInfo: stopInfo,
                });

                // Build route with all markers
                const markersIds = [
                    'routeStart',
                    ...makeRange(0, destinationPoints.length - 2).map(i => `routeWaypoint-${i}`),
                    'routeEnd',
                ];
                mapRef.current?.buildRoute('defaultRoute', 'defaultPolyline', markersIds);
            }
        },
        [mapRef.current, rideId, vehicleVariant],
    );

    const moveTrackingMarker = useCallback(
        async ({
            route,
            currIdx,
            calloutText,
            duration,
        }: {
            route: LatLng[];
            currIdx: number;
            calloutText: string | undefined;
            duration: number;
        }) => {
            const currCoord = route.at(currIdx);
            const nextCoord = route.at(currIdx + 1);
            if (currCoord) {
                if (nextCoord) {
                    const angle = computeHeading(currCoord, nextCoord);
                    mapRef.current?.moveMarker({
                        markerId: 'routeStart',
                        newPosition: currCoord,
                        animation: false,
                        animationDuration: duration,
                        rotation: angle,
                        rotationDuration: undefined,
                    });
                    if (calloutText) {
                        mapRef.current?.updateCalloutText('routeStart', calloutText);
                    }
                }
            }
        },
        [mapRef.current, rideId, vehicleVariant],
    );

    const result = useMemo(() => {
        return {
            drawEstimateRoute,
            drawTrackingRoute,
            updateTrackingRoute,
            removeRoute,
            cancelTrackingAnimation,
            redrawRouteWOTrackingMarker,
            moveTrackingMarker,
            multiModelDrawRoute,
            updateMultiModalTrackingRoute,
            moveVehicleTrackingMarker,
        };
    }, [
        drawEstimateRoute,
        drawTrackingRoute,
        updateTrackingRoute,
        removeRoute,
        cancelTrackingAnimation,
        redrawRouteWOTrackingMarker,
        moveTrackingMarker,
        multiModelDrawRoute,
        updateMultiModalTrackingRoute,
        moveVehicleTrackingMarker,
    ]);

    return result;
};

export default useMapRoute;
