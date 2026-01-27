# Ride Booking: Active Ride Management & Tracking Patterns

This document outlines system patterns related to managing an active/confirmed booking, in-ride actions, and implicitly covers aspects of pre-tracking and status updates leading to ride completion. It's primarily based on insights from `src-v2/screens/RideConfirmed/Flow.tsx`.

## Active Ride Management Flow (`RideConfirmed/Flow.tsx`)

This flow component is central to the user experience once a booking is confirmed and until it's completed or cancelled.

1.  **Initialization & Data Hydration:**
    *   The flow is initiated with a `bookingId`.
    *   It heavily relies on Redux selectors to pull detailed information related to the booking, the ride itself, user session, and associated entities from various slices (`booking`, `ride`, `session`, `user`, `appinfo`, `sos`, `chat`). Key data includes:
        *   `bookingDetails`, `rideDetails`, `otpCode`, `rideChecks`.
        *   Booked `source` and `stops`.
        *   `emergencyContacts`, `customerFirstRide` status.
    *   RTK Query hooks like `useLazyEmergencyContactsQuery` and `useProfileGetEmergencySettingsGetQuery` are used to fetch supplementary data.
2.  **Continuous Booking & Ride Status Polling:**
    *   The `useBookingDetailsOnStatusChange` custom hook is the core mechanism for keeping the UI in sync with backend changes. It polls at a regular interval (e.g., 5 seconds) for updates to both `bookingDetails` and `rideDetails` using the `bookingId` and `rideId`.
3.  **Ride Lifecycle Event Handling & Navigation (Driven by Polled Status):**
    *   The component reacts to changes in `bookingDetails.status` and `rideDetails.status`:
        *   **`NEW` (Driver Assignment):** Logs an event. The UI would typically show driver/vehicle details.
        *   **`CONFIRMED` / `TRIP_ASSIGNED` (Pre-Pickup / Driver En Route):** This is a key state where the screen displays OTP, allows ride checks, and enables actions like Edit Pickup/Destination, Chat, Call, Safety.
        *   **`INPROGRESS` (Ride Started):** Logs event. UI updates to reflect active ride. Chat bar visibility might change based on emergency contacts.
        *   **`COMPLETED`:**
            *   Logs detailed ride metrics (using `rideCompletedDetails` utility).
            *   Checks if it's the `customerFirstRide` by calling `useRideBookingListGetLazyQueryWithAppName` if needed, then triggers `firstRideCompletedEvent`.
            *   Navigates to the `reviewAndFeedback` screen.
        *   **`REALLOCATED`:** Triggers `onFindAnotherDriver` internal handler. This clears the current `bookingId` from Redux, calls `handleReallocation` utility (likely shows a toast/message and resets search state), and navigates the user back to the home screen to potentially start a new search.
        *   **`CANCELLED`:** Triggers `onRideConfirmedCancel` internal handler. This clears relevant session data, resets IDs, and navigates to the home screen.
4.  **In-Ride & Pre-Pickup Actions:**
    *   **Edit Pickup (`onEditPickupClick`):** Navigates to `editPickup` screen, conditional on `editPickupAttempts` remaining.
    *   **Edit Destination (`onEditDestinationClick`):** Navigates to `editDestination` screen, conditional on `editLocationAttempts` remaining. Passes driver location if available.
    *   **Add/Edit Stops (Primarily for Rentals - `onSearchCardClick` -> `rentalEditorAddStopApiCall`):** Uses RTK Query mutations (`useRideBookingRideBookingIdEditStopPostMutation`, `useRideBookingRideBookingIdAddStopPostMutation`) to update stops. Updates `bookedStops` in Redux on success.
    *   **Safety Tools (`onSafetyBtnClick`):** Navigates to `safetyTools` screen.
    *   **Chat with Driver/Support (`useChatSessions`, `useChatMessages`):** Manages chat UI state, unread message counts, and interaction logic. `handleChatClick` opens the chat interface.
    *   **Call Driver (`handleCallClick`):** Opens a bottom sheet modal for initiating a call.
    *   **Pickup Directions (`handlePickupDirectionsPress`):** Opens Google Maps navigation to the pickup point or navigates to an in-app `pickupInstructions` screen if custom instructions exist.
5.  **Ride Checks (Safety/Information Popups):**
    *   Manages the display and user acknowledgement of ride-specific checks (e.g., AC, Toll Included, Parking Included, Driver Demand Extra for specific cities like Chennai).
    *   The initial state of these checks is determined based on `bookingDetails` (e.g., `estimatedFareBreakup`, `isAirConditioned`) and `rideDetails.status`.
    *   User acknowledgements are persisted locally using MMKV (`MMKVKey.RIDE_CHECKS`) via `handleRideChecksPopup` and also updated in the Redux `booking` slice (`rideChecks`).
6.  **Live Sharing & Emergency Contacts:**
    *   Fetches emergency contacts using `useLazyEmergencyContactsQuery` and settings via `useProfileGetEmergencySettingsGetQuery`.
    *   The `updateLiveSharingWithNewEmergencyContacts` utility processes these contacts.
    *   If live sharing is enabled for a contact during an `INPROGRESS` ride, `useShareRidePostMutation` is called.
    *   Manages `liveSharingEmergencyContacts` in Redux (`session` slice).
7.  **UI Orchestration & Conditional Rendering:**
    *   Manages the visibility and state of bottom sheets (`rideConfirmedBottomsheetModalRef`, `rideConfirmedChatBottomsheetRef`, `callDriverBottomsheetModalRef`, `genericSearchModalRef`).
    *   The `PostRideStartFragment` component is conditionally rendered based on `featureFlags.postRideStartFragment` and the current `rideDetails.status`.
8.  **Map Integration (Implicit for Tracking):**
    *   While `RideConfirmed/Flow.tsx` itself doesn't perform continuous driver location updates on the map, it sets the stage for tracking screens like `FollowRide` or integrates with `LiveJourneyDetail`/`LiveJourneyOverview`.
    *   It does clear `nearbyDrivers` markers from the previous (search) screen using `mapRef.current?.removeNearbyMarkers()`.
    *   The actual drawing of the driver's moving position and route updates would be handled by a dedicated tracking component/screen that likely consumes `rideDetails` (updated by polling) and `driverLocation` (from a separate source, e.g., WebSocket or more frequent polling).

## Key Technical Decisions / Patterns

*   **Centralized Polling for Status:** `useBookingDetailsOnStatusChange` is the workhorse for keeping the app state synchronized with the backend during an active ride.
*   **State-Driven UI & Logic:** The entire screen's behavior and displayed information are highly reactive to `bookingDetails.status` and `rideDetails.status`.
*   **Encapsulated Actions:** In-ride functionalities (edit, safety, chat, call) are modularized into specific handler functions and hooks.
*   **MMKV for Persisting UI Choices:** User acknowledgements for ride checks are stored locally to avoid re-prompting for the same booking.
*   **Feature Flags for UI Variations:** `featureFlags` (from Redux `session` slice) control the availability of certain UI elements or behaviors.
*   **Extensive Redux Usage:** Redux is the source of truth for most data related to the active booking and ride.
*   **RTK Query for Specific Mutations & Queries:** Used for targeted backend interactions like editing stops, sharing rides, and fetching auxiliary data like emergency contacts or initial first-ride status, distinct from the main status polling.
*   **Navigation for Sub-Flows:** React Navigation is used for temporary diversions to other screens (e.g., `editPickup`, `safetyTools`).
*   **Remote Config for Business Logic:** `@react-native-firebase/remote-config` is used to fetch configurations like `edit_location_configs`.

This `RideConfirmed/Flow.tsx` acts as a comprehensive manager for the user's journey from the point of confirmation until completion or cancellation, handling a wide array of states and user interactions.

## Following a Shared Ride (Live Sharing - `FollowRide/Flow.tsx`)

This pattern describes how a user (follower) can track another user's (sharer's) ride in real-time.

1.  **Initiation:**
    *   The `FollowRideScreen` is typically launched with `currentFollower` data (including the `bookingId` of the ride to be followed) and a `shouldOpenChat` flag.
2.  **Data Fetching & State (for the *followed* ride):**
    *   The `bookingId` from `currentFollower` is used to select `bookingDetails`, `rideDetails`, `rideId`, `bookedSource`, and `stops` from Redux for the ride being shared.
    *   `useBookingDetailsOnStatusChange` hook polls for status updates of this *followed* ride.
3.  **Map Tracking (`useRideTracking` hook):**
    *   The `useRideTracking` custom hook is instantiated with the details of the *followed* ride.
    *   This hook is responsible for drawing the route and updating the vehicle's position on the map for the follower.
    *   The follower's own location marker is typically hidden (`mapRef.current?.setCurrentLocationMarkerVisibility(false)`).
4.  **Handling Status of the *Followed* Ride:**
    *   A `useEffect` monitors `bookingDetails?.status` of the followed ride:
        *   **`COMPLETED`:** Navigates the follower to an `EndInfoScreen` indicating the ride completed safely. It may display details of the completed ride. An option to navigate back to the follower's own active ride (if any) can be provided. A `useFollowRideMutation` is called (likely to notify the backend or clean up).
        *   **`REALLOCATED` / `CANCELLED` / Not Found:** Navigates the follower to an `EndInfoScreen` with an appropriate message (e.g., "Ride Not Found"). `useFollowRideMutation` is called.
        *   **SOS Active (`bookingDetails?.sosStatus === 'Pending'`):** Updates local state (`followRideSosStatus`, `followRideStatus`) to reflect the SOS situation, potentially changing the UI to an SOS view.
        *   **SOS Resolved:** Resets local SOS-related UI states.
5.  **Chat with Sharer (Conditional):**
    *   If `shouldOpenChat` is true or an SOS is active, chat functionality can be enabled.
    *   `useEffect` sets up chat sessions using `initialFollowRideChatSession`, `getChannelId`, and `chatHelpers` for communication related to the followed ride. `setCurrentChatSessionId` is dispatched for the relevant ride.
6.  **Navigation for Follower:**
    *   The follower can navigate back to their own ride using `goToOnRide` if they have an active booking (`currentBookingId`).
    *   Standard back navigation is also handled.
7.  **API Interaction:**
    *   `useFollowRideMutation`: An RTK Query mutation called when the followed ride ends or if an error occurs. Its exact purpose (e.g., unregistering the follower, fetching final state) would depend on the backend API.

### Key Technical Aspects for Following a Ride:
*   **Data Segregation:** Clearly distinguishes between the follower's own state and the state of the ride being followed (using the passed `bookingId`).
*   **`useRideTracking` Hook:** Central to displaying the followed ride's progress on the map.
*   **Conditional UI:** The UI adapts based on the followed ride's status (normal tracking, SOS, completed, not found).
*   **Chat Integration:** Allows communication specifically tied to the followed ride session.
