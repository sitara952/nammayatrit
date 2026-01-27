# Ride Booking: Ride Option Selection Patterns

This document outlines system patterns related to how users are presented with and select from available ride options (estimates/quotes), primarily based on `src-v2/screens/ChooseRide/Flow.tsx`.

## Overview

The `ChooseRideFlow` component is responsible for:
*   Fetching and displaying ride estimates/quotes and multimodal journey options.
*   Handling user selection of a ride/journey.
*   Managing UI related to "Book Any", smart tips, and rate cards.
*   Integrating map visuals for routes and nearby drivers.

## Core Flow & State Management

1.  **Initiating Search & Fetching Options:**
    *   A search request is triggered by `handleRideSearch` (calling `useSearchMutation` from RTK Query). Parameters include source, stops, time, inter-city status, fare product type, and rental details from Redux (`session` and `search` slices).
    *   `useSearchResultsQuery` (RTK Query) polls the backend for results (`searchId` specific) which include:
        *   `estimates`: Priced ride options.
        *   `quotes`: Alternative pricing.
        *   `journey`: Multimodal journey options.
    *   Polling continues until results are found, `stopPolling` is true (e.g., after a 10-second timeout managed by `pollingTimeoutRef`), or the screen is left.
    *   If polling times out without results, an error state is triggered (`SearchWarningType.EstimatesNotAvailable`).
2.  **Displaying Options (UI Rendering):**
    *   `pricingItems` from Redux (populated by `useSearchResultsQuery`) are transformed into `pricingItemsData`.
    *   A "Book Any" option might be synthesized and included if `bookAnyVisible` is true and conditions are met. This option groups several underlying pricing items.
    *   The `CardEstimates` component is used within a list to render each ride option.
    *   A loading state (`LOADING_DATA`) is shown while fetching.
    *   Multimodal `journeys` are also displayed if available.
3.  **User Selection of Ride/Journey:**
    *   **Standard Ride (`selectCardEstimate`, `onCardPress`):**
        *   When a user taps a `CardEstimates` item, `selectedCard` local state is updated.
        *   `handleSmartTipSuggestion` utility is called to potentially pre-select a tip.
        *   The chosen `PricingItemType` is dispatched to Redux via `setSelectedPricingItems`.
        *   Relevant analytics are logged.
    *   **"Book Any" Selection:** If the "Book Any" card is selected, `selectedBookAnyPricingItems` (a local state, initially derived from top pricing items) are dispatched via `setSelectedPricingItems`.
    *   **Multimodal Journey (`selectPublicTransportItem`):** If a multimodal journey is selected, `selectedJourney` is updated in Redux.
4.  **UI Interactions & Features:**
    *   **Rate Card:** `isRateCardExpanded` state controls visibility of detailed fare breakup.
    *   **Smart Tips:** `isAddTipSelected` (Redux) and `derivedAddTipState` (Reanimated) manage tip UI.
    *   **Accessibility:** `screenReaderEnabled` and `hideAccessibility` props manage UI adjustments.
    *   **Editing Source/Destination (`onClickSource`, `onClickDestination`):** Allows user to go back to the `Search` stage (`BottomSheetStage.Search`) by resetting relevant Redux state and focusing input fields.
5.  **Map Integration:**
    *   **Route Display:** `drawEstimateRoute` (from `useMapRoute` hook) displays the route for the selected/default option using `routeInfo` from Redux. This is typically done once initially.
    *   **Nearby Drivers:**
        *   `useNearbyDrivers` hook and its `getDrivers` function fetch nearby driver data based on `source` location and `nearbyDriversConfig` (Redux).
        *   `mapRef.current?.updateNearbyMarkers` displays/updates driver markers on the map, filtered by the `serviceTierType` of the `selectedCard`.
    *   **Map Padding:** Adjusted dynamically using `useOnBottomSheetAnimate` and `mapRef.current?.addMapPadding` to account for UI elements like the bottom sheet.
6.  **Error Handling & Flow Control:**
    *   `useSearchExpiry` hook can re-trigger `handleRideSearch` if a previous search expired.
    *   `useFlowStatusHandler` (`checkFlowStatus`) can delay search initiation if prerequisite conditions aren't met, showing a toast message.
    *   Handles `searchWarning` and `searchFailed` from Redux to display appropriate error modals.

## Key Technical Decisions / Patterns

*   **RTK Query for Search & Polling:** Central to fetching and repeatedly checking for ride options.
*   **Redux for UI State & Selected Options:** Manages a wide array of states related to user choices, search parameters, and UI presentation.
*   **Custom Hooks for Complex Behaviors:** `useMapRoute`, `useSearchExpiry`, `useNearbyDrivers`, `useFlowStatusHandler`, `useOnBottomSheetAnimate` encapsulate significant logic.
*   **Reanimated for Minor UI Animations:** Used for the "add tip" UI state.
*   **Context API for Cross-Cutting Concerns:** `MapContext`, `AnimatedContextValues`, `ConfigContext`, `RefsContext`.
*   **Analytics & Logging:** `logEvent` (custom logger) and `CleverTap` are used for tracking user interactions.
*   **Defensive Programming:** Checks for `isNull`, `isUndefined`, and handles potential errors during API calls or data processing.

This screen serves as the primary interface for users to evaluate and choose their preferred mode of transport before proceeding to payment or final confirmation.
