import { latLong } from '@/api/apiTypes/GetPlaceNameApi.gen';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { availableRoutesByTier } from '@/readOnly/api/types/AvailableRoutesByTier.gen';
import {
    MultimodalTravelMode_multimodalTravelMode,
    MultimodalWarning_multimodalWarning,
    VehicleCategory_vehicleCategory,
} from '@/readOnly/api/types/Enums.gen';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { journeyConfirmReqElement } from '@/readOnly/api/types/JourneyConfirmReqElement.gen';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { legServiceTierOptionsResp } from '@/readOnly/api/types/LegServiceTierOptionsResp.gen';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { PricingItemType } from '@/typescript/state/client/search';
import { Action, Resolver } from '@/typescript/utils/common';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TransitSummaryType } from './components/TransitSummary';
import { transportRoute, transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { RouteOptionCardProps } from './components/RouteOptionCard';
import { availableRoutesInfo } from '@/readOnly/api/types/AvailableRoutesInfo.gen';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';
import { LegCategorySelections } from '../../components/JourneyPayment/Types';

export type JourneyDetailScreenAction =
    | Action<'POLL_FOR_FARE'>
    | Action<'START_JOURNEY'>
    | Action<'SWITCH_MODE', { legOrder: number; newMode: MultimodalTravelMode_multimodalTravelMode }>
    | Action<'SHOW_RIDE_OPTIONS', { legOrder: number }>
    | Action<'CHANGE_VEHICLE', { legOrder: number | undefined }>
    | Action<'CHANGE_TRANSIT_CLASS'>
    | Action<'GO_BACK'>
    | Action<'REMOVE_CHANGE_VEHICLE'>
    | Action<'CONFIRM_CHANGE_VEHICLE', { legOrder: number | undefined }>
    | Action<'MORE_OPTIONS'>
    | Action<'RECENTER_MAP'>
    | Action<'SKIP_RIDE', { legOrder: number }>
    | Action<'SHOW_VEHICLE_TIER_OPTIONS', { legOrder: number }>
    | Action<'SELECT_VEHICLE_TIER', { legTier: availableRoutesByTier }>
    | Action<'SELECT_AND_CHANGE_VEHICLE_TIER', { legOrder: number | null; quoteId: string | undefined }>
    | Action<'SELECT_ALTERNATE_JOURNEY_LEG', { legOrder: number | null; newJourneyLegId: string | undefined }>
    | Action<'SHOW_VIA_POINTS_MODAL', { legOrder: number }>
    | Action<'SHOW_AUTO_INFO_POPUP'>
    | Action<'GO_BACK_TO_SEARCH'>
    | Action<'SWITCH_BUS_ROUTE', { routeInfo: availableRoute }>
    | Action<'SHOW_SWITCH_BUS_ROUTE_MODAL', { legOrder: number }>
    | Action<'DISMISS_SWITCH_BUS_ROUTE_MODAL'>
    | Action<'CONFIRM_BUS_CHANGE', { routeInfo: availableRoute }>;

export type JourneyDetailScreenProps = {
    mpDispatch: Resolver<JourneyDetailScreenAction>;
    journeyInfo: journeyInfoResp | null;
    destination: location | null;
    source: location | null;
    currentLocation: location | null;
    confirmEnable: boolean;
    popUpType: PopUpType | null;
    selectedPricingItem: PricingItemType[] | null;
    selectedMultimodalLeg: legInfo | undefined;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    loadingDataForLeg: number | null;
    skippedLegOrders: Record<number, boolean>;
    isSingleMode: boolean;
    legCount: number;
    isConfirmingJourney: boolean;
    fetchingLegsFare: boolean;
    isChangingVehicleClass: boolean;
    otherVehicleOptions: availableRoutesInfo[] | undefined;
    vehicleTierOptionsResp: legServiceTierOptionsResp | undefined;
    selectedVehicleTier: availableRoutesByTier | undefined;
    isLoadingVehicleOptions: boolean;
    isFetchingVehicleTierOptions: boolean;
    vehicleLegToSwitch: number | null;
    showMultimodalWarning: boolean | undefined;
    getRouteByCode: (code: string) => transportRoute | undefined;
    multimodalWarning: MultimodalWarning_multimodalWarning | undefined;
    actualVehicleType: VehicleCategory_vehicleCategory | undefined;
    journeySegments: TransitSummaryType[];
    appName: string;
    journeyMapData: Record<number, mmEstimateRouteType | mmEstimateRouteType[]>;
    isMultimodalWarningVisible: boolean;
    setMultimodalWarningVisible: React.Dispatch<React.SetStateAction<boolean>>;
    switchModeLoading: boolean;
    onViewTimetable: (mode: VehicleCategory_vehicleCategory | undefined) => void;
    nextTwoArrivalTimes: Record<number, number[]> | undefined;
    firstArrivalTime: Record<number, string | undefined>;
    timeTableData: Record<number, NewTimeTableUIProps> | undefined;
    transformedRouteOptions: RouteOptionCardProps[] | undefined;
    transformViaPointName: (via: string | undefined) => string | undefined;
    // similarJourneyLegsResp: similarJourneyLegsResp | undefined;
    isFetchingSimilarJourneyLegs: boolean;
    legForViaChange: number | null;
    timeSavedByMultimodal: number | undefined;
    totalFare: number;
    legCategorySelections: LegCategorySelections | undefined;
    switchToAuto: (legOrder: number) => void;
    handleOnConfirmRoute: (
        legOrder: number | undefined,
        sourceCode: string | undefined,
        destinationCode: string | undefined,
    ) => void;
    serviceableStartTime: string | undefined;
    busTrackingRouteInfo: availableRoute | undefined;
    availableRoutes: availableRoute[] | undefined;
    sourceInfo: transportStation | undefined;
    legRideOptionsPopup: number | null;
    isTicketModalOpen: boolean | undefined;
    isSwitchPopupOpen: boolean | undefined;
    setIsSwitchPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    hasPublicTransport: boolean | undefined;
    handleConfirmBusChange: ((routeInfo: availableRoute, legOrder?: number) => Promise<unknown>) | undefined;
};

export type LegEstimate = {
    price: number | null;
    isPolling: boolean;
};

export type LegDetails = Record<string, LegEstimate>;

export enum PopUpType {
    RideOptionsPopUp,
    ChooseRidePopUp,
}

export type frfsRouteResp = {
    wayPoints: latLong[] | undefined;
    stops: fRFSStationAPI[] | undefined;
};

export type journeyConfirmReqElementWithTravelMode = journeyConfirmReqElement & {
    travelMode: MultimodalTravelMode_multimodalTravelMode;
};
