import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { NativeModules } from 'react-native';
import { type LatLng } from 'react-native-maps';
import { runOnJS } from 'react-native-reanimated';
import { dedupCoords, computeHeading } from '../utils/common.ts';
import { COORD_ON_PATH_THRESHOLD_IN_M } from '../constants/common.ts';
import { MapContext } from '../Maps/MapContext.tsx';
import { IconType } from '../components/AnimatedMapPin.tsx';
import { calculateVehicleRotation, findNearestPointOnRoute } from '@/src-v2/helpers/location/utils/SnaptoWaypoint.ts';
import { isUndefined } from 'lodash';
import { type geoJsonGeometry } from '@/api/apiTypes/ServiceabilityApi.gen.js';
import { addSpecialZone } from '@/typescript/utils/ConfirmPickupUtils.tsx';

const { MapUtils } = NativeModules;

export type NativeLatLng = { latitude: number; longitude: number };

const enableAnimationDebugLogs = false;

const animDebugLog = (...args: (string | object | number | boolean)[]) => {
    if (enableAnimationDebugLogs) {
        console.info('coreVehicleAnim', ...args);
    }
};

// --- Configuration Types ---
export type MarkerConfig = {
    id: string | undefined;
    iconType: IconType;
    multimodalVariant: string | undefined;
    title: string | undefined;
    onClick: (() => void) | undefined;
    zIndex: number | undefined;
    rotation: number | undefined;
};

export type PolylineConfig = {
    color: string | undefined;
    strokeWidth: number | undefined;
    lineDashPattern: number[] | undefined;
};

export type VehicleMarkerConfig = MarkerConfig & {
    getCalloutText:
        | ((currentPosition: LatLng, route: LatLng[], rawDistance?: number) => string | undefined)
        | undefined;
};

export type CoreVehicleTrackingProps = {
    trackingId: string;
    liveVehicleLocation: LatLng | null;
    routeCoordinates: LatLng[];

    polylineConfig: PolylineConfig | undefined;
    sourceMarkerConfig: MarkerConfig | undefined;
    destinationMarkerConfig: MarkerConfig | undefined;
    userLocationMarkerConfig: MarkerConfig | undefined;
    userLocation: LatLng | null;
    sourceLocation: LatLng | null;
    sourceArea: geoJsonGeometry | undefined;
    destinationArea: geoJsonGeometry | undefined;
    destinationLocation: LatLng | null;
    waypointMarkersConfig:
        | {
              points: LatLng[];
              iconType: IconType;
              idPrefix: string | undefined;
              onClick: ((index: number, coord: LatLng) => void) | undefined;
          }
        | undefined;
    vehicleMarkerConfig: VehicleMarkerConfig | undefined;
    fitMapToRouteOnLoad: boolean | undefined;
    autoFitMapToVehicle: boolean | undefined;
    animationPollingInterval: number | undefined;
    bottomPadding: number | undefined;
    onAnimatedVehiclePositionUpdate: ((coordinates: LatLng) => void) | undefined;
};

export type AnimatedVehicleData = {
    coordinates: LatLng | null;
    bearing: number | null;
};

export type CoreTrackingControls = {
    redrawRoute: (
        newRouteCoordinates?: LatLng[],
        newLiveLocation?: CoreVehicleTrackingProps['liveVehicleLocation'],
    ) => Promise<void>;
    clearRoute: () => void;
    updateVehicleCalloutText: (text: string | undefined) => void;
    getAnimatedVehicleData: () => AnimatedVehicleData;
    recenterMap: () => void;
};

export const useCoreVehicleTracking = ({
    trackingId,
    liveVehicleLocation: initialLiveVehicleLocation,
    routeCoordinates: initialRawRouteCoordinates,
    polylineConfig,
    sourceMarkerConfig,
    destinationMarkerConfig,
    waypointMarkersConfig,
    userLocationMarkerConfig,
    userLocation,
    sourceLocation,
    sourceArea,
    destinationArea,
    destinationLocation,
    vehicleMarkerConfig,
    fitMapToRouteOnLoad = true,
    autoFitMapToVehicle = true,
    animationPollingInterval = 2000,
    onAnimatedVehiclePositionUpdate,
    bottomPadding = 600,
}: CoreVehicleTrackingProps): CoreTrackingControls => {
    const userLocationRef = useRef<LatLng | null>(userLocation || null);
    const { mapRef } = useContext(MapContext);
    const currentRouteCoords = useRef<LatLng[]>([]);
    const currentLiveLocation = useRef(initialLiveVehicleLocation);

    const polylineId = `${trackingId}-polyline`;
    const vehicleMarkerId = vehicleMarkerConfig?.id || `${trackingId}-vehicle`;
    const sourceMarkerId = sourceMarkerConfig?.id || `${trackingId}-source`;
    const destinationMarkerId = destinationMarkerConfig?.id || `${trackingId}-destination`;
    const userLocationMarkerId = userLocationMarkerConfig?.id || `${trackingId}-user-location`;
    const waypointIdPrefix = waypointMarkersConfig?.idPrefix || `${trackingId}-waypoint`;
    const walkPolylineId = `${trackingId}-walk-polyline`;

    const currentAnimatedIndex = useRef(0);
    const isAnimationRunning = useRef(false);
    const cancelCurrentAnimationSignal = useRef(false);
    const animationConcurrentThreads = useRef(0);

    const [animatedVehicleData, setAnimatedVehicleData] = useState<AnimatedVehicleData>({
        coordinates: null,
        bearing: null,
    });

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current?.addStaticMapPadding({
                left: 0,
                top: 100,
                right: 0,
                bottom: bottomPadding,
            });
        }
    }, [bottomPadding]);

    const clearDrawnElements = useCallback(() => {
        if (mapRef.current) {
            mapRef.current.removeAllMarkers();
            mapRef.current.removeAllPolylines();
            if (mapRef.current.hasMarkerWithoutRouteId(vehicleMarkerId)) {
                mapRef.current.removeMarker(vehicleMarkerId);
            }
            if (mapRef.current.hasMarkerWithoutRouteId(sourceMarkerId)) {
                mapRef.current.removeMarker(sourceMarkerId);
            }
            if (mapRef.current.hasMarkerWithoutRouteId(destinationMarkerId)) {
                mapRef.current.removeMarker(destinationMarkerId);
            }
            if (waypointMarkersConfig?.points) {
                waypointMarkersConfig.points.forEach((_, index) => {
                    const waypointMarkerId = `${waypointIdPrefix}-${index}`;
                    if (mapRef.current?.hasMarkerWithoutRouteId(waypointMarkerId)) {
                        mapRef.current?.removeMarker(waypointMarkerId);
                    }
                });
            }
            if (mapRef.current.hasPolygonWithoutRouteId(sourceMarkerId)) {
                mapRef.current.removePolygon({ polygonId: sourceMarkerId });
            }
            if (mapRef.current.hasMarkerWithoutRouteId(userLocationMarkerId)) {
                mapRef.current.removeMarker(userLocationMarkerId);
            }
            if (mapRef.current.hasPolylineWithoutRouteId(polylineId)) {
                mapRef.current.removeAllPolylines();
            } else {
                animDebugLog(`mapRef.current.removePolyline for ${polylineId} is not a function or undefined.`);
            }
        }
    }, [
        mapRef,
        vehicleMarkerId,
        sourceMarkerId,
        destinationMarkerId,
        waypointIdPrefix,
        waypointMarkersConfig,
        polylineId,
        userLocationMarkerId,
    ]);

    const drawRouteElements = useCallback(
        async (routeCoords: LatLng[], vehicleLoc: typeof initialLiveVehicleLocation) => {
            if (!mapRef.current) return;

            if (routeCoords.length > 0 && polylineId) {
                if (mapRef.current.hasPolylineWithoutRouteId(polylineId)) {
                    mapRef.current.updatePolyline({
                        polylineId: polylineId,
                        newCoordinates: routeCoords.length > 1 ? routeCoords : [],

                        strokeColor: polylineConfig?.color || '#FFAA00',

                        strokeWidth: polylineConfig?.strokeWidth || 4,
                    });
                } else if (!mapRef.current.hasPolylineWithoutRouteId(polylineId)) {
                    const coordinates = routeCoords.length > 1 ? routeCoords : [];
                    if (coordinates.length >= 2) {
                        mapRef.current.addPolyline({
                            id: polylineId,
                            coordinates: coordinates,
                            visible: true,
                            strokeColor: polylineConfig?.color || '#FFAA00',
                            strokeColors: [],
                            strokeWidth: polylineConfig?.strokeWidth || 4,
                            extendPath: false,
                            lineDashPattern: polylineConfig?.lineDashPattern || undefined,
                        });
                    } else if (coordinates.length < 2) {
                        mapRef.current.hidePolyline(polylineId);
                        console.warn('Polyline not added: At least 2 coordinates are required.');
                    }
                }
            } else {
                mapRef.current.hidePolyline(polylineId);
            }
            // Walk polyline logic
            if (userLocationMarkerConfig && userLocation && sourceLocation) {
                // Draw straight line from userLocation to sourceLocation
                const walkLine = [
                    userLocation,
                    sourceLocation ? sourceLocation : destinationLocation ? destinationLocation : userLocation,
                ].filter((coord): coord is LatLng => coord !== null);
                if (mapRef.current.hasPolylineWithoutRouteId(walkPolylineId)) {
                    mapRef.current.updatePolyline({
                        polylineId: walkPolylineId,
                        newCoordinates: walkLine,
                        strokeColor: polylineConfig?.color || '#007AFF',
                        strokeWidth: 3,
                    });
                } else if (!mapRef.current.hasPolylineWithoutRouteId(walkPolylineId)) {
                    mapRef.current.addPolyline({
                        id: walkPolylineId,
                        coordinates: walkLine,
                        visible: true,
                        strokeColor: polylineConfig?.color || '#007AFF',
                        strokeColors: [],
                        strokeWidth: 3,
                        extendPath: false,
                        lineDashPattern: [8, 8],
                    });
                }
            } else if (userLocationMarkerConfig === undefined) {
                mapRef.current.hidePolyline(walkPolylineId);
            }
            if (sourceMarkerConfig && sourceLocation) {
                if (sourceArea && mapRef) {
                    addSpecialZone(
                        {
                            id: sourceMarkerId,
                            category: 'Pickup',
                            gatesInfo: [],
                            geoJson: sourceArea,
                            locationName: 'Pickup',
                            locationType: 'Pickup',
                        },
                        mapRef,
                        '#88E5B233',
                        () => {},
                    );
                }
                mapRef.current.addMarker({
                    coordinate: sourceLocation,
                    id: sourceMarkerId,
                    rotateEnabled: undefined,
                    children: undefined,
                    style: undefined,
                    title: sourceMarkerConfig.title,
                    onClick: sourceMarkerConfig.onClick,
                    showEditIcon: false,
                    vehicleVariant: undefined,
                    multimodalVariant: sourceMarkerConfig.multimodalVariant || 'BusStop',
                    markerOnPress: undefined,
                    iconType: sourceMarkerConfig.iconType,
                    anchor: { x: 0.5, y: 0 },
                    zIndex: sourceMarkerConfig.zIndex || 1,
                    rotation: 0,
                });
            } else if (sourceMarkerConfig === undefined) {
                mapRef.current.removeMarker(sourceMarkerId);
            }

            if (
                destinationMarkerConfig &&
                destinationLocation &&
                !mapRef.current.hasMarkerWithoutRouteId(destinationMarkerId)
            ) {
                if (destinationArea && mapRef) {
                    addSpecialZone(
                        {
                            id: destinationMarkerId,
                            category: 'Dropoff',
                            gatesInfo: [],
                            geoJson: destinationArea,
                            locationName: 'Dropoff',
                            locationType: 'Dropoff',
                        },
                        mapRef,
                        '#88E5B233',
                        () => {},
                    );
                }
                mapRef.current.addMarker({
                    id: destinationMarkerId,
                    coordinate: destinationLocation,
                    iconType: destinationMarkerConfig.iconType,
                    title: destinationMarkerConfig.title,
                    onClick: destinationMarkerConfig.onClick,
                    anchor: { x: 0.5, y: 0.5 },
                    zIndex: destinationMarkerConfig.zIndex || 5,
                    rotation: 0,
                    showEditIcon: false,
                    vehicleVariant: undefined,
                    multimodalVariant: destinationMarkerConfig.multimodalVariant || 'BusStop',
                    markerOnPress: undefined,
                    rotateEnabled: undefined,
                    children: undefined,
                    style: undefined,
                });
            } else if (destinationMarkerConfig === undefined) {
                mapRef.current.removeMarker(destinationMarkerId);
            }

            if (waypointMarkersConfig?.points) {
                waypointMarkersConfig.points.forEach((point, index) => {
                    if (mapRef.current) {
                        mapRef.current.addMarker({
                            id: `${waypointIdPrefix}-${index}`,
                            coordinate: point,
                            iconType: waypointMarkersConfig.iconType,
                            onClick: () => waypointMarkersConfig.onClick?.(index, point),
                            anchor: { x: 0.5, y: 0.5 },
                            zIndex: 2,
                            title: undefined,
                            rotation: undefined,
                            showEditIcon: false,
                            vehicleVariant: undefined,
                            multimodalVariant: undefined,
                            markerOnPress: undefined,
                            rotateEnabled: undefined,
                            children: undefined,
                            style: undefined,
                        });
                    }
                });
            }

            if (userLocationMarkerConfig && userLocation) {
                if (mapRef.current.hasMarkerWithoutRouteId(userLocationMarkerId)) {
                    mapRef.current.moveMarker({
                        markerId: userLocationMarkerId,
                        newPosition: userLocation,
                        rotation: 0,
                        animationDuration: 1000,
                        animation: true, // Typically snap for initial placement
                        rotationDuration: undefined,
                    });
                    return;
                } else {
                    mapRef.current.addMarker({
                        id: userLocationMarkerId,
                        coordinate: userLocationRef.current || userLocation,
                        iconType: userLocationMarkerConfig.iconType,
                        onClick: userLocationMarkerConfig.onClick,
                        anchor: { x: 0.5, y: 0.5 },
                        zIndex: 2,
                        title: undefined,
                        rotation: undefined,
                        showEditIcon: false,
                        vehicleVariant: undefined,
                        multimodalVariant: userLocationMarkerConfig.multimodalVariant || 'TrackingWalk',
                        markerOnPress: undefined,
                        rotateEnabled: undefined,
                        children: undefined,
                        style: undefined,
                    });
                }
            } else if (userLocationMarkerConfig === undefined) {
                mapRef.current.removeMarker(userLocationMarkerId);
            }

            const vehicleInitialPos = vehicleLoc || sourceLocation;
            if (vehicleInitialPos && vehicleMarkerConfig && mapRef.current) {
                const initialBearing =
                    routeCoords.length > 1 && sourceLocation && routeCoords[1]
                        ? computeHeading(sourceLocation, routeCoords[1])
                        : 0;
                const vehicleMarkerExists = mapRef.current.hasMarkerWithoutRouteId(vehicleMarkerId);
                const snappedVehicle = findNearestPointOnRoute(vehicleInitialPos, routeCoords);
                const rotation = isUndefined(vehicleMarkerConfig.rotation)
                    ? calculateVehicleRotation(snappedVehicle, routeCoords)
                    : vehicleMarkerConfig.rotation;
                if (vehicleMarkerExists) {
                    mapRef.current.moveMarker({
                        markerId: vehicleMarkerId,
                        newPosition: vehicleInitialPos,
                        rotation: rotation,
                        animationDuration: 1000,
                        animation: true, // Typically snap for initial placement
                        rotationDuration: undefined,
                    });
                } else {
                    const randomInt = Math.floor(Math.random() * 1000) + 1;
                    if (!mapRef.current.hasMarkerWithoutRouteId(vehicleMarkerId)) {
                        mapRef.current.addMarker({
                            id: vehicleMarkerId,
                            coordinate: vehicleInitialPos,
                            iconType: vehicleMarkerConfig.iconType,
                            title:
                                vehicleMarkerConfig.getCalloutText?.(vehicleInitialPos, routeCoords) ||
                                vehicleMarkerConfig.title,
                            anchor: { x: 0.5, y: 0.5 },
                            zIndex: (vehicleMarkerConfig.zIndex || 10) + randomInt,
                            rotation: rotation,
                            onClick: undefined,
                            showEditIcon: false,
                            vehicleVariant: undefined,
                            multimodalVariant: vehicleMarkerConfig.multimodalVariant || 'TrackingDirectedBus',
                            markerOnPress: undefined,
                            rotateEnabled: undefined,
                            children: undefined,
                            style: undefined,
                        });
                    }
                }
                setAnimatedVehicleData({ coordinates: vehicleInitialPos, bearing: initialBearing });
            }

            if (fitMapToRouteOnLoad && mapRef.current) {
                setTimeout(() => {
                    const coordsToFit = [
                        ...(sourceArea && sourceMarkerConfig
                            ? sourceArea.coordinates.map(coord => ({
                                  latitude: coord.lat,
                                  longitude: coord.lon,
                              }))
                            : []),
                        ...routeCoords,
                        ...(vehicleInitialPos ? [vehicleInitialPos] : []),
                        ...(userLocation ? [userLocation] : []),
                    ];
                    mapRef.current?.fitToCoordinates({
                        coordinates: coordsToFit,
                        duration: 500,
                    });
                }, 500);
            }
        },
        [
            mapRef,
            polylineId,
            sourceMarkerId,
            destinationMarkerId,
            waypointIdPrefix,
            vehicleMarkerId,
            polylineConfig,
            sourceMarkerConfig,
            destinationMarkerConfig,
            waypointMarkersConfig,
            vehicleMarkerConfig,
            fitMapToRouteOnLoad,
            clearDrawnElements,
            walkPolylineId,
        ],
    );

    useEffect(() => {
        currentRouteCoords.current = dedupCoords(initialRawRouteCoordinates || []);
        currentLiveLocation.current = initialLiveVehicleLocation;
        userLocationRef.current = userLocation;
        const hasRouteData = currentRouteCoords.current.length > 0;
        const hasUserData = userLocation && userLocationMarkerConfig;
        const hasSourceData = sourceLocation && sourceMarkerConfig;
        const hasDestinationData = destinationLocation && destinationMarkerConfig;

        if (hasRouteData || hasUserData || hasSourceData || hasDestinationData) {
            drawRouteElements(currentRouteCoords.current, currentLiveLocation.current);
        } else {
            clearDrawnElements();
        }
        currentAnimatedIndex.current = 0;
        isAnimationRunning.current = false;
        cancelCurrentAnimationSignal.current = true;

        return () => {
            clearDrawnElements();
        };
    }, [
        initialRawRouteCoordinates,
        initialLiveVehicleLocation,
        userLocation,
        sourceLocation,
        destinationLocation,
        userLocationMarkerConfig,
        sourceMarkerConfig,
        destinationMarkerConfig,
    ]);

    useEffect(() => {
        const liveLoc = currentLiveLocation.current;
        if (!liveLoc || currentRouteCoords.current.length === 0 || !mapRef.current) {
            return;
        }

        const animate = async () => {
            if (animationConcurrentThreads.current > 0 && !cancelCurrentAnimationSignal.current) {
                return;
            }

            animationConcurrentThreads.current++;
            cancelCurrentAnimationSignal.current = false;
            isAnimationRunning.current = true;
            try {
                const vehicleLatLng: NativeLatLng = { latitude: liveLoc.latitude, longitude: liveLoc.longitude };
                const pathCheckResult = await MapUtils.getClosestPointOnPath(vehicleLatLng, currentRouteCoords.current);
                let mutableTargetIndexOnPath =
                    pathCheckResult.distance > COORD_ON_PATH_THRESHOLD_IN_M ? -1 : pathCheckResult.segmentIndex;
                if (mutableTargetIndexOnPath === -1) {
                    setAnimatedVehicleData({ coordinates: liveLoc, bearing: 0 });
                    if (mapRef.current && mapRef.current.hasMarkerWithoutRouteId(vehicleMarkerId))
                        mapRef.current.moveMarker({
                            markerId: vehicleMarkerId,
                            newPosition: liveLoc,
                            rotation: 0,
                            animationDuration: 200,
                            animation: true,
                            rotationDuration: undefined,
                        });
                    if (autoFitMapToVehicle && mapRef.current) {
                        mapRef.current.fitToCoordinates({ coordinates: [liveLoc], duration: 500 });
                    }
                    isAnimationRunning.current = false;
                    animationConcurrentThreads.current--;
                    return;
                }

                mutableTargetIndexOnPath = Math.max(mutableTargetIndexOnPath, currentAnimatedIndex.current);
                const indexDiff = Math.max(mutableTargetIndexOnPath - currentAnimatedIndex.current, 0);

                if (indexDiff === 0 && currentAnimatedIndex.current === mutableTargetIndexOnPath) {
                    isAnimationRunning.current = false;
                    animationConcurrentThreads.current--;
                    return;
                }

                const MIN_STEPS = 1;
                const MAX_STEPS = 5;
                const subSteps = Math.max(MIN_STEPS, Math.min(Math.round(indexDiff / 2), MAX_STEPS));
                const stepDuration = animationPollingInterval / subSteps;

                let mutableAnimatedStepIdx = currentAnimatedIndex.current;
                /* eslint-disable-next-line functional/no-let */
                for (let i = 0; i < subSteps; i++) {
                    if (cancelCurrentAnimationSignal.current) {
                        break;
                    }
                    const progressRatio = (i + 1) / subSteps;
                    const nextIdxToReach = currentAnimatedIndex.current + Math.ceil(indexDiff * progressRatio);
                    const actualNextIdx = Math.min(
                        nextIdxToReach,
                        mutableTargetIndexOnPath,
                        currentRouteCoords.current.length - 1,
                    );

                    if (actualNextIdx < mutableAnimatedStepIdx) continue;
                    if (actualNextIdx === mutableAnimatedStepIdx && i < subSteps - 1) {
                        await new Promise(resolve => setTimeout(resolve, stepDuration));
                        continue;
                    }

                    const nextCoord = currentRouteCoords.current[actualNextIdx];
                    if (!nextCoord) break;

                    const prevAnimCoord = currentRouteCoords.current[actualNextIdx - 1];
                    const currentBearing =
                        actualNextIdx > 0 && prevAnimCoord ? computeHeading(prevAnimCoord, nextCoord) : 0;

                    setAnimatedVehicleData({ coordinates: nextCoord, bearing: currentBearing });
                    if (mapRef.current)
                        mapRef.current.moveMarker({
                            markerId: vehicleMarkerId,
                            newPosition: nextCoord,
                            rotation: currentBearing,
                            animationDuration: stepDuration,
                            animation: true,
                            rotationDuration: undefined,
                        });

                    const calloutText =
                        vehicleMarkerConfig?.getCalloutText?.(nextCoord, currentRouteCoords.current) ||
                        vehicleMarkerConfig?.title;
                    if (calloutText !== undefined && mapRef.current) {
                        mapRef.current.updateCalloutText(vehicleMarkerId, calloutText);
                    }

                    if (onAnimatedVehiclePositionUpdate) {
                        runOnJS(onAnimatedVehiclePositionUpdate)(nextCoord);
                    }

                    mutableAnimatedStepIdx = actualNextIdx;
                    if (autoFitMapToVehicle && mapRef.current && nextCoord) {
                        mapRef.current.fitToCoordinates({
                            coordinates: [nextCoord],
                            duration: Math.max(stepDuration, 100),
                        });
                    }
                    if (mutableAnimatedStepIdx >= mutableTargetIndexOnPath) break;
                    await new Promise(resolve => setTimeout(resolve, stepDuration));
                }
                currentAnimatedIndex.current = mutableAnimatedStepIdx;
            } catch (error) {
                console.error('Error during core vehicle animation:', error);
            } finally {
                isAnimationRunning.current = false;
                animationConcurrentThreads.current--;
                if (cancelCurrentAnimationSignal.current) {
                    animDebugLog('Animation cancelled.');
                }
            }
        };

        if (initialLiveVehicleLocation !== currentLiveLocation.current) {
            currentLiveLocation.current = initialLiveVehicleLocation;
        }
        animate();

        return () => {
            cancelCurrentAnimationSignal.current = true;
        };
    }, [initialLiveVehicleLocation, animationPollingInterval, vehicleMarkerId, currentRouteCoords.current]);

    const redrawRoute = useCallback(
        async (newRouteCoords?: LatLng[], newLiveLocation?: CoreVehicleTrackingProps['liveVehicleLocation']) => {
            const routeToDraw = newRouteCoords ? dedupCoords(newRouteCoords) : currentRouteCoords.current;
            const locToUse = newLiveLocation !== undefined ? newLiveLocation : currentLiveLocation.current;

            currentRouteCoords.current = routeToDraw;
            currentLiveLocation.current = locToUse;

            currentAnimatedIndex.current = 0;
            isAnimationRunning.current = false;
            cancelCurrentAnimationSignal.current = true;

            await new Promise(resolve => setTimeout(resolve, 50));

            await drawRouteElements(routeToDraw, locToUse);
        },
        [drawRouteElements],
    );

    const clearRoute = useCallback(() => {
        clearDrawnElements();
        currentRouteCoords.current = [];
        currentAnimatedIndex.current = 0;
        setAnimatedVehicleData({ coordinates: null, bearing: null });
    }, [clearDrawnElements]);

    const updateVehicleCalloutText = useCallback(
        (text: string | undefined) => {
            if (mapRef.current) {
                mapRef.current.updateCalloutText(vehicleMarkerId, text || '');
            }
        },
        [mapRef, vehicleMarkerId],
    );

    const getAnimatedVehicleData = useCallback(() => {
        return animatedVehicleData;
    }, [animatedVehicleData]);

    const recenterMap = () => {
        mapRef.current?.fitToCoordinates({
            coordinates: initialRawRouteCoordinates || [],
            duration: 1000,
        });
    };

    return {
        redrawRoute,
        clearRoute,
        updateVehicleCalloutText,
        getAnimatedVehicleData,
        recenterMap,
    };
};
