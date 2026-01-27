import { Action, Resolver } from '@/typescript/utils/common';
import { transportRoute, transportRouteStopMapping } from '@/readOnly/api/types/PublicTransportData.gen';
import { upcomingVehicleInfo } from '@/readOnly/api/types/UpcomingVehicleInfo.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { appName } from 'config-types';
import { NewTimeTableUIProps } from '../NewTimeTable/types';

export type SingleModeTicketBookingAction =
    | Action<'GO_BACK'>
    | Action<'BOOK_TICKET'>
    | Action<'TOGGLE_ROUTE'>
    | Action<'LIVE_OR_GTFS_CLICK'>;

export type EnhancedStopMapping = transportRouteStopMapping & {
    stopName: string | undefined;
    distance: number | null;
    lat: number | undefined;
    lon: number | undefined;
};

// Define types for stop-related information
export type StopInfo = {
    sourceCode: string | undefined;
    destCode: string | undefined;
    setSourceCode: React.Dispatch<React.SetStateAction<string | undefined>>;
    setDestCode: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export type SingleModeTicketBookingProps = {
    mpDispatch: Resolver<SingleModeTicketBookingAction>;
    routeStops: EnhancedStopMapping[] | null;
    mode: VehicleCategory_vehicleCategory;
    route: transportRoute | undefined;
    upcomingBusInfo: upcomingVehicleInfo | null;
    numberOfBuses: number | null;
    isLoadingRouteData: boolean | undefined;
    appName: appName;
    timeTableProps: NewTimeTableUIProps | undefined;
    selectedSourceStopCode: string | undefined;
    enableLiveTracking: boolean | undefined;
} & StopInfo;

export type SingleModeTicketBookingRouteProps = {
    routeCode: string;
    vehicleType: VehicleCategory_vehicleCategory;
    selectedSourceStopCode: string | undefined;
};

export const BUS_SERVICE_TIER_MAPPING = {
    Z: 'A/C',
    XS: 'Small Bus Express',
    OS: 'Small Bus Ordinary',
    S: 'Deluxe',
    X: 'Express',
    O: 'Ordinary',
};

export type BusServiceTier = keyof typeof BUS_SERVICE_TIER_MAPPING;
