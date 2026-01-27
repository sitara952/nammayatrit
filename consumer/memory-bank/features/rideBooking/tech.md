# Ride Booking: Technical Context

This document outlines specific technical details related to the implementation of the ride booking feature, including search, selection, allocation, active ride management, ride history, and real-time tracking. Information is derived from `Search/Flow.tsx`, `ConfirmPickup/Flow.tsx`, `LookingForRides/Flow.tsx`, `ChooseRide/Flow.tsx`, `RideConfirmed/Flow.tsx`, `FollowRide/Flow.tsx`, `MyRides/Flow.tsx` and other relevant areas.

## Core Technologies for Ride Booking (Search, Selection, Confirmation, Allocation, Option Selection, Active Ride, Following & History)

*   **React Native Maps (`react-native-maps`):**
    *   Essential for displaying interactive maps. Used across various screens (`Search/UI.tsx`, `ConfirmPickup/UI.tsx`, `RideConfirmed/UI.tsx`, `FollowRide/UI.tsx`) via a `MapProvider`.
*   **Location Services (Platform-specific & `react-native-geolocation-service` or similar):**
    *   Used to fetch the user's current location for biasing search predictions and for map centering.
*   **Geocoding/Reverse Geocoding & Serviceability (via ReScript Interop):**
    *   ReScript utilities like `GetLocationAndServiceability.getLocationObjectAndServiceability` (from `LocationUtils.bs` or `.gen`) are called from TypeScript to fetch detailed place information and serviceability status. This is a key interop pattern.
*   **Custom Hooks:**
    *   `useLocationPredictions`: For location autocomplete in `Search/Flow.tsx`.
    *   `useCheckForInterCity`: For inter-city trip detection in `Search/Flow.tsx`.
    *   `useBookingStatus`: For polling booking/ride status in `LookingForRides/Flow.tsx` and `RideConfirmed/Flow.tsx`, and for followed rides in `FollowRide/Flow.tsx`.
    *   `useMapRoute`: For drawing routes on the map in `LookingForRides/Flow.tsx` and `ChooseRide/Flow.tsx`.
    *   `useBoostCard`: Manages "Boost Search" logic in `LookingForRides/Flow.tsx`.
    *   `useOnBottomSheetAnimate`, `useSearchExpiry`, `useNearbyDrivers`, `useFlowStatusHandler`: Used in `ChooseRide/Flow.tsx`.
    *   `useChatSessions`, `useChatMessages`, `useHandleNotification`: Used in `RideConfirmed/Flow.tsx`.
    *   `useRideTracking`: Central to map display and vehicle position updates in `FollowRide/Flow.tsx` (for followed rides).
*   **State Management (Redux Toolkit):**
    *   Extensively used across all ride booking screens. Key slices include:
        *   `session`: Manages search inputs, selected locations, active input, serviceability, UI flow (`bottomSheetStage`), user location.
        *   `search`: Manages pricing items, selected options, route info, tip status, multimodal journeys.
        *   `user`: Manages `bookingId`, `searchId`, `followers` list (for live sharing), `journeyId`.
        *   `maps`: Manages map state like `isMapMoved`, `currentRegion`, `nearbyDrivers`.
        *   `booking`: Manages details of a confirmed booking (`bookingDetails`, `otpCode`, `rideChecks`).
        *   `ride`: Manages details of an active ride (`rideDetails`, `stopInfo`, edit attempts).
        *   `appinfo`, `sos`, `chat`: Used in `RideConfirmed/Flow.tsx`.
        *   `journey`: Stores fetched journey feedback (`selectJourneyFeedBack`, `setJourneyFeedBack`) in `MyRides/Flow.tsx`.
*   **RTK Query (Redux Toolkit Query):**
    *   `@/typescript/state/server/searchApi.ts`: `useSearchMutation`, `useSearchResultsQuery` (in `ChooseRide`).
    *   `@/typescript/state/server/estimateApi.ts`: `useEstimateResultsQuery`, `useEstimateEstimateIdCancelPostMutation` (in `LookingForRides`).
    *   `@/typescript/state/server/followRide.ts`: `useFollowRideMutation` (in `FollowRide`).
    *   `@/typescript/state/server/bookingApi.ts`: `useGetBookingDetailsMutation` (in `MyRides` for auto legs).
    *   `@/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet.ts`: `useMultimodalJourneyIdBookingInfoGetMutation` (in `MyRides`).
    *   `@/api/integrations/rtk/MultimodalJourneyIdFeedbackGet.ts`: `useMultimodalJourneyIdFeedbackGetMutation` (in `MyRides`).
    *   Various mutations and queries in `RideConfirmed/Flow.tsx` for emergency contacts, ride sharing, stop editing (rentals), and booking list fetching.
*   **Animation:**
    *   `react-native-reanimated`: Used for progress bar animations in `LookingForRides/Flow.tsx`, UI animations (e.g., add tip) in `ChooseRide/Flow.tsx`, and bottom sheet related animations in `FollowRide/Flow.tsx`.
    *   `AnimatedPickupMarker`, `AnimatedMapPin.tsx`: Custom animated map markers.
*   **Local Persistence:**
    *   MMKV (`@/typescript/utils/MMKV.ts`): Used for storing `PROGRESS_START_TIME` in `LookingForRides/Flow.tsx` and `RIDE_CHECKS` in `RideConfirmed/Flow.tsx`.
*   **Utility Libraries:**
    *   `lodash.debounce`, `lodash.isNull`, `lodash.isUndefined`, `lodash.isEqual`.
    *   `react-native-haptic-feedback`: For haptic UX.
*   **Navigation (`@react-navigation/native`, `@react-navigation/stack`):** Used for all screen transitions.
*   **Context API:** Extensively used for sharing `mapRef`, `configManager`, `refsContext`, `drawerContext`, `notificationContext`, `animatedContextValues`.
*   **Analytics & Logging:**
    *   `CleverTap` (in `ChooseRide/Flow.tsx`).
    *   Custom `logEvent` and `logger` utilities.
*   **Firebase Services (beyond core auth):**
    *   `@react-native-firebase/remote-config`: Used in `RideConfirmed/Flow.tsx` for fetching `edit_location_configs`.
    *   Firebase Cloud Messaging (FCM): Implied for push notifications like `DRIVER_ASSIGNMENT` handled in `LookingForRides/Flow.tsx`.
*   **Chat Utilities (in `FollowRide/Flow.tsx`):** `getChannelId`, `chatHelpers`, `initialFollowRideChatSession`.
*   **Data Transformation Utilities (in `MyRides/Flow.tsx` and utils):** `convertTimestamp`, `mkDataForjourneySummary`, `mkDataTranscitLegRatingProp`, `getDistanceOrUnitForJourney`, `getlocationAPIEntitySourceOrDestination`, `getPriceOrCurrencyForJourney`, `getPlaceArea`, `formatTimeDifference`, `getCurrency`, `getTicketStatus`.

## API Interactions (Summary across Ride Booking)

*   **Location Predictions API:** Via `useLocationPredictions` hook.
*   **Place Details & Serviceability API:** Via ReScript utility `GetLocationAndServiceability.getLocationObjectAndServiceability`.
*   **Search API (RTK Query - `searchApi.ts`):** For initiating search and polling results (`ChooseRide`).
*   **Estimate API (RTK Query - `estimateApi.ts`):** For polling estimate results and cancelling estimates (`LookingForRides`).
*   **Booking Status API:** Polled by `useBookingStatus` hook (`LookingForRides`, `RideConfirmed`, `FollowRide`).
*   **Ride Stop Edit/Add API (RTK Query - for rentals in `RideConfirmed`):** `useRideBookingRideBookingIdEditStopPostMutation`, `useRideBookingRideBookingIdAddStopPostMutation`.
*   **Emergency Contacts & Settings API (RTK Query - in `RideConfirmed`):** `useLazyEmergencyContactsQuery`, `useProfileGetEmergencySettingsGetQuery`.
*   **Share Ride API (RTK Query - in `RideConfirmed`):** `useShareRidePostMutation`.
*   **Booking List API (RTK Query - in `RideConfirmed` & likely `MyRides/UI`):** `useRideBookingListGetLazyQueryWithAppName`.
    *   `useRideBookingListGetLazyQueryWithAppName`.
*   **Follow Ride API (RTK Query - `followRide.ts` in `FollowRide`):** `useFollowRideMutation`.
*   **Multimodal Journey Info API (RTK Query - in `MyRides`):** `useMultimodalJourneyIdBookingInfoGetMutation`.
*   **Multimodal Journey Feedback API (RTK Query - in `MyRides` & `MyBookingDetails`):** `useMultimodalJourneyIdFeedbackGetMutation`.
*   **Booking Details API (RTK Query - in `MyRides` for auto legs):** `useGetBookingDetailsMutation`.
*   **Feedback Submission API (RTK Query - in `MyBookingDetails`):**
    *   `useRateRideMutation`.
    *   `useSubmitFeedbackMutation`.
*   **Actual Booking Submission API:** The exact point of booking submission (transition from selecting an estimate/quote to a confirmed `bookingId`) needs to be pinpointed. It might be part of the `searchApi`, `estimateApi`, or a dedicated booking API endpoint called after `ChooseRide`.

## Data Management Notes

*   **ReScript Interop:** A key pattern is using TypeScript for UI flows and Redux state, while delegating specific computations or utility functions (like location processing, caching) to ReScript modules (`.bs.js` or `.gen.tsx` files).
*   **Centralized Rule Engine:** For complex journey state display (especially in `LiveJourneyDetail`, `LiveJourneyOverview`), the patterns in `features/multimodalEngine/patterns_overview.md` are relevant.
*   **API Response Caching:** Primarily handled by RTK Query. Client-side caching for recents is done via `LocationObjectCaching.bs`.

*(This document provides a consolidated view of technologies across several ride booking screens. Further details for screens like `MyBookingDetails` would be added upon their analysis.)*
