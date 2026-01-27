import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export enum LocationType {
    Source = 'source',
    Destination = 'destination',
    Stop = 'stop',
}

export type RentalScreenAction =
    | Action<'HANDLE_BACKPRESS'>
    | Action<'SELECT_SOURCE_LOCATION'>
    | Action<'SELECT_DESTINATION_LOCATION'>
    | Action<'CONTINUE_CLICKED'>
    | Action<'CLOCK_CLICK'>
    | Action<'HANDLE_DATE_CHANGE', { newDate: Date }>;

export type RentalScreenViewProps = {
    source: location | null;
    destination: location | null;
    currentLocation: location | null;
    selectLocationType: LocationType;
    handleInfoClick: () => void;
    onSearchCardClick: (location: location) => Promise<void>;
    locationPlaceHolder: (selectLocationType: LocationType) => string;
    genericSearchBackPress: () => void;
    onLocateOnMapClick: () => void;
    rcsDispatch: Resolver<RentalScreenAction>;
    dateTime: Date | null;
    maxPossibleDate: Date;
    minPossibleDate: Date;
    dateTimePickerBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
    popupOverlappingTime: string;
    destinationLocationsTextInput: string | undefined;
};
