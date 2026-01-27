# Multimodal Engine: Single Mode Booking within Multimodal Journeys - Technical Context

This document outlines specific technical details for how single mode booking choices are handled within a larger multimodal journey, primarily based on `src-v2/multimodal/screens/JourneyInfoScreen/Flow.tsx`.

## Core Technologies & Libraries

*   **Custom Hooks (from `JourneyInfoScreen/hooks/`):**
    *   **`useVehicleTierOptions`:**
        *   Manages fetching vehicle tier options for a specific leg (e.g., an auto ride) using an API call (details of the API endpoint are encapsulated within the hook).
        *   Stores `vehicleTierOptionsResp`, `selectedVehicleTier`, `isLoadingVehicleOptions`, `isFetchingVehicleTierOptions`.
        *   Provides `handleChangeVehicleClass` to confirm a tier selection, which likely triggers another API call to update the journey plan.
        *   Uses `vehicleOptionsModalRef` (from `RefsContext`) to present options.
    *   **`useJourneyConfirmation`:**
        *   Handles `handleBookTicket` for public transport legs. This involves API calls to book tickets.
        *   Manages `paymentOrder` state and updates via `useMultimodalJourneyIdPaymentUpdateOrderPostMutation` (debounced) for adult/child ticket quantities.
        *   Handles `handleConfirmJourney` for the overall multimodal plan.
    *   **`useSwitchLegs`:**
        *   Provides `handleChangeVehicle` which is a precursor to `useVehicleTierOptions` being invoked for a leg.
        *   Allows `switchLegMode` which might change a leg to a different bookable type, thus re-initiating a single-mode booking consideration for that new leg.
*   **RTK Query (Redux Toolkit Query):**
    *   `useMultimodalJourneyIdPaymentUpdateOrderPostMutation` (from `@/api/integrations/rtk/MultimodalJourneyIdPaymentUpdateOrderPost.ts`): Used by `useJourneyConfirmation` (via `JourneyInfoScreen`) to update ticket quantities.
    *   Other RTK Query hooks are implicitly used within `useVehicleTierOptions` (to fetch tiers), `useJourneyConfirmation` (to book tickets/confirm journey), and `useSwitchLegs` (to update journey plan after leg switches/vehicle changes).
*   **State Management (Redux Toolkit & Local State):**
    *   **Redux (`search` slice):** `currentJourney`, `selectedPricingItems` (for a leg if it's an auto/taxi), `selectedModesFilter` are relevant.
    *   **Local State (within `JourneyInfoScreen` and its hooks):** States like `vehicleLegToSwitch`, `selectedVehicleTier`, `loadingDataForLeg`, `paymentOrder` are managed to control the UI and flow for single leg customization.
*   **UI Components & Modals:**
    *   `vehicleOptionsModalRef`, `rideOptionModalRef`, `autoInfoModalRef` (from `RefsContext`) are used to present choices and information related to single leg booking decisions.
*   **Data Transformation & Utilities:**
    *   Functions within `JourneyInfoScreen/Flow.tsx` or its helpers transform data for display and API calls related to single leg choices (e.g., preparing payload for `paymentUpdateOrderApiCall`).

## API Interactions for Single Leg Customization/Booking

1.  **Fetch Vehicle Tiers/Options:**
    *   Triggered by `useVehicleTierOptions` when a user wants to change options for a ride-hailing leg.
    *   API endpoint details are encapsulated within the hook.
2.  **Update Journey with Selected Vehicle Tier:**
    *   Triggered by `handleChangeVehicleClass` in `useVehicleTierOptions`.
    *   API call to update the journey plan with the chosen vehicle tier for that specific leg.
3.  **Book Public Transport Ticket:**
    *   Triggered by `handleBookTicket` in `useJourneyConfirmation`.
    *   API call to the ticketing system for the specific PT leg.
4.  **Update Ticket Quantity (Payment Order):**
    *   Triggered by user changing adult/child counts for a ticketable leg.
    *   Uses `useMultimodalJourneyIdPaymentUpdateOrderPostMutation`.
5.  **Update Journey after Leg Switch/Skip:**
    *   If `useSwitchLegs` results in a change to a bookable leg, an API call is made to update the overall journey plan.

The "single mode booking" within a multimodal journey is thus a series of interactions focused on a specific leg, leveraging dedicated hooks and API calls to customize that leg before the entire journey is confirmed.
