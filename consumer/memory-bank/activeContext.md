# Active Context

## Current Focus

*   Completed a comprehensive refactoring of the memory bank structure to be more modular and feature-oriented.
*   Populated the new structure with detailed, codebase-grounded information for several key features by analyzing relevant `Flow.tsx` files.

## Recent Changes

*   **Memory Bank Refactoring:**
    *   Restructured the `memory-bank/` directory with new top-level folders: `features/`, `systemPatterns_general/`, and `techContext_general/`.
    *   Original core files (`productContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`) were transformed into `_overview.md` files, linking to more granular documents.
    *   Created dedicated subdirectories and documentation files within `memory-bank/features/` for:
        *   `authentication/` (patterns.md, tech.md)
        *   `rideBooking/` (patterns_search.md, patterns_allocation.md, patterns_option_selection.md, patterns_tracking.md, patterns_history_details.md, tech.md)
        *   `homeScreen/` (patterns.md, tech.md)
        *   `multimodalEngine/` (patterns_overview.md, tech.md, progress.md)
        *   `favourites/` (patterns.md, tech.md)
        *   `miscFeatures/` (placeholder files)
*   **Codebase Analysis for Memory Bank Content:**
    *   **Authentication:** Analyzed `src-v2/screens/MyProfile/`, `UpdateMyProfile/`, `ProfileTab/` and clarified that initial auth is TypeScript-based, not legacy ReScript UI. Updated `features/authentication/` docs accordingly.
    *   **Ride Booking:**
        *   Analyzed `src-v2/screens/Search/Flow.tsx` for search initiation, location prediction, and serviceability checks.
        *   Analyzed `src-v2/screens/ConfirmPickup/Flow.tsx` for precise location pinning, special location/gate handling, and hotspot interactions.
        *   Analyzed `src-v2/screens/LookingForRides/Flow.tsx` for ride search animation, polling for booking status/estimates, boost logic, and driver assignment handling.
        *   Analyzed `src-v2/screens/ChooseRide/Flow.tsx` for displaying ride options, "Book Any" logic, smart tips, and multimodal journey selection.
        *   Analyzed `src-v2/screens/RideConfirmed/Flow.tsx` for active ride management, in-ride actions (edit pickup/destination, chat, safety), ride checks, and lifecycle event handling (completion, cancellation, reallocation).
        *   Analyzed `src-v2/screens/FollowRide/Flow.tsx` for patterns related to following another user's shared ride.
        *   Analyzed `src-v2/screens/MyRides/Flow.tsx` and `src-v2/screens/MyBookingDetails/Flow.tsx` for ride history display, navigation to details, and feedback submission.
    *   **Home Screen:** Analyzed `src-v2/screens/HomeScreen/Flow.tsx` for its role as a central orchestrator, bottom sheet management, initial location/serviceability logic, and initiation of search flows.
    *   **Multimodal Engine:**
        *   Analyzed `src-v2/multimodal/screens/LiveJourneyDetail/Flow.tsx` and `LiveJourneyOverview/Flow.tsx` for their use of the centralized Journey Rule Engine and specific data handling for live tracking.
        *   Analyzed `src-v2/multimodal/screens/JourneyInfoScreen/Flow.tsx` for patterns related to displaying multimodal journey plans, leg customization, journey confirmation, and ticket booking.
        *   Created dedicated documentation for "Single Mode Booking within Multimodal Journeys" in `memory-bank/features/multimodalEngine/singleModeBooking/` based on `JourneyInfoScreen` analysis.
    *   **Favourites:** Analyzed `src-v2/multimodal/screens/Favourites/Flow/AddFavourite.tsx` and `ManageFavourite.tsx` for adding and managing favourite locations.
*   **Centralized Rule Engine (Previous Focus - Now Documented):**
    *   The previously completed refactoring of `LiveJourneyDetail/Flow.tsx` and `LiveJourneyOverview/Flow.tsx` to use the centralized rule engine in `src-v2/multimodal/rules/` is now documented within `memory-bank/features/multimodalEngine/patterns_overview.md` and `memory-bank/features/multimodalEngine/tech.md`. Documentation for `JourneyInfoScreen` and `singleModeBooking` also refers to and builds upon this engine's concepts where applicable.

## Next Steps

*   Review the newly refactored and populated memory bank for consistency and completeness.
*   Identify and document other key features under `memory-bank/features/miscFeatures/` or new feature directories by analyzing the codebase (e.g., Referrals, Safety, Invoice, Rentals).
*   Continuously update the memory bank as new features are developed or existing ones are modified.
*   Awaiting new development tasks.

## Active Decisions & Considerations

*   **TypeScript First for UI:** All new UI development (screens, components) must be done in TypeScript within the `src-v2` directory.
*   **Screen Architecture (UI/Flow Separation & Interaction):** New screens in `src-v2` **must** follow the two-file pattern:
    *   **UI File (e.g., `ScreenUI.tsx`):** Handles rendering, UI animations. Receives state and `mpDispatch` via props. Dispatches actions to the Flow file using `mpDispatch(createAction(...))`.
    *   **Flow File/Hook (e.g., `ScreenFlow.tsx` or `useScreenFlow.ts`):** Manages all state (local, Redux, React Query), business logic, API calls. Defines a `resolver` for actions dispatched by `mpDispatch`. Passes necessary state and `mpDispatch` function as props to the UI file.
*   **ReScript for API Types Only:** ReScript's role is strictly limited to defining types for API interactions. Legacy ReScript UI code in `src/` should not be extended or used for new features.
*   The enforcement of custom primitive components from `src-v2/primitives/` is a key pattern to follow.
*   **UI Component Provision:** All UI component files will be provided. The primary task is to create UI screens by utilizing these components, along with their corresponding Flow files and Types. No coding of the individual UI components themselves is required.
*   **Direct Imports:** There is no need to create `index.ts` files for barrel exports. Components, Flows, UI files, and Types can be imported directly from their file paths.

## Important Patterns & Preferences

*   **Primary Language (UI & Logic):** TypeScript (in `src-v2/`).
*   **API Type Definition Language:** ReScript (likely in `src/api/`).
*   **Screen Development Framework (`src-v2/screens/`):**
    *   Strict separation of concerns: UI file for presentation, Flow file/hook for logic/state.
    *   **Interaction Pattern:** UI dispatches actions via `mpDispatch(createAction(...))`; Flow file resolves actions, manages state, and passes data back to UI via props.
*   **Styling:** TailwindCSS via `twrnc`.
*   **Linting:** Strict ESLint rules for TypeScript (functional programming, immutability, no-any, specific import restrictions). ReScript formatter for ReScript.
*   **State Management:** Redux Toolkit, React Query.
*   **Folder Structure:**
    *   All new UI: `src-v2/` (TypeScript), organized by feature for screens and components.
    *   API Types: ReScript (likely `src/api/`).
    *   Legacy UI: `src/` (ReScript, not for new development).
*   **Import Strategy:** Direct imports are preferred. No `index.ts` files for aggregating exports.
*   **Data Flow:** Follows a pattern of UI interaction -> State Management (Redux/React Query) -> API calls (using ReScript types) -> Backend -> UI update.
*   **Path Aliases:** Used extensively (e.g., `@/*`, `@/src-v2/*`).
*   **Centralized Rule Engine Pattern:**
    *   A new directory `src-v2/multimodal/rules/` has been established.
    *   `JourneyRulesTypes.ts` defines common types for rules, handlers, and screen-specific outputs.
    *   `JourneyRuleHelpers.ts` contains utility functions shared across rule logic for different screens.
    *   `JourneyRules.ts` holds the `journeyRules` array. Handlers within these rules are screen-aware (via `params.screenType`) and delegate to screen-specific helper functions to generate the final UI data structure.
    *   Screen-specific `Flow.tsx` files (e.g., `LiveJourneyDetail/Flow.tsx`, `LiveJourneyOverview/Flow.tsx`) now import and use these centralized rules.
    *   Screen-specific helper files (e.g., `LiveJourneyDetail/FlowHelpers.ts`, `LiveJourneyOverview/FlowHelpers.ts`) contain the logic to build the actual UI props for their respective screens, called by the centralized rule handlers.

## Learnings & Insights

*   The project is a complex React Native application with a significant existing codebase, now with a clear directive for future development (TypeScript in `src-v2` for UI, ReScript for API types).
*   Strong emphasis on code quality and specific development patterns (e.g., custom primitives, functional style in TypeScript, type-safe API layers with ReScript).
*   The `babyconfig` alias suggests a shared configuration or library from an external source, potentially part of a larger monorepo structure.
*   Clear separation of concerns: UI logic in TypeScript, API contract definitions in ReScript.
*   **Strict Type Safety - No `any` or Unnecessary Casts**:
    *   The use of `as any` is strictly forbidden as it undermines TypeScript's type safety and can lead to runtime errors.
    *   Explicit type assertions (e.g., `value as SpecificType`) should be minimized. Wherever possible, rely on TypeScript's type inference, especially when working with discriminated unions (e.g., checking a `TAG` property). If a cast seems necessary, it might indicate a place where a type guard or a more specific utility function could be more appropriate.
    *   For complex data access (e.g., deeply nested optional properties from API responses or discriminated union types like `legExtraInfo`), create dedicated type-safe utility/helper functions. These functions should encapsulate the logic for safely navigating and extracting data, using TypeScript's control flow analysis based on type guards (like checking a `TAG` property) to narrow down types, and also checking for `undefined` or `null` values. This approach was refined for `LiveJourneyOverview` to handle `legInfo` and `legExtraInfo` data extraction in `LiveJourneyUtils.ts`, removing previous explicit casts.
    *   When dealing with errors in `catch` blocks, prefer typing them as `unknown` and then performing type checks or assertions rather than defaulting to `any`.
*   **Type Exploration**: When dealing with generated types (e.g., from ReScript via `genType`), it's often necessary to inspect multiple related type definition files to understand the full structure of complex objects and their variants (e.g., `LegExtraInfo.gen.tsx` and its specific sub-type files like `BusLegExtraInfo.gen.tsx`). This detailed exploration is key to creating type-safe utility functions that leverage TypeScript's inference capabilities.
*   **Redux State Access**:
    *   Always use dedicated selectors (e.g., `selectJourneyLegs` from `journey.ts`, `selectCurrentLocation` from `session.ts`) provided by Redux slices to access state. Avoid direct access to state properties like `state.journey.journeys[id].legsStatus` or `state.cache.someData`.
    *   This ensures that state access is centralized, maintainable, and can be easily refactored or memoized if needed.
*   **Utility Hooks for Data and Logic**:
    *   Utilize specialized hooks (e.g., `usePublicTransportUtils`, `useRiderLocation`) that encapsulate related data fetching (including from global caches like `globalCache`), state updates, and utility functions.
    *   Other parts of the application (e.g., feature hooks like `useJourneyTrackingData`) should consume these specialized hooks to obtain data and functionality, rather than duplicating logic or directly accessing underlying data sources managed by these utility hooks. For instance, `useRiderLocation` manages rider location updates and provides the current location, which other hooks should use directly. Similarly, `usePublicTransportUtils` provides access to public transport data (like stations and route stops) and related helper functions.
*   **Data Flow with Specialized Hooks**: Hooks like `useRiderLocation` may internally update Redux state (e.g., `dispatch(setCurrentLocation(...))`) while also returning the relevant piece of data (e.g., `latLong`). Consuming hooks should prefer the direct return value if it meets their needs, promoting encapsulation, even if the data is also available via a Redux selector updated by the specialized hook.
