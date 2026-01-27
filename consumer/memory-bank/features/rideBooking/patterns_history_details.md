# Ride Booking: Ride History & Details Patterns

This document outlines system patterns related to viewing past and upcoming ride/journey history and their detailed information, primarily based on `src-v2/screens/MyRides/Flow.tsx` and its interaction with the `myRideDetails` screen.

## Overview

The `MyRides` screen serves as a list for users to access their past and ongoing multimodal journeys and single auto rides. Selecting an item navigates to a more detailed view (`myRideDetails` screen).

## Core Flow & State Management (`MyRides/Flow.tsx`)

1.  **Displaying Ride/Journey List:**
    *   The `MyRides/UI.tsx` component is responsible for fetching and rendering the primary list of rides and journeys. (The `MyRides/Flow.tsx` itself doesn't fetch the initial list but provides interaction handlers).
    *   The UI likely uses an RTK Query hook (e.g., `useRideBookingListGetQueryWithAppName`, which is imported in `RideConfirmed/Flow.tsx` for a different purpose but indicates its availability) to fetch paginated ride/journey history.
    *   The `MyRides/Flow.tsx` provides an `isActiveRide` callback to the UI, which uses `getTicketStatus` utility to determine if a journey is currently "live" based on its status and leg information.
2.  **Selecting a Multimodal Journey for Details:**
    *   When a user selects a multimodal journey from the list, the UI dispatches a `GET_FULL_JOURNEY_SUMMARY` action with the `journeyId` and potentially pre-fetched `journeyInfoResp`.
    *   The `handleFullJourneySummary` function in `MyRides/Flow.tsx` is invoked:
        *   It calls `useMultimodalJourneyIdBookingInfoGetMutation` (`getJourneyInfoApiCall`) to fetch the complete `journeyInfoResp` if not already provided.
        *   It calls `useMultimodalJourneyIdFeedbackGetMutation` (`getJourneyRatingsApiCall`) via `handleJourneyRatings` to fetch any user feedback/ratings for this journey, storing it in the Redux `journey` slice (`setJourneyFeedBack`).
        *   It then constructs a `JourneyDetailCardProps` object using the `createJourneyDetailProps` helper. This helper aggregates and transforms data from `journeyInfoResp` and `journeyRatings` using various utility functions:
            *   `convertTimestamp`: For date/time formatting.
            *   `mkDataForjourneySummary`, `mkDataTranscitLegRatingProp`: For preparing summary and rating data structures.
            *   `getlocationAPIEntitySourceOrDestination`, `getPlaceArea`: For extracting and formatting location names.
            *   `getPriceOrCurrencyForJourney`, `getCurrency`: For fare information.
            *   `getDistanceOrUnitForJourney`, `formatDistanceWithUnit`: For distance information.
            *   `formatTimeDifference`: For journey duration.
        *   Finally, it navigates to the `myRideDetails` screen, passing the `journeyDetailCard` props.
3.  **Selecting a Single Auto Ride (within a Multimodal Journey Detail View):**
    *   The `myRideDetails` screen, when displaying a multimodal journey, can have an `autoClickAction` associated with individual auto legs.
    *   If an auto leg is clicked, `handleAutoClickAction` (defined in `MyRides/Flow.tsx` and passed down) is called with the auto `bookingId` and `legOrder`.
        *   It uses `useGetBookingDetailsMutation` (`fetchBookingDetails`) to get specific details for that auto booking.
        *   It constructs `RideType` props using `getPropsFromBookingDetails`.
        *   It then pushes the `myRideDetails` screen again, this time populated with `bookingDetailCard` props for the auto ride, and `subAutoDetails` to indicate it's a leg of a larger journey.
4.  **Handling Empty State:**
    *   If the user has no rides, the UI likely displays a prompt.
    *   `onBookYourFirstRideButton` callback in `MyRides/Flow.tsx` handles the action for this prompt:
        *   Sets Redux `activeInput` to `SearchInput.Destination`.
        *   Sets `bottomSheetStage` to `Search`.
        *   Resets navigation to the `homeTypeScript` screen to initiate a new search.

## Key Technical Decisions / Patterns

*   **RTK Query for Data Fetching:** Mutations are used to fetch specific journey/booking details on demand (`useMultimodalJourneyIdBookingInfoGetMutation`, `useMultimodalJourneyIdFeedbackGetMutation`, `useGetBookingDetailsMutation`). The list itself is likely fetched by a query hook in the UI layer.
*   **Hierarchical Detail Presentation:** The system supports drilling down from a multimodal journey to the details of its individual auto legs, reusing the `myRideDetails` screen with different prop structures.
*   **Data Transformation Utilities:** A suite of utility functions is used to parse, format, and aggregate data from API responses into view-model like structures (`JourneyDetailCardProps`, `RideType`) suitable for the UI.
*   **Redux for Ancillary State:** While RTK Query handles fetching, Redux (`journey` slice) is used to store fetched journey feedback.
*   **Navigation for Detail Views:** React Navigation's `push` is used to show details, allowing users to go back up the hierarchy.

This flow ensures that users can access a comprehensive history of their multimodal journeys and individual rides, with detailed information available on demand.

## Booking Detail View & Feedback (`MyBookingDetails/Flow.tsx`)

This component (`BookingDetailsFlow`) serves as the detailed view for a specific booking, whether it's a standalone ride or a leg of a multimodal journey. It's also responsible for handling user feedback and ratings for the completed ride/leg.

1.  **Data Reception & Initialization:**
    *   Receives `bookingDetailCard` (for auto rides/legs) or `journeyDetailCard` (for multimodal journeys) via route parameters (`route.params`). This data is typically prepared and passed by the `MyRides` flow or when drilling down into a journey leg.
    *   `bookingDetails` local variable is extracted from `routeParams.bookingDetailCard?.bookingDetail`.
    *   `rideId` is derived from `bookingDetails`.
    *   Local state `bookingDetailMiddle` is initialized to hold transformed data for UI display, using helpers like `getFormattedRideDistance`, `formatTimeDifference`, `getFare`.
2.  **Feedback & Rating System:**
    *   **State Management (Redux `ride` & `journey` slices):**
        *   `selectRatingScreenWithId`, `setRatingScreen`, `setRating`, `selectRatingWithId`, `selectFeedbackWithId`, `selectSubmitApiDataWithId`, `selectIsFavoriteWithId` manage the feedback UI state (e.g., showing rating stars, then feedback text input) and submitted data for a given `rideId`.
        *   For multimodal journey legs (`subAutoDetails` present), `selectJourneyFeedBack` and `setSubAutoJourneyFeedBack` (from `journey` slice) are used to manage ratings specific to that leg (e.g., `isExperienceGood`).
    *   **UI Interaction & Modals:**
        *   Feedback modals/bottom sheets are presented using refs from `useRefsContext` (`bookingDetailsFeedbackRef`, `journeyDetailsFeedbackRef`, `subAutoDetailsFeedbackRef`, `reviewModalRef`).
        *   `handleAddFeedBack` action in `mbdDispatch` triggers the presentation of the appropriate modal.
    *   **API Submissions (RTK Query):**
        *   `useRateRideMutation` (`rateRides`): Submits the star rating for a standard ride.
        *   `useSubmitFeedbackMutation` (`submitFeedBack`): Submits textual feedback reasons for a standard ride.
        *   `useMultimodalJourneyIdJourneyFeedbackPostMutation` (`submitFeedbackApiCall`): Submits feedback for multimodal journey legs. This includes `isExperienceGood` and potentially textual feedback, structured as `journeyFeedBackForm`.
        *   `handleApiCallWithOfflineFallback` custom hook wraps these mutation calls, suggesting offline support for feedback submission.
    *   **Workflow:**
        *   User gives a star rating (`rateRide` action -> updates Redux, changes `ratingScreen` state).
        *   User provides textual feedback (if applicable).
        *   `reviewAndFeedbackApiCall` (for standard rides) or `handleSubAutoFeedback` (for journey legs) submits the data.
        *   On successful submission, Redux state is updated, and modals are closed.
3.  **Displaying Details:**
    *   The component conditionally renders based on whether `journeyDetailCard` or `bookingDetailCard` is provided in route params.
    *   Extensive use of utility functions (e.g., from `./utils.ts`, `@/typescript/utils/fareEntityHelper.ts`) to format data like distance, time, fare components for display.
4.  **User Actions:**
    *   **Copy Ride ID (`handleCopyToClipBoard`):** Copies the short ride ID to the clipboard.
    *   **Help & Support (`handleGoToHelpAndSupport`):** Navigates to the help screen.
    *   **Driver Invoice (`handleGoToDriverInvoice`):** Navigates to the invoice screen.
    *   **Navigate Home (`alternateNavigateToHome`):** Clears session data, resets IDs, and navigates to the home screen, typically after feedback submission.
5.  **Context & Hooks:**
    *   Uses `useSafeAreaInsets` for layout adjustments.
    *   `useConfigContext` for user language strings.
    *   `useAppDispatch`, `useAppSelector` for Redux interactions.
    *   `useNavigation`, `useRoute` for navigation context.

### Key Technical Aspects for Booking Details & Feedback:
*   **Dual Prop Handling:** Manages display logic based on whether it's showing a full journey or a single booking/leg.
*   **Comprehensive Feedback System:** Supports star ratings, textual feedback, and specific feedback for multimodal journey legs.
*   **Offline Feedback Capability:** Implied by the use of `useApiWithOfflineFallback`.
*   **State-Driven Modals:** Feedback UI is presented in modals controlled by Redux state and refs.
*   **Data Transformation for UI:** Relies on various utility functions to prepare data for presentation.
