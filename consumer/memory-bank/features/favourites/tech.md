# Favourites: Technical Context

This document outlines specific technical details related to the implementation of the Favourites feature, based on `src-v2/multimodal/screens/Favourites/Flow/AddFavourite.tsx` and inferences for managing favourites.

## Core Technologies & Libraries (`AddFavourite.tsx`)

*   **Custom Hooks:**
    *   `useAutocomplete` (from `../hooks/useAutocomplete`):
        *   Manages `searchText` local state.
        *   Provides `searchData` (autocomplete results), `locationByPlaceId` function (to get full details of a selected place), and `locationSearchStatus`.
        *   Likely interacts with a geocoding/places API.
    *   `useSavedLocations` (from `@/typescript/hooks/useSavedLocations`):
        *   Provides `savedLocations` (list of currently saved favourites).
        *   Provides `saveLocation` async function to persist a new favourite. This function takes a `savedReqLocationAPIEntity` like object.
        *   Likely encapsulates logic for storing/retrieving favourites (e.g., via AsyncStorage or a backend API).
*   **State Management:**
    *   **Local State (`useState`):**
        *   `addFavouriteState`: Manages the UI state of the multi-step add favourite flow ('search', 'confirm-location', 'choose-tag').
        *   `selectedLocation`: Stores the location object selected from search results or confirmed on map.
    *   **Redux Toolkit (`useAppSelector`, `useAppDispatch`):**
        *   `selectCurrentLocationCoords`: Used to potentially bias autocomplete search.
        *   `setToastProps`: Used to display success/error messages via a global toast component (`FavouritesToastMessages`).
*   **Navigation (`@react-navigation/native` - `useNavigation`):**
    *   Used for `navigation.goBack()` to exit the screen or return to a previous state in the flow.
*   **UI Components:**
    *   `AddFavouriteUI` (from `../UI/AddFavourite`): The main UI component for this flow.
    *   `FavouritesToastMessages` (from `../components/FavouritesToastMessages`): Custom toast component for displaying messages.
    *   Likely uses `@gorhom/bottom-sheet` for presenting different states of the flow within a bottom sheet, as inferred from `addFavouriteModalRef` in `AddFavouriteUI.tsx`.
*   **Animation (`react-native-reanimated`):**
    *   Used for `FavouritesToastMessages` animations.
*   **Utility Libraries & Functions:**
    *   `createDispatcher` (from `@/typescript/utils/common.ts`): For creating the `mcDispatch` function.
    *   `tailwind` (from `@/src-v2/tailwind-theme/tailwind`): For styling.

## Inferred Technologies for `ManageFavourite.tsx`

Based on the search results and typical patterns:

*   **Custom Hooks:**
    *   `useSavedLocations` (from `@/typescript/hooks/useSavedLocations`): Central for this flow, providing:
        *   `savedLocations`: The list of raw favourite location data.
        *   `saveLocation`: Function to add or update a favourite.
        *   `deleteLocation`: Function to remove a favourite.
*   **State Management (Redux Toolkit - `useAppDispatch`):**
    *   `setToastProps` (from `session` slice): Used to display success/error messages via `FavouritesToastMessages`.
*   **UI Components & Libraries:**
    *   `ManageFavouriteUI` (from `../UI/ManageFavourite`): The main UI component.
    *   `BottomSheetModal` (from `@gorhom/bottom-sheet`): Used for the `editFavouriteModalRef` to present editing options (likely containing `ChooseNameScreen`).
    *   `FavouritesToastMessages` (from `../components/FavouritesToastMessages`): For displaying notifications.
    *   `Animated` from `react-native-reanimated`: Used for toast message animations.
*   **Navigation (`@react-navigation/native` - `useNavigation`, `StackNavigationProp`):**
    *   Used for `navigation.navigate('addFavourite', ...)` and `navigation.goBack()`.
*   **Utility Functions:**
    *   `createDispatcher` (from `@/typescript/utils/common.ts`).
    *   `tranformLocation` (local utility): Converts `savedReqLocationAPIEntity` to `location` type using `getPlaceAddress` and `getPlaceArea` (from `@/typescript/utils/placeUtils.ts`).
    *   `tailwind` (from `@/src-v2/tailwind-theme/tailwind`).

## Persistence Layer (via `useSavedLocations` - Common to Add & Manage)

*   The actual storage mechanism for favourites (AsyncStorage, a local database like SQLite, or a backend API) is abstracted by the `useSavedLocations` hook. The `savedReqLocationAPIEntity` type suggests that if a backend is involved, this is the expected request structure.

## Key API Interactions (if `useSavedLocations` uses a backend)

*   **Create Favourite API:** Called by `saveLocation` when adding a new favourite.
*   **Read Favourites API:** Called by `useSavedLocations` to fetch the list.
*   **Update Favourite API:** Called by `saveLocation` when editing an existing favourite.
*   **Delete Favourite API:** Called by `deleteLocation`.
*   **Location Search/Place Details API:** Used by `useAutocomplete`.

The Favourites feature combines local UI state management for its multi-step flows with a custom hook (`useSavedLocations`) that abstracts the data persistence, and another custom hook (`useAutocomplete`) for location searching.
