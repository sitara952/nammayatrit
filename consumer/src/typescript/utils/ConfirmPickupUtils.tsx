import { gatesInfoFull, hotSpotInfo, specialLocation } from '@/api/apiTypes/ServiceabilityApi.gen';
import { haversineDistance } from '@/helpers/utils/Utils.gen';
import { latLong } from '@/api/apiTypes/GetPlaceNameApi.gen';
// export const mapSpecialLocations = (
//   location: location | undefined,
//   mapRef.current?: GMapContextType,
// ) => {
//   // @TODO: Enable once special location properly implemented
//   // location?.mapWithUnit(src =>
//   //   src.specialLocation?.mapWithUnit(specialLocation =>
//   //     specialLocation.gatesInfo.forEach(gate => mapRef.current?.removeMarker({ markerId: gate.id }))
//   //   )
//   // );
// };
import { THRESHOLD_FOR_CUSTOM_GATE } from '../../../src-v2/screens/ConfirmPickup/Constants';
import React, { RefObject } from 'react';
import { MapRef } from '../Maps/MapComponent';
import { LatLng } from 'react-native-maps';
import {
    HOTSPOT_AUTO_SNAP_DISTANCE,
    HOTSPOT_MAX_RADIUS,
    HOTSPOT_DISPLAY_LIMIT,
    DEFAULT_CAMERA_ZOOM,
} from '../constants/common';

type nearestGateType = { gateInfo: gatesInfoFull; gateDistance: number } | undefined;

type HotspotWithDistance = {
    hotspot: hotSpotInfo;
    distance: number;
};

export const mapSpecialLocationCoords = (coordinates: latLong[]) => {
    return coordinates.map(coord => ({
        latitude: coord.lat,
        longitude: coord.lon,
    }));
};

export const addZoneMarkers = (
    specialLocation: specialLocation,
    mapRef: RefObject<MapRef | null>,
    handleMarkerClick: ((gateInfo: gatesInfoFull | undefined) => void) | undefined,
) => {
    specialLocation.gatesInfo.forEach(gateInfo => {
        const coordinate = {
            latitude: gateInfo.point.lat,
            longitude: gateInfo.point.lon,
        };
        mapRef.current?.addMarker({
            id: gateInfo.id,
            children: undefined,
            anchor: { x: 0.5, y: 0.5 },
            coordinate,
            style: { width: 30, height: 30 },
            iconType: 'specialZone',
            zIndex: undefined,
            rotateEnabled: undefined,
            rotation: undefined,
            title: undefined,
            onClick: () => {
                if (handleMarkerClick) {
                    handleMarkerClick(gateInfo);
                }
            },
            showEditIcon: true,
            vehicleVariant: undefined,
            multimodalVariant: undefined,
            markerOnPress: undefined,
        });
    });
};

export const markNearestGates = (
    specialLocation: specialLocation,
    lat: number,
    lng: number,
    _mapRef: RefObject<MapRef | null>,
): nearestGateType => {
    return specialLocation.gatesInfo.reduce<nearestGateType>((currentNearest, gateInfo) => {
        const distance = haversineDistance(lat, lng, gateInfo.point.lat, gateInfo.point.lon);
        return !currentNearest || distance < currentNearest.gateDistance
            ? { gateInfo, gateDistance: distance }
            : currentNearest;
    }, undefined);
};

export const addSpecialZone = (
    specialLocation: specialLocation,
    mapRef: RefObject<MapRef | null>,
    fillColor: string,
    setCurrZoom: (zoom: number) => void,
) => {
    const gatesId = specialLocation.gatesInfo.map(gate => gate.id);

    mapRef.current?.addZone({
        zoneId: 'defaultZone',
        markersIds: gatesId,
        polygonId: specialLocation.id,
    });

    const coords = mapSpecialLocationCoords(specialLocation.geoJson.coordinates);

    mapRef.current?.addPolygon({
        id: specialLocation.id,
        coordinates: coords,
        strokeWidth: 2,
        visible: true,
        strokeColor: '#14A255',
        fillColor: fillColor,
        lineDashPattern: [1],
        tappable: false,
        onPress: () => {},
    });

    calculateDynamicZoomLevel(coords, setCurrZoom);
};

const addSpecialPickupZone = (
    specialLocation: specialLocation,
    nearestGate: nearestGateType,
    mapRef: RefObject<MapRef | null>,
    setSelectedGateId: (gateId: string | undefined) => void,
    selectedGateId: string | undefined,
    bottomSheetTopBannerRef: React.MutableRefObject<boolean>,
) => {
    const selectedGate = nearestGate ? nearestGate.gateInfo.id : '';
    specialLocation.gatesInfo.map((gateInfo, index) => {
        if (gateInfo.geoJson !== undefined) {
            const specialLocCoord = mapSpecialLocationCoords(gateInfo.geoJson.coordinates);
            if (specialLocCoord.length > 0) {
                mapRef.current?.addZone({
                    zoneId: `specialPickupZone-${index}`,
                    markersIds: [],
                    polygonId: gateInfo.id,
                });
                mapRef.current?.addPolygon({
                    id: gateInfo.id,
                    coordinates: specialLocCoord,
                    strokeWidth: 2,
                    visible: true,
                    strokeColor:
                        gateInfo.id ===
                        (mapRef.current?.currentRegion.current.isGesture ? selectedGate : (selectedGateId ?? ''))
                            ? '#F78118'
                            : '#F7811829',
                    fillColor: '#F7811829',
                    lineDashPattern:
                        gateInfo.id ===
                        (mapRef.current?.currentRegion.current.isGesture ? selectedGate : (selectedGateId ?? ''))
                            ? [1.0]
                            : [20.0, 10.0],
                    tappable: false,
                    onPress: () => {
                        setSelectedGateId(gateInfo.id);
                    },
                });
                bottomSheetTopBannerRef.current = true; // to show the bottom sheet top banner for special pickup zone
            }
        }
    });
};

export const addEditPickupCircle = (
    lat: number,
    lng: number,
    mapRef: RefObject<MapRef | null>,
    radius: number,
    id: string,
    strokeWidth: number,
    strokeColor: string,
    fillColor: string,
) => {
    mapRef.current?.addCircle({
        id,
        center: { latitude: lat, longitude: lng },
        radius,
        strokeWidth,
        strokeColor,
        fillColor,
        visible: undefined,
    });
};

export const handleSpecialLocationOnMap = (
    specialLocation: specialLocation,
    lat: number,
    lng: number,
    mapRef: RefObject<MapRef | null>,
    setSelectedGateId: (gateId: string | undefined) => void,
    selectedGateId: string | undefined,
    setFlag: (flag: boolean | ((prev: boolean) => boolean)) => void,
    bottomSheetTopBannerRef: React.MutableRefObject<boolean>,
    enableAutoMappingToNearestGate: boolean,
    handleMarkerClick: ((gateInfo: gatesInfoFull | undefined) => void) | undefined,
    setCurrZoom: (zoom: number) => void,
) => {
    addZoneMarkers(specialLocation, mapRef, handleMarkerClick);
    const nearestGate = markNearestGates(specialLocation, lat, lng, mapRef);

    // Build zone with gates and polygons
    const fillColor = specialLocation.locationType === 'Closed' ? '#88E5B24D' : '#88E5B233';
    addSpecialZone(specialLocation, mapRef, fillColor, setCurrZoom);
    addSpecialPickupZone(
        specialLocation,
        nearestGate,
        mapRef,
        setSelectedGateId,
        selectedGateId,
        bottomSheetTopBannerRef,
    );
    // map automatically to nearest gate
    if (enableAutoMappingToNearestGate) {
        if (nearestGate) {
            setSelectedGateId(nearestGate.gateInfo.id);
        }
        setFlag(prev => !prev); // Force re-render, @TODO: Remove once we have proper re-rendering
    }
};

export const isLocValidCustomLocation = (specialLocation: specialLocation | undefined, lat: number, lng: number) => {
    // if the location on map inside the special zone is atleast THRESHOLD_FOR_CUSTOM_GATEm away from all the gates in the special zone then it is considered as valid.
    return (
        specialLocation?.gatesInfo.every(gateInfo => {
            const distance = haversineDistance(lat, lng, gateInfo.point.lat, gateInfo.point.lon);
            return distance >= THRESHOLD_FOR_CUSTOM_GATE / 1000;
        }) ?? true
    ); // Default to valid if no special location which was being done in original code
};

export const calculateDynamicZoomLevel = (coordinates: LatLng[], setZoom: (z: number) => void): void => {
    // Return early if there are no coordinates
    if (coordinates.length === 0) return;

    // Extract latitude and longitude from coordinates
    const lats = coordinates.map(c => c.latitude);
    const lngs = coordinates.map(c => c.longitude);

    // Calculate the minimum and maximum latitude and longitude
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate the average latitude for further calculations
    const avgLat = (minLat + maxLat) / 2;
    const metersPerLat = 111_320; // Meters per degree of latitude
    const metersPerLng = 111_320 * Math.cos((avgLat * Math.PI) / 180); // Meters per degree of longitude

    // Calculate the height and width of the bounding box in meters
    const height = (maxLat - minLat) * metersPerLat;
    const width = (maxLng - minLng) * metersPerLng;

    // Determine the maximum dimension and aspect ratio
    const maxDim = Math.max(width, height);
    const aspectRatio = width > height ? width / height : height / width;

    // Define breakpoints for zoom levels
    const breakpoints: ReadonlyArray<{ max: number; zoom: number }> = [
        { max: 200, zoom: 19 },
        { max: 400, zoom: 18 },
        { max: 800, zoom: 17 },
        { max: 1600, zoom: 16 },
        { max: 3200, zoom: 15 },
    ];

    // Find the base zoom level based on the maximum dimension
    const baseZoom = breakpoints.find(b => maxDim < b.max)?.zoom ?? 14;

    // Adjust zoom level for "skinny" aspect ratios
    const SKINNY_RATIO = 2;
    const adjustedZoom = aspectRatio > SKINNY_RATIO ? Math.max(0, baseZoom - 1) : baseZoom;

    // Set the final zoom level, clamped between 0 and 20
    setZoom(Math.min(20, Math.max(0, adjustedZoom)));
};

export const filterAndSortHotspots = (
    hotspots: Array<hotSpotInfo>,
    currentLat: number,
    currentLng: number,
): Array<HotspotWithDistance> => {
    if (!hotspots?.length) return [];

    const nearbyHotspots = hotspots.reduce<HotspotWithDistance[]>((acc, hotspot) => {
        const { centroidLatLong } = hotspot;

        if (!centroidLatLong?.lat || !centroidLatLong?.lon) return acc;

        const distance = haversineDistance(currentLat, currentLng, centroidLatLong.lat, centroidLatLong.lon) * 1000;

        if (distance <= HOTSPOT_MAX_RADIUS) {
            return [...acc, { hotspot, distance }];
        }

        return acc;
    }, []);

    return [...nearbyHotspots].sort((a, b) => a.distance - b.distance).slice(0, HOTSPOT_DISPLAY_LIMIT);
};

export const handleHotspotLocationsOnMap = (
    hotspots: Array<hotSpotInfo>,
    currentLat: number,
    currentLng: number,
    mapRef: RefObject<MapRef | null>,
    handleHotspotMarkerClick: ((hotspot: hotSpotInfo) => void) | undefined,
) => {
    mapRef.current?.removeAllMarkers();

    const nearbyHotspots = filterAndSortHotspots(hotspots, currentLat, currentLng);

    nearbyHotspots.forEach(({ hotspot }) => {
        if (!hotspot.centroidLatLong?.lat || !hotspot.centroidLatLong?.lon) return;

        mapRef.current?.addMarker({
            id: `${hotspot.geoHash}`,
            coordinate: {
                latitude: hotspot.centroidLatLong.lat,
                longitude: hotspot.centroidLatLong.lon,
            },
            anchor: { x: 0.5, y: 0.5 },
            style: { width: 30, height: 30 },
            iconType: 'specialZone',
            zIndex: 1,
            onClick: () => {
                if (handleHotspotMarkerClick) {
                    handleHotspotMarkerClick(hotspot);
                }
            },
            showEditIcon: false,
            vehicleVariant: undefined,
            children: undefined,
            rotateEnabled: undefined,
            rotation: undefined,
            title: undefined,
            multimodalVariant: undefined,
            markerOnPress: undefined,
        });
    });

    if (nearbyHotspots.length > 0) {
        const nearestHotspotWithDistance = nearbyHotspots[0];

        if (nearestHotspotWithDistance) {
            const { hotspot, distance } = nearestHotspotWithDistance;

            if (
                hotspot &&
                hotspot.centroidLatLong?.lat &&
                hotspot.centroidLatLong?.lon &&
                distance <= HOTSPOT_AUTO_SNAP_DISTANCE
            ) {
                mapRef.current?.animateCamera({
                    lat: hotspot.centroidLatLong.lat,
                    lon: hotspot.centroidLatLong.lon,
                    zoom: DEFAULT_CAMERA_ZOOM,
                    duration: 0,
                });
            }
        }
    }
};
