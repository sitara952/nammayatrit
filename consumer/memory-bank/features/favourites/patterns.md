# Favourites: System Patterns

This document outlines system patterns related to managing user's favourite locations, primarily based on `src-v2/multimodal/screens/Favourites/Flow/AddFavourite.tsx` and `ManageFavourite.tsx`.

## Overview

The Favourites feature allows users to save, name/tag, and manage frequently used locations (e.g., Home, Work, other custom places) for quicker access during ride booking or other location-dependent actions.

## Adding a Favourite Location (`AddFavourite.tsx` Flow)

This flow guides the user through selecting and saving a new favourite location. It typically involves multiple UI states managed by `addFavouriteState` local state:

1.  **Search State (`addFavouriteState: 'search'`):**
    *   User inputs a search query for the location.
    *   `useAutocomplete` custom hook fetches location predictions (likely using a geocoding/places API). `searchText` is managed by this hook.
    *   Search results are displayed.
    *   Upon selecting a result, an `ON_LOCATION_SELECTED` action is dispatched. The `locationByPlaceId` function (from `useAutocomplete`) is called to get full details of the selected place, which updates the `selectedLocation` local state. The UI then transitions.
2.  **Confirm Location State (`addFavouriteState: 'confirm-location'`):**
    *   The `selectedLocation` is displayed, often on a map for precise pin adjustment (this part is handled by `AddFavouriteUI.tsx` which likely uses a map component).
    *   User confirms the pinned location. The UI transitions to tag/name input.
3.  **Choose Tag/Name State (`addFavouriteState: 'choose-tag'`):**
    *   The user can assign a predefined tag (e.g., "Home", "Work" - if not already used) or enter a custom name for the favourite.
    *   `existingTags` (derived from `useSavedLocations` hook) are checked to prevent duplicates for predefined tags or guide naming.
    *   The `ChooseNameScreen` component (from `../components/`) is likely used here.
4.  **Saving the Favourite (`SAVE_FAVOURITE` action):**
    *   Once the location is confirmed and tagged/named, this action is dispatched.
    *   The `saveLocation` function from the `useSavedLocations` custom hook is called with the location details (coordinates, address components, place ID) and the chosen tag/name.
    *   This hook handles the actual persistence of the favourite location (e.g., to AsyncStorage, or a backend API).
    *   On success, a toast message (`FavouritesToastMessages`) is shown via Redux (`setToastProps`), and the screen navigates back.
5.  **Navigation & Back Handling:**
    *   The `GO_BACK` action allows users to step back through the add favourite states or exit the screen.

## Managing Favourite Locations (`ManageFavourite.tsx` Flow)

This flow allows users to view, edit, delete, and initiate adding new favourite locations.

1.  **Displaying Saved Favourites:**
    *   `useSavedLocations` hook provides the raw `savedLocations` list.
    *   A `useMemo` hook transforms this raw list into `favouriteLocations` (array of `FavouriteLocation` type) suitable for the UI. This transformation involves:
        *   Using a local `tranformLocation` utility to convert `savedReqLocationAPIEntity` to the `location` type (from `LocationTypes.gen.tsx`). This includes formatting address and title using `getPlaceAddress` and `getPlaceArea`.
        *   Normalizing tags (e.g., "home" to "Home", "work" to "Work").
    *   `ManageFavouriteUI.tsx` receives `favouriteLocations` and renders them, likely in a list.
    *   `existingTags` are also derived from `favouriteLocations` for validation purposes in edit/add flows.
2.  **Editing a Favourite (`UPDATE_FAVOURITE` action):**
    *   When a user initiates an edit for a favourite (likely by selecting it from the list and an edit option):
        *   An `editFavouriteModalRef` (BottomSheetModal from `@gorhom/bottom-sheet`) is presented. This modal likely contains the `ChooseNameScreen` component to allow changing the tag/name and potentially the location itself (though changing location might redirect to the add flow).
        *   Upon submitting changes, the `UPDATE_FAVOURITE` action is dispatched.
        *   The handler performs an **update as a delete + add operation**:
            *   Calls `deleteLocation` (from `useSavedLocations`) with the `oldTag` (or old location name) of the favourite being edited.
            *   Calls `saveLocation` (from `useSavedLocations`) with the new details (new location data, new tag/name).
        *   A success toast (`FavouritesToastMessages`) is displayed via Redux (`setToastProps`).
        *   The edit modal is dismissed.
3.  **Deleting a Favourite (`DELETE_FAVOURITE` action):**
    *   When a user confirms deletion of a favourite:
        *   The `deleteLocation` function (from `useSavedLocations`) is called with the tag/name of the favourite.
        *   A success/delete toast is displayed.
        *   The edit/confirmation modal is dismissed.
4.  **Adding New Favourites from Manage Screen (`ENTER_FAVOURITE` action):**
    *   The UI provides an option to add new favourites.
    *   This action navigates to the `addFavourite` screen, potentially passing an `intendedTag` (e.g., 'Home', 'Work', or undefined for 'Favourite') as a route parameter to pre-select the tag type in the add flow.
5.  **Navigation & UI Control:**
    *   Uses `useNavigation` for screen transitions.
    *   `mcDispatch` (created via `createDispatcher`) handles actions from the UI.

## Reusable Favourites Component (`src-v2/components/FavouritesComponent/`)

*   A `FavouritesComponentFlow` and `FavouritesComponentUI` exist, suggesting a reusable component for displaying a list of favourite locations.
*   This component is used on the Home Screen (`src/typescript/screens/home/homeComponents/Favourites/Favourites.tsx`).
*   It takes an `onFavouriteItemPress` callback to handle actions when a favourite is tapped.

## Key Technical Decisions / Patterns

*   **Custom Hooks for Core Logic:**
    *   `useAutocomplete`: Encapsulates location search and place detail fetching for adding favourites.
    *   `useSavedLocations`: Encapsulates CRUD operations for saved favourite locations, abstracting the persistence layer.
*   **Local State for UI Flow:** The `addFavouriteState` in `AddFavourite.tsx` controls the multi-step UI.
*   **Redux for Global Concerns:** Used for `currentLocationCoords` (biasing search) and for displaying global toast notifications.
*   **BottomSheetModals:** Used for presenting editing/confirmation UIs (e.g., `editFavouriteModalRef`, `addFavouriteModalRef`).
*   **Data Transformation:** Utilities like `transformSavedList` and `assignTag` (in `FavouritesComponent/utils`) prepare favourite data for display.

This feature relies on a combination of local screen flow management, dedicated custom hooks for business logic and data persistence, and standard UI components for presentation.
