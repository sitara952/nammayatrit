import { Action, Resolver } from '@/typescript/utils/common';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LocationSearchOptions } from '@/typescript/hooks/useLocationPredictions';

export type AddFavouritesAction =
    | Action<'GO_BACK'>
    | Action<'SAVE_FAVOURITE', { location: location; tag: TagType; locationName: string | undefined }>
    | Action<'SET_SEARCH_TEXT', string>
    | Action<'EDIT_FAVOURITE', string>;

export type ManageFavouritesAction =
    | Action<'GO_BACK'>
    | Action<'ENTER_FAVOURITE', EnterFavouritePayload>
    | Action<'DELETE_FAVOURITE', string>
    | Action<
          'UPDATE_FAVOURITE',
          { oldTag: string | undefined; location: location; newTag: TagType; newLocationName: string | undefined }
      >
    | Action<'SET_ACTIVE_TAB', 'Drivers' | 'Location'>;

export type LocationFavouriteProps = {
    lfDispatch: Resolver<LocationFavouriteAction>;
} & ManageFavouritesProps;

export type LocationFavouriteAction =
    | Action<'DISMISS_EDIT_MODAL', void>
    | Action<'SWIPEABLE_DELETE', { favourite: FavouriteLocation; index: number }>
    | Action<'SWIPEABLE_EDIT', { favourite: FavouriteLocation; index: number }>
    | Action<'LIST_ITEM_PRESS', FavouriteLocation>
    | Action<'CONFIRM_EDIT', { location: location; tag: TagType; favouriteName: string | undefined }>
    | Action<'CHANGE_LOCATION', { intendedTag: TagType | undefined }>
    | Action<'DELETE_FROM_EDIT_MODAL', void>
    | Action<'CONFIRM_DELETE', void>
    | Action<'CANCEL_DELETE', void>;

export type EnterFavouritePayload = {
    intendedTag: TagType | undefined;
};

export type AddFavouritesState = 'search' | 'confirm-location' | 'choose-tag';

export type ManageFavouritesProps = {
    mcDispatch: Resolver<ManageFavouritesAction>;
    existingTags: string[];
    editFavouriteModalRef: React.RefObject<BottomSheetModal | null>;
    locationDeleteModalRef: React.RefObject<BottomSheetModal | null>;
    driversDeleteModalRef: React.RefObject<BottomSheetModal | null>;
    favouriteLocations: FavouriteLocation[];
    activeTab: 'Drivers' | 'Location';
};

export type AddFavouritesProps = {
    mcDispatch: Resolver<AddFavouritesAction>;
    searchText: string;
    searchData: location[];
    selectedLocation: location | undefined;
    setSelectedLocation: (location: location) => void;
    locationSearchStatus: LocationSearchOptions;
    existingTags: string[];
    addFavouriteState: AddFavouritesState;
    currentLocation: location | null;
    setAddFavouriteState: (state: AddFavouritesState | ((prev: AddFavouritesState) => AddFavouritesState)) => void;
};

export type TagType = 'Home' | 'Work' | 'Favourite';

export type FavouriteLocation = {
    id: number;
    locationAddress: location;
    tag: TagType;
    locationName: string;
};
