# Ride Booking: Ride Search & Allocation Patterns

This document outlines system patterns related to the phase where the application is actively searching for a ride and waiting for driver allocation, primarily based on `src-v2/screens/LookingForRides/Flow.tsx`.

## Overview

The `LookingForRidesFlow` component manages the UI and logic during the ride search/allocation period. It involves:
*   Displaying a progress animation.
*   Polling for booking status and estimate results.
*   Handling push notifications for driver assignment.
*   Managing search timeouts and presenting options like "Boost Search".
*   Navigating to the on-ride screen upon successful allocation.

## Core Flow & State Management

1.  **Initiation & Progress Animation:**
    *   Receives a `progressRef` (Reanimated `SharedValue`) to control a visual progress bar.
    *   `animateRideSearch` function orchestrates a multi-phase progress animation using `withSequence` and `withTiming`.
        *   The duration is based on `batchConfig` (from `estimateResultResp.data` or defaults) and `RIDE_SEARCH_TIME`.
        *   `MMKVKey.PROGRESS_START_TIME` is used to persist/retrieve batch start times for consistent progress display across sessions/re-renders.
2.  **Polling Mechanisms:**
    *   **Estimate Results (for `DynamicOffer` trips):** `useEstimateResultsQuery` (RTK Query) polls for results based on `selectedPricingItems[0]?.id`. This is likely how the `bookingId` is first obtained for these trip types. Polling interval is controlled by `props.searchPollingInterval`.
    *   **Booking Status:** `useBookingStatus` custom hook polls for status updates using an existing `bookingId`. Polling interval also controlled by `props.searchPollingInterval`.
3.  **Driver Allocation & Navigation:**
    *   **Via Polling:** A `useEffect` monitors `bookingId` (from Redux `user` slice, potentially set by `estimateResultResp`) and `bookingStatus` (from `useBookingStatus`). If a ride is assigned (`TRIP_ASSIGNED` or `CONFIRMED` for `RideOtp` mode):
        *   `hasNavigated.current` ref prevents multiple navigations.
        *   The `bookingId` is added to `activeBookingIds` in Redux (`user` slice).
        *   Navigates to `onRideNavigation` screen using `toggleDrawer.navigateTo` (from `DrawerContext`).
    *   **Via Push Notification:** A `useEffect` listens to `NotificationContext`. If a `DRIVER_ASSIGNMENT` notification is received:
        *   Parses `bookingId` from notification data.
        *   Sets `bookingId` and adds to `activeBookingIds` in Redux.
        *   Navigates to `onRideNavigation`.
4.  **Search Timeout & Error Handling (`SearchProgressExpired`):**
    *   A `setTimeout` (`rideSearchTimerID`) runs for the calculated search duration.
    *   If it expires before allocation:
        *   **Boost Option (for `DynamicOffer`):** If no `bookingId` yet, it presents a "Retry Boosted Search" modal (`retryBoostedSearchModalRef`) and updates `bottomSheetStage` to `RetryBoostedSearch`.
        *   **Drivers Not Available:** Otherwise, it sets `SearchWarningType.DriversNotAvailable` in Redux (`session` slice), calls `props.showErrorStatesModal`, and updates `bottomSheetStage` to `SearchErrorStates`.
        *   Calls `props.stopSearch()` to halt polling/animations.
        *   Calls `cancelEstimate` mutation (RTK Query) if an estimate was active.
5.  **Boost Search Prompt & Logic:**
    *   `useBoostCard` custom hook encapsulates logic for the "Boost Search" feature (e.g., handling additional fare).
    *   A separate `useEffect` with a timeout (`30000 - escalatedTime`) can proactively show a boost prompt by snapping `newBookingFlowSheetRef` if conditions are met (not already boosted, no tip, `DynamicOffer` one-way trip).
6.  **Map Integration (Route & Nearby Drivers):**
    *   `drawEstimateRoute` (from `useMapRoute` hook) displays the planned route on the map using `routeInfo` from Redux (`search` slice).
    *   `nearbyDrivers` data (from Redux `maps` slice) is used to display driver markers on the map via `mapRef.current?.updateNearbyMarkers`, filtered by `serviceTierType`.
7.  **Redux State:**
    *   Heavily relies on selectors from `search`, `session`, `user`, and `maps` slices.
    *   Dispatches actions to update these slices based on search progress and outcomes.

## Key Technical Decisions / Patterns

*   **Reanimated for Progress:** `react-native-reanimated` for smooth progress bar animations.
*   **RTK Query for Polling & Mutations:** Used for fetching estimate results and cancelling estimates.
*   **Custom Hooks for Complex Behaviors:** `useBookingStatus`, `useMapRoute`, `useBoostCard` encapsulate significant pieces of functionality.
*   **MMKV for Simple Persistence:** Storing `PROGRESS_START_TIME`.
*   **Context API for Shared Concerns:** `NotificationContext`, `MapContext`, `DrawerContext`, `RefsContext`.
*   **Dual Path to Confirmation:** Ride assignment can occur either through polling results or a push notification.
*   **Graceful Timeout & Escalation:** Handles search expiry by offering boost options or showing appropriate error states.

This screen acts as an orchestrator for the user while the backend systems work to find and assign a ride.
