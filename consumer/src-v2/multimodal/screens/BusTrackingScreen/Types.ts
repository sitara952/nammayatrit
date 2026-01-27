import React from 'react';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { Action } from '@/typescript/utils/common';
import BottomSheet, { BottomSheetFlatListMethods, BottomSheetModal } from '@gorhom/bottom-sheet';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';
import { EnhancedStopMapping } from '../SingleModeTicketBooking/Types';
import { vehicleTrackingInfo } from '@/readOnly/api/types/VehicleTrackingInfo.gen';

export type BusTrackingAction =
    | Action<'GO_BACK' | 'RECENTER' | 'BOOK_TICKET'>
    | Action<'SHOW_SWITCH_BUS_ROUTE_MODAL', { routeIndex: number }>
    | Action<'VIEW_DETAILS', { show: boolean }>;

// Define the getWaypointsForSegment function type
export type GetWaypointsForSegmentFn = (
    startStopCode: string,
    endStopCode: string,
) => Array<{ latitude: number; longitude: number }>;

export type BusEtaInfo = {
    vehicleId: string;
    stopName: string;
    etaSeconds: number;
    estimatedTravelTime: string;
};

export type BusConfirmInfo = {
    busNumber: string;
    routeCode: string;
    stopsAway: number | undefined;
    etaMins: number;
    selectedIndex: number;
};

export type GoogleMapsButtonProps = {
    userLocation: { lat: number; lon: number } | undefined;
    nearestBusStop: { lat: number; lon: number } | undefined;
};

export type BusTrackingScreenProps = {
    onBackPress: () => void;
    currentSelectedRoute: availableRoute | undefined;
    sourceStopCode: string | undefined;
    vehicleType: VehicleCategory_vehicleCategory | undefined;
    allBusesEtaInfo: BusEtaInfo[] | undefined;
    routeShortName: string | undefined;
    destinationTime: string | undefined;
    vehiclePositions: Record<string, Record<string, number>> | { vehicleTrackingInfo: vehicleTrackingInfo[] };
    mpDispatch: (action: BusTrackingAction) => void;
    bottomSheetFlatListRef: React.RefObject<BottomSheetFlatListMethods | null>;
    fromJourneyInfoScreen: boolean;
    minUpcomingStops: number | undefined;
    destinationStopName: string | undefined;
    closestBusStopName: string | undefined;
    noOfStops: number | undefined;
    availableRoutes: availableRoute[] | undefined;
    routeStops: EnhancedStopMapping[] | undefined;
    detailedTrackingModalRef: React.RefObject<BottomSheetModal | null>;
    mainSheetRef: React.RefObject<BottomSheet | null>;
    confirmModalRef: React.RefObject<BottomSheetModal | null>;
    busConfirmInfo: BusConfirmInfo | null;
    setBusConfirmInfo: React.Dispatch<React.SetStateAction<BusConfirmInfo | null>>;
    isDetailedTrackingOpen: boolean;
    setIsDetailedTrackingOpen: React.Dispatch<React.SetStateAction<boolean>>;
    showBusConfirmPopup: boolean;
    setShowBusConfirmPopup: (show: boolean) => void;
    setCurrentSelectedRoute: (busNumber: string) => void;
    googleMapsButtonProps: GoogleMapsButtonProps | undefined;
    isPreBooking: boolean;
    appName: string;
    fromSingleModeSearch: boolean | undefined;
};

export type BusTrackingRouteProps = {
    routeCode: string | undefined;
    vehicleType: VehicleCategory_vehicleCategory;
    fromJourneyInfoScreen: boolean;
    fromSingleModeSearch: boolean | undefined;
    sourceStop: transportStation | undefined;
    destinationStop: transportStation | undefined;
    onBusRouteSwitch: ((routeInfo: availableRoute, legOrder?: number) => Promise<unknown>) | undefined;
    journeyId: string | undefined;
    legOrder: number | undefined;
};

export interface SegmentedWaypoints {
    [key: string]: {
        startStopCode: string;
        endStopCode: string;
        waypoints: Array<{ latitude: number; longitude: number }>;
        startStopWaypointIndex: number;
        endStopWaypointIndex: number;
        distanceToNextStop: number;
    };
}

export interface StopWithSnappedPoint {
    stop: {
        id: string;
        name: string;
        coordinate: {
            latitude: number;
            longitude: number;
        };
    };
    snappedPoint: {
        latitude: number;
        longitude: number;
    };
    waypointIndex: number;
}

export interface SnappedVehicle {
    coordinate: {
        latitude: number;
        longitude: number;
    };
    timestamp: number;
    id: string;
    routeState: string | undefined;
}
