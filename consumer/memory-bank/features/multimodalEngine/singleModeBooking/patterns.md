# Multimodal Engine: Single Mode Booking within Multimodal Journeys - Patterns

This document outlines system patterns related to how users make choices and confirm bookings for individual legs within a proposed multimodal journey, primarily based on interactions within screens like `JourneyInfoScreen/Flow.tsx`.

## Overview

When a user is presented with a multimodal journey plan (e.g., Walk -> Auto -> Metro), they often have the ability to customize or confirm individual "bookable" legs, such as selecting a specific vehicle tier for an auto ride, or confirming a ticket for a metro leg. This constitutes a "single mode booking" decision within the larger multimodal context.

## Core Patterns (derived from `JourneyInfoScreen/Flow.tsx`)

1.  **Leg Selection & Option Display:**
    *   The user is typically shown a list or sequence of legs for their journey.
    *   For legs that are bookable or have options (e.g., an auto leg, a specific bus service that requires ticketing), the UI provides affordances to interact with that leg.
    *   **Action:** User taps on a specific leg or an "options" button for that leg.
2.  **Fetching/Displaying Options for a Single Leg:**
    *   **`useVehicleTierOptions` Hook (for Auto/Taxi legs):**
        *   When an auto/taxi leg is selected for modification (`handleChangeVehicle` or `handleShowVehicleTierOptions` in `JourneyInfoScreen`), this hook is responsible for fetching available vehicle tiers/options for that specific leg (e.g., different car types, ETAs, prices).
        *   It presents these options to the user, often in a modal (`vehicleOptionsModalRef`).
        *   The user selects a tier, and `setSelectedVehicleTier` updates the choice.
        *   `handleChangeVehicleClass` might be called to confirm the change, potentially triggering an API call to update the journey plan with the new selection for that leg.
    *   **Ticketable Public Transport Legs:**
        *   For legs like bus, metro, or train that require ticketing, the `JourneyInfoScreen` (via `useJourneyConfirmation` hook) handles the `handleBookTicket` action. This would involve:
            *   Displaying fare information, potentially allowing selection of ticket types (adult/child via `paymentUpdateOrderApiCall`).
            *   Initiating an API call to book the ticket for that specific leg.
3.  **Updating Journey Plan with Single Leg Choice:**
    *   After the user makes a selection for a single leg (e.g., chooses a vehicle tier, confirms a ticket purchase):
        *   The `journeyInfoData` (managed by `useJourneyInfoPolling` or similar) is updated to reflect this choice. This might involve an API call to the backend to update the overall journey plan with the specifics of the selected leg.
        *   The UI refreshes to show the updated details for that leg and potentially adjusted overall journey cost/time.
4.  **Confirmation of Overall Journey:**
    *   Even after customizing individual legs, the user typically needs to confirm the entire multimodal journey plan via `handleConfirmJourney` (from `useJourneyConfirmation` hook). This final confirmation might trigger further backend processes to lock in all selected legs.
5.  **Skipping/Switching Legs (`useSwitchLegs` Hook):**
    *   Users might also have the option to entirely skip a bookable leg (`handleSkipRide`) or switch its mode (`switchLegMode`), which then re-evaluates the journey. If a leg is switched to another bookable mode (e.g., from bus to auto), the "single mode booking" pattern for that new mode (e.g., selecting an auto tier) would then apply.

## UI/Flow Considerations

*   **Modals/Bottom Sheets:** Options for individual legs (vehicle tiers, ticket details) are often presented in modals or bottom sheets (`vehicleOptionsModalRef`, `rideOptionModalRef`, `autoInfoModalRef`).
*   **Clear Indication of Selected Options:** The UI must clearly reflect the user's choices for each leg.
*   **Impact on Overall Journey:** Changes to a single leg (e.g., cost, time) should be reflected in the summary of the entire multimodal journey.

This pattern allows for flexibility within a structured multimodal plan, giving users control over individual bookable segments.
