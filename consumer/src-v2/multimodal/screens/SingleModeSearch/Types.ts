import { Action, Resolver } from '@/typescript/utils/common';
import { SearchResultItem } from '../Search/components/SearchSectionListItem/types';
import { SearchTarget } from '../../utils/PublicTransportUtils';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { AppConfigType } from '@/src-v2/systems/configs/types';
export type SingleModeSearchAction =
    | Action<'GO_BACK'>
    | Action<'SINGLE_MODE_TICKET_BOOKING', SearchResultItem>
    | Action<'HANDLE_FALLBACK_CASE', { routeCode: string }>
    | Action<'SINGLE_MODE_ROUTE_BOOKING', SearchResultItem>
    | Action<'SINGLE_MODE_REPEAT_TICKET', { routeCode: string; sourceStopCode: string; destStopCode: string }>
    | Action<'SINGLE_MODE_REPEAT_ROUTE', { routeCode: string; sourceStopCode: string; destStopCode: string }>
    | Action<'SET_SELECTED_SOURCE_STOP', string>;

export type SingleModeSearchProps = {
    mpDispatch: Resolver<SingleModeSearchAction>;
    isRepeatBookingsLoading: boolean;
    startStop: transportStation | undefined;
    startStopDistance: number | undefined;
    vehicleType: VehicleCategory_vehicleCategory;
    searchPublicTransport: (searchString: string, searchType: SearchTarget) => void;
    suggestions: SearchResultItem[];
    loadingSuggestions: boolean;
    repeatBookings: RepeatBookingListItem[] | undefined;
    recentSearches: SearchResultItem[] | undefined;
    nearbyRoutes: RouteCard[] | undefined;
    showEditSource: boolean;
    appName: string;
    setShowEditSource: (show: boolean) => void;
    isSrcHasDestinations: boolean;
    onHardwareBackPress: () => void;
    fallbackView: boolean;
    appSystemConfig: AppConfigType;
};

export type RepeatBookingListItem = {
    fromStopName: string | undefined;
    toStopName: string | undefined;
    price: number;
    routeCode: string;
    routeShortName: string | undefined;
    fromStopCode: string;
    toStopCode: string;
};

export type RouteCard = {
    routeText: string;
    busesText: string;
    routeCode: string;
};

export type TransportationTypes = 'Bus' | 'Train' | 'Metro';

export type HomeScreenServices = 'Bus' | 'Train' | 'Metro' | 'Passes';

export type SingleModeSearchRouteProps = {
    bookingType: TransportationTypes;
    sourceStop: (transportStation & { distance: number }) | undefined;
    fallbackView: boolean;
    otp: string | undefined;
};
