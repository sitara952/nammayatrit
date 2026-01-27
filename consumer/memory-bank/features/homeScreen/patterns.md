# Home Screen: System Patterns

This document outlines system patterns related to the Home Screen, primarily based on `src-v2/screens/HomeScreen/Flow.tsx`. The Home Screen acts as a central hub, orchestrating various UI states and initiating key user flows like ride booking.

## Overview

The `HomeScreen_` flow component manages:
*   The main application state via a persistent Bottom Sheet (`newBookingFlowSheetRef`).
*   Initial fetching and validation of user's current location and serviceability.
*   Display of the map with relevant information (e.g., nearby public transport stations, nearby drivers when idle).
*   Handling of deep links and notifications that might alter the UI state.
*   Transitioning the user into the ride search and booking flow.
*   Personalization aspects like special assistance.

## Core Flow & State Management (`HomeScreen/Flow.tsx`)

1.  **Bottom Sheet Orchestration:**
    *   The primary UI paradigm is a Bottom Sheet whose content changes based on `bottomSheetStage` (from Redux `session` slice). Stages include `Home` (initial view), `Search`, `ChooseRide`, `ConfirmPickup`, `LookingForRides`, etc.
    *   A `useEffect` hook monitors `bottomSheetStage` to:
        *   Adjust map padding dynamically.
        *   Clear map routes when returning to the `Home` stage.
        *   Make accessibility announcements for the current stage.
        *   Manage `greetedUser` state.
        *   Control the snap points or visibility of `newBookingFlowSheetRef`.
2.  **Initial Location & Serviceability:**
    *   `useLocationServices` hook manages GPS status, location permissions, and provides a `recenterLocation` function.
    *   When `currentLocationCoords` (from Redux, updated by `useLocationServices`) are available, a memoized `sourceData` effect triggers:
        *   It calls `GetLocationAndServiceability.getLocationObjectAndServiceability` (ReScript utility) to fetch full details and serviceability for the user's current location.
        *   This updates Redux state: `currentLocation`, `isCurrentLocationServiceable`, `operatingCity`, and `searchedSource` (setting current location as default source).
        *   The `operatingCity` is also persisted to MMKV.
        *   CleverTap profile is updated with `Customer Location`.
        *   **Multimodal City Change:** If `isMultimodal` is true and the `operatingCity` changes, it triggers `refreshData` from `usePublicTransportData` to load new PT stops/stations for the new city, showing a toast during this process.
3.  **Initiating Ride Search (`navigateToSearch`):**
    *   This function is typically called when the user interacts with a "Where to?" or similar input field.
    *   It resets `searchId` in Redux.
    *   Sets `activeInput` to `SearchInput.Destination`.
    *   Sets `bottomSheetStage` to `BottomSheetStage.Search`.
    *   Navigates to `homeTypeScript` (the navigation action itself might just re-render the home screen with the new bottom sheet stage).
4.  **Map Display & Interaction (Home Stage):**
    *   **Nearby Public Transport (Multimodal):**
        *   If `isMultimodal` is true, `usePublicTransportUtils` (`getNearbyStations`) is used to find nearby stations based on `currentLocationCoords`.
        *   These stations are rendered as markers on the map using `mapRef.current?.addMarkersFromArray`.
        *   The user's current location is also shown as a distinct marker.
    *   **Nearby Drivers:**
        *   If `nearbyDriversConfig.enabled` (Redux) and `bottomSheetStage` is `Home`:
            *   A `useEffect` loop periodically calls `useGetNearbyDriversMutation` based on `nearbyMarkerLocation` (map center when idle on home) to fetch and display nearby drivers via `mapRef.current?.updateNearbyMarkers`.
5.  **Deep Linking & Notifications:**
    *   `useDeepLinking` hook handles incoming deep links, potentially opening modals like `referralModalRef`.
    *   `NotificationContext` is monitored. Specific notifications (`FOLLOW_RIDE`, `SHARE_RIDE`, `SOS_RESOLVED`) or `userProfile?.followsRide` trigger a `useFollowRideMutation` call (likely to fetch initial state for a followed ride).
6.  **User Profile & Personalization:**
    *   `userProfile` is read from Redux.
    *   `useLazyDisabilityListGetQuery` fetches disability options.
    *   `useEffect` hooks update `disabilityListResp` and `specialAssistance` in Redux based on the fetched list and the user's profile settings.
7.  **Flow Status Validation:**
    *   `useFlowStatusHandler` (`checkFlowStatus`) is used to ensure prerequisite conditions (e.g., app state, data sync) are met before critical operations. This is triggered by network changes or `recallFlowStatus` flag.
8.  **Accessibility:**
    *   `AccessibilityInfo.announceForAccessibility` is used to announce screen/stage changes.
    *   `screenReaderEnabled` state is monitored.

## Key Technical Decisions / Patterns

*   **Centralized Bottom Sheet:** The `BottomSheetStage` in Redux is the primary driver of the Home Screen's UI and functionality, determining which "sub-screen" or fragment is active within the bottom sheet.
*   **Reactive Location Handling:** The screen reacts to changes in `currentLocationCoords` to update serviceability, operating city, and potentially refresh map data.
*   **Conditional Logic for Multimodal:** Significant parts of the flow (PT stations, city change handling) are conditional on `isMultimodal` flag.
*   **Separation of Concerns via Hooks:** Complex functionalities like location services, deep linking, public transport utilities, and flow status checks are encapsulated in custom hooks.
*   **Interplay of Redux and Local State:** While core states are in Redux, some UI-specific or transient states might be handled locally within `HomeScreen_` or its child fragments.
*   **ReScript Interop for Core Utilities:** `GetLocationAndServiceability` is a key ReScript utility used for location processing.

The Home Screen acts as an orchestrator, preparing the ground for various user journeys, especially the ride booking flow, by ensuring location context is established and the UI is ready to transition through different states.
