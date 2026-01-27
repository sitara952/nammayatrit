import { Action, Resolver } from '@/typescript/utils/common';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { RepeatBookingListItem } from '../SingleModeSearch/Types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { strings } from 'config-types';
import { RefObject } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { StationType } from './components/DestinationPickerWithSections';
export type MetroSubwayBookingAction =
    | Action<'GO_BACK'>
    | Action<'GO_BACK_TO_SEARCH'>
    | Action<'CONFIRM_SELECTION'>
    | Action<'SEARCH'>
    | Action<'SEARCH_DESTINATION'>
    | Action<'UPDATE_SOURCE', { station: transportStation }>
    | Action<'TOGGLE_ROUTE'>
    | Action<'UPDATE_DESTINATION', { station: transportStation }>
    | Action<'SINGLE_MODE_REPEAT_TICKET', { sourceStopCode: string; destStopCode: string }>;

export type MetroSubwayBookingProps = {
    mpDispatch: Resolver<MetroSubwayBookingAction>;
    sourceStation: transportStation | undefined;
    destinationStation: transportStation | undefined;
    sortedStationsForSourcePicker: transportStation[];
    sortedStationsForDestinationPicker: {
        title: string;
        stations: transportStation[];
        index: number;
        toggableIndex: number;
        routeCode: string | undefined;
        type: StationType;
    }[];
    repeatBookings: RepeatBookingListItem[] | undefined;
    isRepeatBookingsLoading: boolean;
    vehicleType: VehicleCategory_vehicleCategory;
    distanceToSourceStation: number | undefined;
    onTicketButtonPress: () => void;
    isDataLoaded: boolean;
    serviceableStartTime: string | undefined;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    userLanguageStrings: strings;
    serviceUnavailableModalRef: RefObject<BottomSheetModal | null>;
};

export type MetroSubwayBookingRouteProps = {
    vehicleType: VehicleCategory_vehicleCategory;
    station: undefined | transportStation;
    triggerEditDestination: boolean | undefined;
};
