# Multimodal Engine: System Patterns Overview

This document outlines key system patterns specifically relevant to the Multimodal Engine, with a primary focus on the Centralized Rule Engine for Journey Logic.

## Centralized Rule Engine for Journey Logic

This pattern is critical for managing complex state-driven UI and logic for multimodal journeys, particularly for screens like `LiveJourneyDetail` and `LiveJourneyOverview`.

*   **Location:** `src-v2/multimodal/rules/`
*   **Core Components:**
    *   **`JourneyRulesTypes.ts`:** Defines shared TypeScript types for the rule engine:
        *   `ScreenType`: An enum or string literal union (e.g., `'LiveJourneyDetail'`, `'LiveJourneyOverview'`) to identify the consuming screen.
        *   `RuleHandlerParams`: A common interface for parameters passed to all rule handlers. This typically includes `screenType`, `currentLeg`, `allLegs`, and potentially navigation props or callbacks.
        *   `DetailScreenRuleOutput`: Defines the specific data structure expected by the `LiveJourneyDetail` screen's UI.
        *   `OverviewScreenRuleOutput`: Defines the specific data structure (often `ItineraryCardProps | null`) expected by the `LiveJourneyOverview` screen's UI.
        *   `JourneyRule`: The core interface for a rule, containing:
            *   `name`: A descriptive name for the rule.
            *   `userStates`: Array of user states this rule applies to.
            *   `vehicleStates`: Array of vehicle states this rule applies to.
            *   `transitModes`: Array of transit modes this rule applies to.
            *   `condition`: An optional function `(params: RuleHandlerParams) => boolean` for more complex matching logic beyond simple state/mode checks.
            *   `handler: (params: RuleHandlerParams) => DetailScreenRuleOutput | OverviewScreenRuleOutput | OtherScreenOutput | null`: The function executed when the rule matches.
    *   **`JourneyRuleHelpers.ts`:** Contains utility functions shared across different rule handlers or used by screen-specific `FlowHelpers`. Examples: `formatTime`, `getStopString`, `mapVehicleStateToJourneyState`.
    *   **`JourneyRules.ts`:**
        *   Contains the main `journeyRules: JourneyRule[]` array, which is the central registry of all journey logic rules.
        *   Each rule's `handler` function accepts `RuleHandlerParams`.
        *   **Screen-Aware Logic:** Crucially, inside the `handler`, it checks `params.screenType`. Based on this, it calls screen-specific builder/mapper functions (typically located in the respective screen's `FlowHelpers.ts` file) to construct the appropriate output structure (`DetailScreenRuleOutput`, `OverviewScreenRuleOutput`, etc.).
    *   **Screen-Specific Integration (Examples):**
        *   **`LiveJourneyDetail/Flow.tsx` (`useLiveJourneyDetailFlow` hook):**
            *   **Data Source:** Uses `useJourneyTrackingData` (with `fetchRouteWaypoints: true`, `fetchStops: true` implicitly or explicitly) to get detailed `ProcessedLegInfo[]` and the `currentLeg`.
            *   **Rule Matching:** Filters `journeyRules` for `rule.screenType === 'LiveJourneyDetail'` and matches against `currentLeg.userState`, `currentLeg.vehicleState`, `currentLeg.transitMode`, and any `rule.condition`.
            *   **Handler Invocation:** Calls the matched rule's handler with `RuleHandlerParams` tailored for detailed view (including navigation, ticket press callback, detailed tracking callback).
            *   **Output Usage:** The `DetailScreenRuleOutput` from the handler populates `LiveJourneyDetailViewData`.
            *   **Fallback:** If no rule matches, constructs a basic UI state using helpers from `LiveJourneyDetail/FlowHelpers.ts`.
        *   **`LiveJourneyOverview/Flow.tsx` (`LiveJourneyOverviewFlow` component):**
            *   **Data Source:** Uses `useJourneyTrackingData` with `fetchRouteWaypoints: false` and `fetchStops: false` to get a lighter version of `ProcessedLegInfo[]` and `currentLegDataForStatus`.
            *   **Rule Matching:** Filters `journeyRules` for `rule.screenType === 'LiveJourneyOverview'` and matches against `currentLegDataForStatus` states and modes.
            *   **Handler Invocation:** Calls the matched rule's handler with `RuleHandlerParams` tailored for overview (e.g., `onPressTicket` navigates to home's ticket tab, `handleShowDetailedTransitTracking` is undefined).
            *   **Output Usage:** The `OverviewScreenRuleOutput` (typically `ItineraryCardProps | null`) from the handler is used directly for the UI.
            *   **Fallback:** Returns `null` for `itineraryCardProps` if no rule matches or data is loading/error.
    *   **`FlowHelpers.ts` files (e.g., `LiveJourneyDetail/FlowHelpers.ts`, `LiveJourneyOverview/FlowHelpers.ts`):**
        *   These files contain functions that are specific to a particular screen.
        *   They take data (often from `currentLeg`, `allLegs`, and other parameters passed down by the centralized rule handler) and are responsible for building the exact UI prop structures required by that screen's UI component.
        *   These helper functions are invoked by the centralized rule handlers based on the `screenType`.

**Benefits of this Pattern:**

*   **Centralization of Logic:** Core conditions for "when" certain UI or data transformations should occur are centralized in `JourneyRules.ts`.
*   **Decoupling:** The rule matching logic is decoupled from the screen-specific data transformation logic.
*   **Reusability:**
    *   The rule matching mechanism is reusable across any screen that consumes journey data.
    *   Common helper functions in `JourneyRuleHelpers.ts` are reusable.
*   **Maintainability:** Changes to journey state logic can often be made in one place (`JourneyRules.ts` or specific helpers) rather than duplicating logic across multiple screen flows.
*   **Clarity:** Makes it easier to understand the conditions under which different journey states are handled.

**Data Flow with Rule Engine:**

1.  Screen's `Flow.tsx` (e.g., `useLiveJourneyDetailFlow`) gets `currentLeg` and `allLegs` (e.g., from `useJourneyTrackingData`).
2.  It finds an `activeRule` from `journeyRules` matching `screenType`, `currentLeg.userState`, `currentLeg.vehicleState`, `currentLeg.transitMode`, and any custom `rule.condition`.
3.  It calls `activeRule.handler(ruleHandlerParams)` where `ruleHandlerParams` contains `currentLeg`, `allLegs`, and other screen-specific callbacks/data.
4.  The `activeRule.handler` (defined in `JourneyRules.ts`):
    a.  Internally, it knows it's for a specific `screenType` (e.g., 'LiveJourneyDetail') due to how it was defined.
    b.  It calls specific builder functions from the corresponding screen's `FlowHelpers.ts` (e.g., `LiveJourneyDetail/FlowHelpers.ts`) to construct the `DetailScreenRuleOutput` or `OverviewScreenRuleOutput`.
5.  The function in `CurrentScreen/FlowHelpers.ts` transforms the data into the precise prop structure needed by `CurrentScreen/UI.tsx`.
6.  This transformed data is returned by the handler to `Flow.tsx`.
7.  `Flow.tsx` uses this data to render its `UI.tsx` component.

This pattern is a cornerstone of how complex, state-driven journey information is processed and displayed in a consistent yet screen-adapted manner.

## Journey Planning & Customization (`JourneyInfoScreen/Flow.tsx`)

The `JourneyInfoScreen` (orchestrated by `JourneyDetail_` in its `Flow.tsx`) is responsible for displaying a detailed multimodal journey plan, allowing users to customize legs (e.g., switch modes, change vehicle tiers), and then confirm the journey or book tickets.

1.  **Data Initialization & Polling:**
    *   Receives `currentJourney` (a selected journey plan, likely from `ChooseRide` screen) from Redux (`search` slice).
    *   **`useJourneyInfoPolling` Hook:** This is central to fetching and keeping the detailed journey information (`journeyInfoData`) up-to-date.
        *   It can initiate a new search/fetch if needed (e.g., if `currentJourney` is minimal).
        *   It polls for updates to leg pricing, availability, or real-time aspects if legs are dynamic.
        *   Manages loading states for individual legs (`loadingDataForLeg`).
        *   Handles and can display multimodal warnings.
    *   **User Preferences:** `useMultimodalUserPreferencesGetQuery` fetches user's preferred transit modes, which are then applied as filters via Redux (`setSelectedModesFilter`).
2.  **Displaying Journey Legs:**
    *   The UI (`PublicTransitOverview`) renders the legs from `journeyInfoData`.
    *   `journeySegments` (a memoized transformation) prepares leg data for display, including cost, distance, route codes.
3.  **Leg Customization & Interaction:**
    *   **`useSwitchLegs` Hook:** Manages the logic for:
        *   Showing ride options for a specific leg (`handleShowRideOptions`, `legRideOptionsPopup` state).
        *   Switching the mode of a leg (`switchLegMode`).
        *   Changing the vehicle for a bookable leg (e.g., auto - `handleChangeVehicle`).
        *   Skipping a leg (`handleSkipRide`).
        *   Determines `journeyMapData` for map display.
    *   **`useVehicleTierOptions` Hook:**
        *   Manages fetching and selecting different vehicle tiers for applicable legs (e.g., an auto leg).
        *   Handles `handleChangeVehicleClass` and `handleShowVehicleTierOptions` (which presents `vehicleOptionsModalRef`).
        *   This allows for "single mode booking" choices within the multimodal plan.
4.  **Journey Confirmation & Booking:**
    *   **`useJourneyConfirmation` Hook:**
        *   `handleConfirmJourney`: Finalizes the customized journey plan, potentially making API calls to lock in options.
        *   `handleBookTicket`: Initiates booking for legs that require ticketing (e.g., public transport).
        *   Manages payment order state (`paymentOrder`, `isPaymentOrder`) and CRIS errors (`hasCRISError`).
    *   **Payment Order Updates:** `useMultimodalJourneyIdPaymentUpdateOrderPostMutation` (`paymentUpdateOrderApiCall`) is used to update ticket quantities (adult/child) for legs, with debouncing to prevent rapid API calls.
5.  **Map Interaction:**
    *   `recenterMap` function fits the map to display all journey legs.
    *   The map would display routes for each leg based on `journeyMapData` from `useSwitchLegs`.
6.  **Navigation & UI Control:**
    *   `handleGoBack` for navigating away.
    *   `handleMoreOptions` navigates to `journeyOptions` screen.
    *   Modals/Popups: `vehicleOptionsModalRef`, `rideOptionModalRef`, `autoInfoModalRef` are used for various interactions.

### Key Technical Aspects for Journey Planning:
*   **Composition of Custom Hooks:** The screen's logic is heavily built upon specialized hooks (`useJourneyInfoPolling`, `useVehicleTierOptions`, `useJourneyConfirmation`, `useSwitchLegs`), each managing a distinct aspect of the journey planning process.
*   **RTK Query for Backend Interactions:** Used for fetching user preferences, updating payment orders, and likely within the custom hooks for fetching leg options, confirming journeys, and booking tickets.
*   **Redux for Shared State:** Manages `currentJourney`, selected modes, and potentially intermediate states during customization.
*   **Debouncing:** Used for `paymentUpdateOrderApiCall` to improve performance.
*   **Data-Driven UI:** The display of legs and available options is driven by `journeyInfoData` which is dynamically updated.
