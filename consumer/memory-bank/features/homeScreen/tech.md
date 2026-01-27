# Home Screen: Technical Context

This document outlines specific technical details related to the implementation of the Home Screen, primarily based on `src-v2/screens/HomeScreen/Flow.tsx`.

## Core Technologies & Libraries (`HomeScreen/Flow.tsx`)

*   **State Management (Redux Toolkit):**
    *   Extensive use of Redux for managing various global and session states. Key slices and selectors include:
        *   `session`: `selectBottomSheetStage`, `selectCurrentLocationCoords`, `selectIsCurrentLocationServiceable`, `selectOperatingCity`, `selectNewFeatureFlags`, `selectScreenReaderEnabled`, `selectFlowStatusValidated`, `selectRecallFlowStatus`, `selectNearbyDriversConfig`.
        *   `user`: `selectToken`, `selectUserProfile`, `selectSpecialAssistance`, `selectDisabilityListResp`, `selectSearchId`.
        *   `maps`: `selectNearbyMarkerLocation`.
    *   Dispatches actions like `setBottomSheetStage`, `setCurrentLocation`, `setIsServiceable`, `setOperatingCity`, `setSearchedSource`, `setActiveInput`, `setSpecialAssistance`, `setDisabilityListResp`, `setToastProps`, `resetToastProps`, `setRecallFlowStatus`.
*   **RTK Query (Redux Toolkit Query):**
    *   `useFollowRideMutation` (from `@/typescript/state/server/followRide.ts`): Triggered by certain notifications or user profile state.
    *   `useLazyDisabilityListGetQuery` (from `@/api/integrations/rtk/DisabilityListGet.ts`): To fetch disability options for special assistance.
    *   `useGetNearbyDriversMutation` (from `@/typescript/state/server/nearbyDriversApi.ts`): Periodically called to fetch and display nearby drivers on the map when the home screen is idle.
*   **Custom Hooks:**
    *   `useLocationServices` (from `@/typescript/hooks/useLocationServices`): Manages GPS status, location permissions, and map recentering.
    *   `useDeepLinking` (from `@/typescript/screens/home/hooks/useDeepLinking`): Handles deep link navigation.
    *   `usePublicTransportUtils` (from `@/src-v2/multimodal/utils/PublicTransportUtils`): For multimodal features like updating user location for PT context and fetching nearby PT stations.
    *   `usePublicTransportData` (from `@/src-v2/multimodal/hooks/usePublicTransportData`): Used to refresh public transport data when the operating city changes.
    *   `useFlowStatusHandler` (from `@/typescript/hooks/useFlowStatusHandler`): Validates application flow status before critical operations.
*   **ReScript Interoperability:**
    *   `GetLocationAndServiceability.getLocationObjectAndServiceability` (from `LocationUtils.gen`): Called to fetch details and serviceability of the user's current location. This is a key ReScript utility.
*   **Context API:**
    *   `useConfigContext`: For accessing configuration like `componentConfig`, `userLanguageStrings`.
    *   `NotificationContext`: For reacting to incoming push notifications.
    *   `MapContext`: For interacting with the map instance (`mapRef`).
    *   `useRefsContext`: For accessing shared refs like `referralModalRef`, `tipsBottomSheetModalRef`, etc.
*   **Local Persistence (MMKV):**
    *   `MMKVKey.OPERATING_CITY`: Used to store and retrieve the user's last known operating city.
*   **Network Information:**
    *   `@react-native-community/netinfo` (`useNetInfo`): To check network connectivity, which influences `checkFlowStatus`.
*   **Animation (`react-native-reanimated`):**
    *   `useSharedValue` for `progress` (passed down to child components like `LookingForRides`).
*   **Analytics & Logging:**
    *   `CleverTap`: For user profile updates (`CleverTap.profileSet`).
    *   `logEvent` (custom utility): For event tracking.
    *   `logger` (custom utility): For debug/error logging.
*   **Accessibility:**
    *   `AccessibilityInfo` from `react-native`: Used to announce screen changes for screen readers.
*   **Utility Libraries:**
    *   `lodash` (`capitalize`).
    *   Various project-specific utilities: `createDispatcher`, `getCityFromCode`, `safe`, `transformDisabilityTypeToDescription`, `getCityComponentConfig`, `resetIdsAndPurge`.

## Key API Interactions Orchestrated or Influenced by Home Screen

*   **Location Details & Serviceability API:** Via `GetLocationAndServiceability.getLocationObjectAndServiceability`.
*   **Follow Ride API:** Via `useFollowRideMutation`.
*   **Disability List API:** Via `useLazyDisabilityListGetQuery`.
*   **Nearby Drivers API:** Via `useGetNearbyDriversMutation`.
*   **Public Transport Data Refresh:** Triggered by `usePublicTransportData`'s `refreshData` method (implies underlying API calls for PT data).

The Home Screen acts as a primary orchestrator, leveraging a wide array of technologies to manage application state, user context, and transitions into various feature flows.
