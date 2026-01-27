# Multimodal Engine: Technical Context

This document outlines specific technical details related to the implementation of the Multimodal Engine, including live journey tracking and the rule engine.

## Core Technologies & Libraries

*   **React Native Maps (`react-native-maps`):**
    *   Used for displaying routes, vehicle positions, user location, and points of interest (stops, stations) via `MapProvider`.
*   **React Native Reanimated:**
    *   Implicitly used by `useCoreVehicleTracking` for smooth map animations (vehicle movement, camera adjustments).
*   **Custom Hooks:**
    *   **`useJourneyTrackingData` (from `@/src-v2/multimodal/hooks/useJourneyTrackingData`):**
        *   This is the primary hook for fetching and processing live multimodal journey data.
        *   It takes a `journeyId` and returns an array of `ProcessedLegInfo`, which includes static leg info, real-time updates (vehicle position, ETAs), user state, vehicle state, etc.
        *   Likely handles polling or WebSocket subscriptions for live updates.
    *   **`useCoreVehicleTracking` (from `@/typescript/hooks/useCoreVehicleTracking.tsx`):**
        *   A generic hook responsible for rendering a vehicle's movement along a route on the map.
        *   It takes extensive configuration for the vehicle marker, source/destination markers, user location marker, route polyline, and waypoints.
        *   Manages map camera animations to follow the vehicle or fit the route.
        *   Used by the internal `useBusTracking` hook within `LiveJourneyDetail/Flow.tsx`.
*   **State Management (Redux Toolkit):**
    *   While `useJourneyTrackingData` manages the primary live data, Redux might be used for:
        *   Storing `journeyId` (e.g., in `user` slice).
        *   Potentially caching some aspects of journey data or user preferences related to multimodal display, though not directly evident as the primary store for live tracking data in `LiveJourneyDetail/Flow.tsx`.
*   **Navigation (`@react-navigation/native`, `@react-navigation/stack`):**
    *   Used for navigating to/from the live tracking screen and related sub-views (e.g., ticket display).
*   **Utility Functions:**
    *   `calculateDistance` (from `@/src-v2/multimodal/utils/PublicTransportUtils`): For distance calculations (e.g., user to bus stop).
    *   `findNearestPointOnRoute` (local util in `LiveJourneyDetail/Flow.tsx`): Snaps given coordinates to the nearest point on a defined route polyline.
    *   `getStopString` (from `@/src-v2/multimodal/rules/JourneyRuleHelpers.ts`): Formats stop names.
    *   Numerous helper functions within `LiveJourneyDetail/FlowHelpers.ts` are used by the Journey Rule Engine handlers to construct UI props. Examples:
        *   `buildDetailedLiveHeaderProps`
        *   `getWalkPreboardingHeaderContent`, `getBusPreboardingHeaderContent`, `getMetroTrainPreboardingHeaderContent`
        *   `getInTransitHeaderContent`
        *   `buildCurrentLegSplitUpProps`, `buildFallbackLegSplitUpItem`
        *   `buildMiniBusTrackingProps`
        *   `buildDetailedTransitTrackingComponentProps`
    *   `mapModeToTransitType`, `getRouteCodeForTransit` (from `@/typescript/utils/MultiModal.ts`): Used in `JourneyInfoScreen`.
*   **Libraries for `JourneyInfoScreen`:**
    *   `lodash` (`isNull`, `isUndefined`, `debounce`): For utility functions.
*   **Specialized Hooks for `JourneyInfoScreen`:**
    *   `useJourneyInfoPolling`: Manages fetching and polling for detailed journey information.
    *   `useVehicleTierOptions`: Handles logic for selecting vehicle tiers for specific legs.
    *   `useJourneyConfirmation`: Manages the journey confirmation and ticket booking process.
    *   `useSwitchLegs`: Handles logic for allowing users to switch modes or vehicles for journey legs.

## Journey Rule Engine Components (Tech Details)

*   **`journeyRules` array (in `@/src-v2/multimodal/rules/JourneyRules.ts`):** The central definition of all rules.
*   **Type Definitions (in `@/src-v2/multimodal/rules/JourneyRulesTypes.ts`):**
    *   `ScreenType`: String literal union identifying screens like 'LiveJourneyDetail'.
    *   `RuleHandlerParams`: Interface for parameters to rule handlers (includes `currentLeg`, `allLegs`, `navigation`, `journeyId`, `onPressTicket` callback, and an optional `handleShowDetailedTransitTracking` callback).
    *   `DetailScreenRuleOutput`: Typed structure for the output of rules targeting `LiveJourneyDetail`.
    *   `OverviewScreenRuleOutput`: Typed structure for the output of rules targeting `LiveJourneyOverview` (often `ItineraryCardProps | null`).
    *   `JourneyRule`: Interface defining the structure of each rule (name, states, modes, condition, handler).
*   **Helper Functions (in `@/src-v2/multimodal/rules/JourneyRuleHelpers.ts` and screen-specific `FlowHelpers.ts` like `LiveJourneyDetail/FlowHelpers.ts` and `LiveJourneyOverview/FlowHelpers.ts`):** These contain the actual logic for transforming journey data into UI-specific props based on the matched rule and `screenType`.

## Map Rendering for Live Tracking (e.g., `useBusTracking` in `LiveJourneyDetail/Flow.tsx`)

*   **Data Preparation:**
    *   Extracts vehicle position, route waypoints, user location, source/destination from `ProcessedLegInfo`.
    *   Snaps these points to the route using `findNearestPointOnRoute`.
    *   Calculates which part of the route to display based on vehicle state (pre-pickup vs. post-pickup).
*   **Marker Configuration:** Dynamically generates configurations for source, destination, user, and vehicle markers, including icon types (`multimodalVariant`) and visibility.
*   **`useCoreVehicleTracking` Invocation:** Passes the prepared data and configurations to `useCoreVehicleTracking` for rendering on the map.

This combination of a rule engine, specialized data hooks, and map utility hooks allows for a flexible and detailed live tracking experience for multimodal journeys.
