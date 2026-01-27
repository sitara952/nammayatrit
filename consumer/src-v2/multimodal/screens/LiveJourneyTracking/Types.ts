import { latLng } from '@/helpers/externalModules/GMap/ReactMap.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { latLong } from '@/readOnly/api/types/LatLong.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { markerData, polylineData } from '@/typescript/Maps/MapType';
import { Action } from '@/typescript/utils/common';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { vehiclePosition } from '@/readOnly/api/types/VehiclePosition.gen';

export type MultiModalRideScreenAction =
    // poll api for status
    | Action<'GET_JOURNEY_STATUS'>
    | Action<'JUMP_TO_CURRENT_LEG'>
    | Action<'GET_DIRECTION', { legOrder: number }>
    | Action<'SWITCH_MODE', { newMode: MultimodalTravelMode_multimodalTravelMode; legOrder: number | null }>
    | Action<'NEXT_LEG'>
    | Action<'TOGGLE_STOPS_LIST', { legOrder: number; subLegOrder: number }>
    | Action<'REMOVE_COMPLETED_LEG_POPUP', { taxiLegFeedBack: boolean | null }>
    | Action<'TOGGLE_JOURNEY_OPTIONS', { show: boolean }>
    | Action<'REPORT_ISSUE'>
    | Action<'RATE_RIDE', { legOrder: number }>
    | Action<'BOOK_NEXT_LEG', { legOrder: number | null }>
    | Action<'SHARE_RIDE'>
    | Action<'CANCEL_ENTIRE_JOURNEY'>
    | Action<'CHANGE_VEHICLE'>
    | Action<'TOGGLE_RIDE_OPTIONS_POPUP', { legOrder: number | null }>
    | Action<'CONFIRM_CHANGE_VEHICLE', { legOrder: number }>
    | Action<'EDIT_LOCATION', { editType: EditLocationType }>
    | Action<'SKIP_LEG'>
    | Action<'SHOW_RIDE_OPTIONS_CONFIRMATION_POPUP', { popupType: RideOptionsConfirmationPopup | null }>
    | Action<'DISMISS_RIDE_OPTIONS_CONFIRMATION_POPUP'>
    | Action<'UPDATE_RIDE_OPTIONS_POPUP', { popupType: RideOptionPopupType }>
    | Action<'EXTEND_LEG'>
    | Action<'PRESSED_DROP_DOWN_BETWEEN_STATION'>
    | Action<'BOOK_SKIPPED_TAXI', { legOrder: number }>
    | Action<'REMOVE_CHANGE_VEHICLE'>
    | Action<'VIEW_TICKET'>
    | Action<'REMOVE_VIEW_TICKET'>
    | Action<'TOGGLE_CHAT_MODAL'>
    | Action<'RECENTER_MAP'>
    | Action<'GO_TO_AUTO_BOOKING'>;

export type NextStopType = {
    order: number;
    subLegOrder: number;
    nextStopCode: string | undefined;
};

export type StopsAwayFromIndexType = {
    order: number;
    subLegOrder: number;
    numberOfStopsAways: number | undefined;
};

export enum EditLocationType {
    EDIT_PICKUP,
    EDIT_DESTINATION,
}

export enum RideOptionsConfirmationPopup {
    EDIT_DROP,
    CONFIRM_SKIP_LEG,
    CANCEL_JOURNEY,
}

export enum RideOptionPopupType {
    CancelRide,
    EditLocation,
    RideOptions,
    ChatModal,
}
export type TransitLiveSplitProps = {
    stops: (string | undefined)[] | undefined;
    isPressedDropDownBetweenStation: boolean;
    handleDropDown: () => void;
    liveLeg: legInfo | undefined;
    nextStopIndex: number | undefined; // use this to handle the tracking animation
};
export type VehicleStatus = 'PICKUP' | 'START_LEG';

export type MultimodalMarkerData = markerData & {
    isTrackingId: boolean | undefined;
};
export type JourneyTrackingData = {
    polyline: polylineData[];
    marker: MultimodalMarkerData[];
    source: latLng | undefined;
    sourceAddress: string | undefined;
    destination: latLng | undefined;
    calloutText: string;
    legData: {
        coordinates: undefined | latLong[];
        LegMode: MultimodalTravelMode_multimodalTravelMode;
        stops: fRFSStationAPI[] | undefined;
    };
    legInfo: legInfo;
    routeId: string;
    trackingPositionLatLng: vehiclePosition[] | undefined | null;
    isTrackingMarker: boolean | undefined;
    removePolyline: boolean | undefined;
    originalVehicleOrder: number | undefined;
    isAddDestMarker: boolean | undefined;
    stage: VehicleStatus;
    removeDataFlag: boolean;
    isPathExtended: boolean;
};
