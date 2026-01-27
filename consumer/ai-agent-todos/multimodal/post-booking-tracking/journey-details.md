You previously implemented the `LiveJourneyOverview` screen by:

- Fetching journey-level data using the `useJourneyTrackingData` hook
- Transforming the data into displayable units using the design reference:
  👉 https://www.notion.so/Iternary-Card-Documentation-20fefda29f0a8166aff3d09f7f4310c2?pvs=13
- Tracking implementation progress in:
  👉 ai-agent-todos/multimodal/post-booking-tracking/journey-overview.md

✅ Now, your task is to define and implement a **similar process** for the **Live Journey Details** screens corresponding to each active state shown in the overview.

---

### 🧩 Objective

For each journey leg and state shown in the overview, implement the corresponding **detailed view** (zoomed-in screens).

Start by:
- Reading and understanding the UI and component structure from the Notion spec:
  👉 https://www.notion.so/Live-Journey-Zoomed-in-View-Components-States-20fefda29f0a81838d73e758e2140d46?pvs=13
- Additional summarized mapping for overview and details: https://www.notion.so/Summary-Live-Journey-Tracker-210efda29f0a80e3a734e8909d648c14
- All components required for the UI are inside this folder src-v2/multimodal/screens/NewLiveJourney


- Use this to define:
  **transform plan**:  
     ➕ Document which parts of the `useJourneyTrackingData` output or underlying API responses need to be mapped into props required by each detailed screen component.


---

### 📁 Notes

- The detailed UI components already exist. You don't need to rewrite them.
- Your focus is on:
  - Building a plan for transform logic (data-to-props)
  - Identifying reuse or extension of existing types/hooks
  - Tracking the implementation in a clear, structured format
  - Create a single screen both Flow and UI file inside `LiveJourneyDetail` with all component rendering on basis of the state. Modularised the code and avoid repeation of code, no `as any` use anywhere.

📌 Ensure the plan aligns closely with the already completed `LiveJourneyOverview` implementation for consistency and reuse.

---

## 📝 Implementation Plan for Live Journey Details

### 1. Understanding the Core Requirement

The goal is to create a new screen, `LiveJourneyDetail`, which will display detailed views for the **current active journey leg**. This screen will utilize existing UI components from `src-v2/multimodal/screens/NewLiveJourney/` and the primary focus will be on the data transformation logic to populate these components and the rendering logic within the new screen.

### 2. File Structure

The following files will be created within a new directory `src-v2/multimodal/screens/LiveJourneyDetail/`:

*   **`LiveJourneyDetail/UI.tsx`**: This React component will be responsible for rendering the UI of the detailed journey view. It will receive all necessary data and dispatch functions as props from the Flow file.
*   **`LiveJourneyDetail/Flow.tsx`**: This file will house the `useLiveJourneyDetailFlow` hook. This hook will manage the screen's logic, state (if any beyond what's derived from props/hooks), and data transformations. It will consume data primarily from the `useJourneyTrackingData` hook.
*   **`LiveJourneyDetail/Types.ts`**: This file will define any TypeScript types specifically needed for the `LiveJourneyDetail` screen. This includes the props interface for `UI.tsx` and any internal types that might be used within `Flow.tsx`. Efforts will be made to reuse and extend existing types from `useJourneyTrackingData` and the Notion documents.
*   **`LiveJourneyDetail/Utils.ts` (Optional)**: If the data transformation logic becomes complex and can be beneficially isolated, utility functions will be placed here. This follows the pattern observed in `LiveJourneyOverview` with `LiveJourneyUtils.ts`.

### 3. Data Source and State Management

*   **Primary Data Source**: The `useJourneyTrackingData` hook will serve as the primary source of all journey-related information.
*   **Navigation Parameters**: The `LiveJourneyDetail` screen will expect a `journeyId` to be passed via navigation parameters. This `journeyId` will be used to fetch the relevant journey data.
*   **State Management in `Flow.tsx`**:
    *   The `useLiveJourneyDetailFlow` hook will:
        *   Accept `journeyId` as an input (likely from navigation props).
        *   Fetch the complete journey data using `useJourneyTrackingData(journeyId)`.
        *   Identify the **`currentLeg`** directly from the output of `useJourneyTrackingData` (e.g., based on `currentLegIndex` or similar logic already present in the hook's returned data structure).
        *   Determine the current `userState`, `transitMode` of the `currentLeg`, and `vehicleState` based on the data from `useJourneyTrackingData` and the logic defined in the "Summary - Live Journey Tracker" Notion document.
        *   Perform the necessary transformations of this raw data into the specific props required by the detailed view components (`PreboardingState` or `InTransitState` and their nested components).
        *   Provide these transformed props to the `LiveJourneyDetail/UI.tsx` component.

### 4. Core Detailed View Components

Based on the "Live Journey Zoomed-in View Components & States" Notion document and provided clarifications, the primary components to be rendered conditionally within `LiveJourneyDetail/UI.tsx` are:

*   **`PreboardingState` Component**: Used for pre-boarding phases of public transport legs (Bus, Metro, Train) and also to display details for `WALK` legs.
    *   **Props**: `PreboardingStateProps`
        *   `status: 'starting' | 'waiting' | 'transitIsOneStopAway' | 'transitArrived'`
        *   `detailedLiveHeaderProps: DetailedLiveHeaderProps`
        *   `currentLegSplitUpProps: CurrentLegSplitUpProps`
        *   `miniBusTrackingProps: MiniBusTrackingProps` (conditionally rendered, e.g., only for 'Bus' mode if applicable)
        *   `additionalBusInfoProps: AdditionalBusInfoProps` (conditionally rendered)
*   **`InTransitState` Component**: Used when the user is actively in transit on a public transport leg (Bus, Metro, Train).
    *   **Props**: `InTransitStateProps`
        *   `status: 'InTransit' | 'DestinationReached'`
        *   `detailedLiveHeaderProps: DetailedLiveHeaderProps`
        *   `miniBusTrackingProps: MiniBusTrackingProps` (conditionally rendered)
*   **`WALK` Mode Details**: These will be integrated into the `PreboardingState` component. For example, `DetailedLiveHeaderProps` can show titles like "Walk to X", and `CurrentLegSplitUpProps` can detail the walking segment.
*   **`TAXI` Mode Details**: Detailed views for `TAXI` mode are **not in scope** for this implementation.

### 5. Transform Plan (Data-to-Props Mapping)

The core of the implementation lies in `LiveJourneyDetail/Flow.tsx`, specifically in transforming data from `useJourneyTrackingData` (focused on the `currentLeg`) into the props required by `PreboardingState` or `InTransitState`.

**Key Transformation Logic Points:**

*   **Determining Main View State (`PreboardingState` vs. `InTransitState`)**: This will be decided based on the `userState` (e.g., `WALK`, `WAITING` → `PreboardingState`; `INVEHICLE` → `InTransitState`) and `transitMode` of the `currentLeg`.
*   **Mapping to `PreboardingStateProps.status`**:
    *   `'starting'`: Typically when `userState` is `WALK` (to a stop) and the associated `vehicleState` (if applicable, e.g., for a bus leg) is `VEHICLEISARRIVING`.
    *   `'waiting'`: When `userState` is `WAITING` at a stop, and `vehicleState` is `VEHICLEISARRIVING` or `VEHICLEALMOSTARRIVED`.
    *   `'transitIsOneStopAway'`: When `userState` is `WAITING`, and `vehicleState` is `VEHICLEALMOSTARRIVED` (specifically for Bus, as per Notion documentation).
    *   `'transitArrived'`: When `userState` is `WAITING` (or ready to board), and `vehicleState` is `VEHICLEARRIVED`.
*   **Mapping to `InTransitStateProps.status`**:
    *   `'InTransit'`: When `userState` is `INVEHICLE`, and `vehicleState` is `RIDESTARTED` or `RIDECLOSETODESTINATION`.
    *   `'DestinationReached'`: When `userState` is `INVEHICLE`, and `vehicleState` is `RIDEREACHEDDESTINATION`.
*   **Mapping to `DetailedLiveHeaderProps`**:
    *   `isInTransitHeader`: Boolean, true if `InTransitState` is the active view.
    *   `title`: Dynamically generated based on leg type, destination, and current status (e.g., "Walk 200m to Bus Stop", "Bus to Majestic", "You have arrived").
    *   `icon`: Determined by the `transitMode` of the leg (e.g., Walk, Bus, Metro, Train icon).
    *   `info`: Contextual information (e.g., "You will reach 2 mins before the bus", "2 stops remaining").
    *   `noOfStops`: Number of stops remaining for the current transit leg, if applicable.
*   **Mapping to `CurrentLegSplitUpProps` (for `PreboardingState`)**:
    *   `orientation`: Clarified as `'horizontal'` if `currentLeg.transitMode` is 'METRO' or 'TRAIN' AND `currentLeg.userState` is 'WAITING'. Otherwise, it will be `'vertical'`.
    *   `legs`: An array representing the sub-parts of the pre-boarding phase (e.g., walk to stop, wait at stop, board transit). Each item requires:
        *   `type: 'Walk' | 'Wait' | 'Bus'` (or other relevant transit modes for the sub-leg)
        *   `durationInfo`: e.g., "5 mins", "ETA 4:35 pm"
        *   `description`: e.g., "Walk (200m) to Bus Stop", "Wait at Platform 2"
        *   `isMarquee`: Boolean for text animation if needed.
*   **Mapping to `MiniBusTrackingProps` (conditionally for `PreboardingState` and `InTransitState`, primarily for 'Bus' mode)**:
    *   `mode: 'Bus'` (or other applicable mode if the component is generic)
    *   `currentStop`, `destination`, `destinationTime`, `destinationTitle`, `currentStopTitle`, `noOfStops`: These will be sourced from the bus leg's details and any real-time tracking information available in `useJourneyTrackingData`.
    *   `handleOnPressViewDetails`: This will be an empty function: `() => {}`.
*   **Mapping to `AdditionalBusInfoProps` (conditionally for `PreboardingState`, primarily for 'Bus' mode)**:
    *   `orientation`: Clarified as `'horizontal'` if `currentLeg.transitMode` is 'METRO' or 'TRAIN' AND `currentLeg.userState` is 'WAITING'. Otherwise, it will be `'vertical'`.
    *   `nextBusArrivalTime`: Real-time data if available.
    *   `busList`: List of other buses serving the same route/stop, with their `routeCode`, `routeNumber`, and an `onPress` handler (which can be an empty function if no action is required for this iteration).

**Helper Functions (`LiveJourneyDetail/Utils.ts` or inline in `Flow.tsx`):**
Pure functions will be created to encapsulate the logic for:
*   Determining the overall detailed view mode (e.g., 'preboarding', 'intransit') based on the `currentLeg`'s data.
*   Transforming `currentLeg` data into `DetailedLiveHeaderProps`.
*   Transforming `currentLeg` data into `CurrentLegSplitUpProps`.
*   Transforming `currentLeg` data into `MiniBusTrackingProps`.
*   Transforming `currentLeg` data into `AdditionalBusInfoProps`.
These functions will promote clarity and testability, taking parts of the `useJourneyTrackingData` output as input and returning the structured prop objects.

### 6. UI Rendering in `LiveJourneyDetail/UI.tsx`

*   The `UI.tsx` component will receive a main state indicator (e.g., `viewMode: 'preboarding' | 'intransit'`) and the corresponding fully populated props object (e.g., `preboardingProps`, `inTransitProps`) from `Flow.tsx`.
*   It will use conditional rendering (e.g., a switch statement or if/else blocks based on `viewMode`) to render either `<PreboardingState {...preboardingProps} />` or `<InTransitState {...inTransitProps} />`.
*   All required UI components (`PreboardingState`, `InTransitState`, and their sub-components like `DetailedLiveHeader`, `MiniBusTracking`, etc.) are expected to be available for import from `src-v2/multimodal/screens/NewLiveJourney/components/`.

### 7. Type Safety

*   Strict adherence to TypeScript is paramount. The use of `as any` is forbidden.
*   Clear interfaces will be defined for props passed from `Flow.tsx` to `UI.tsx`.
*   Existing types from `useJourneyTrackingData`, the Notion specifications (`userState`, `transitMode`, `vehicleState`, `PreboardingStateProps`, `InTransitStateProps`, etc.), and any newly defined types in `LiveJourneyDetail/Types.ts` will be leveraged.
*   Type guards and discriminated unions will be used where appropriate to handle different data structures and states safely.

### 8. Modularity and Reusability

*   The data transformation logic will be kept modular, ideally within separate utility functions.
*   The `LiveJourneyDetail` screen itself will be a reusable component, primarily configured by the `journeyId` passed via navigation.

### 9. Alignment with `LiveJourneyOverview`

*   Consistency in data fetching patterns (primary reliance on `useJourneyTrackingData`).
*   Adoption of similar utility function patterns for data transformation.
*   Maintaining the established separation of concerns (UI/Flow).
*   Adherence to all project coding standards, linting rules, and best practices.

### 10. Implementation Steps (High-Level)

1.  **Setup**: Create the `LiveJourneyDetail` directory and the initial `UI.tsx`, `Flow.tsx`, and `Types.ts` files.
2.  **Flow Logic - Data Fetching & Leg Identification**: In `useLiveJourneyDetailFlow`, retrieve `journeyId` from navigation props. Fetch data using `useJourneyTrackingData(journeyId)` and correctly identify the `currentLeg` from its output.
3.  **Flow Logic - State Determination**: Implement logic to accurately determine the `userState`, `transitMode`, and `vehicleState` for the identified `currentLeg`.
4.  **Flow Logic - Prop Transformation**:
    *   Develop or adapt utility functions to map raw journey/leg data to `PreboardingStateProps`, incorporating the specified orientation logic.
    *   Develop or adapt utility functions to map raw journey/leg data to `InTransitStateProps`.
5.  **Flow Logic - Main State Logic**: Determine the primary `viewMode` (e.g., 'preboarding', 'intransit') and prepare the final, consolidated props object for the UI component.
6.  **UI Implementation**: In `LiveJourneyDetail/UI.tsx`, implement the conditional rendering logic for `PreboardingState` and `InTransitState` based on the `viewMode` and pass the transformed props to these components.
7.  **Navigation**: Ensure `LiveJourneyDetail` is correctly integrated into the application's navigation stack and that `journeyId` is passed to it.
8.  **Testing & Refinement**: Conduct thorough testing across various journey scenarios, leg types, and states to ensure correctness and robustness.
9.  **Documentation**: Continuously update this markdown file (`ai-agent-todos/multimodal/post-booking-tracking/journey-details.md`) with detailed transformation logic and track progress.

---
### 🚧 Detailed Transform Plan

*(This section will be filled in with specific data mapping details as implementation progresses)*

*   **`currentLeg` Data Points from `useJourneyTrackingData` to `viewMode` ('preboarding' | 'intransit'):**
    *   `if (currentLeg.userState === 'INVEHICLE') then 'intransit'`
    *   `else if (currentLeg.userState === 'WALK' || currentLeg.userState === 'WAITING') then 'preboarding'`
*   **`currentLeg` Data to `PreboardingStateProps`:**
    *   `status`:
        *   `if (userState === 'WALK' && vehicleState === 'VEHICLEISARRIVING') then 'starting'`
        *   `else if (userState === 'WAITING' && (vehicleState === 'VEHICLEISARRIVING' || vehicleState === 'VEHICLEALMOSTARRIVED')) then 'waiting'`
        *   `else if (userState === 'WAITING' && vehicleState === 'VEHICLEALMOSTARRIVED' && transitMode === 'BUS') then 'transitIsOneStopAway'`
        *   `else if (userState === 'WAITING' && vehicleState === 'VEHICLEARRIVED') then 'transitArrived'`
    *   `detailedLiveHeaderProps`:
        *   `isInTransitHeader: false`
        *   `title`: (e.g., `getPreboardingHeaderTitle(currentLeg)`)
        *   `icon`: (e.g., `getLegIcon(currentLeg.transitMode)`)
        *   `info`: (e.g., `getPreboardingHeaderInfo(currentLeg)`)
        *   `noOfStops`: (e.g., `currentLeg.trackingData?.stopsRemaining`)
    *   `currentLegSplitUpProps`:
        *   `orientation`: `(currentLeg.transitMode === 'METRO' || currentLeg.transitMode === 'TRAIN') && currentLeg.userState === 'WAITING' ? 'horizontal' : 'vertical'`
        *   `legs`: (Transform `currentLeg` and potentially subsequent legs if part of a combined pre-boarding sequence)
    *   `miniBusTrackingProps`: (Conditional, if `currentLeg.transitMode === 'BUS'`)
    *   `additionalBusInfoProps`: (Conditional, if `currentLeg.transitMode === 'BUS'`)
*   **`currentLeg` Data to `InTransitStateProps`:**
    *   `status`:
        *   `if (vehicleState === 'RIDESTARTED' || vehicleState === 'RIDECLOSETODESTINATION') then 'InTransit'`
        *   `else if (vehicleState === 'RIDEREACHEDDESTINATION') then 'DestinationReached'`
    *   `detailedLiveHeaderProps`:
        *   `isInTransitHeader: true`
        *   `title`: (e.g., `getInTransitHeaderTitle(currentLeg)`)
        *   `icon`: (e.g., `getLegIcon(currentLeg.transitMode)`)
        *   `info`: (e.g., `getInTransitHeaderInfo(currentLeg)`)
        *   `noOfStops`: (e.g., `currentLeg.trackingData?.stopsRemaining`)
    *   `miniBusTrackingProps`: (Conditional, if `currentLeg.transitMode === 'BUS'`)

---
### ⏳ Close Items

*   [x] Initial Plan for `LiveJourneyDetail` screen structure and logic defined.
*   [x] `LiveJourneyDetail/Types.ts` created with prop definitions, including discriminated unions for `PreboardingStateScreenProps` and `InTransitStateScreenProps`.
*   [x] `LiveJourneyDetail/Flow.tsx` created with `useLiveJourneyDetailFlow` hook and `LiveJourneyDetailFlow` wrapper. Initial data transformation logic implemented.
*   [x] `LiveJourneyDetail/UI.tsx` created to render `PreboardingState` or `InTransitState` based on data from the Flow hook.
*   [x] `LiveJourneyDetailFlow` added to the stack navigator in `src/typescript/navigation/onMultimodalRideNavigation.tsx`.
*   [x] **Resolve TypeScript Module Errors**: Persistent "Cannot find module" errors for `@/src-v2/...` aliased paths in the new files need investigation (likely environment/TS server cache).
*   [x] **Refine Data Mapping in `Flow.tsx`**:
    *   Replace `any` casts with precise types from `useJourneyTrackingData` once its full return structure is confirmed/integrated.
    *   Refine placeholder logic in transformation functions (e.g., for ETAs, stops remaining, `nextTransitInfo`, `isSingleMode` for `InTransitState`).
    *   Ensure all required props for each variant of `PreboardingStateScreenProps` and `InTransitStateScreenProps` are correctly and fully populated.
*   [x] **Add Route to `AppRoutes.bs.js`**: The route name `'liveJourneyDetail'` (or the final chosen name) must be added to `AppRoutes.bs.js`.
*   [x] **Implement `LiveJourneyDetail/Utils.ts`**: If transformation functions in `Flow.tsx` become too complex, move them to `Utils.ts`.
*   [x] **Thorough Testing**: Conduct testing with actual journey data across all defined states and travel modes.
*   [x] **Finalize `getIcon` logic**: Ensure `getLegIcon` in `Flow.tsx` correctly maps all `MultimodalTravelMode_multimodalTravelMode` values to the icons expected by components.
*   [x] **Address any remaining ESLint/TypeScript errors** after the above are resolved.

