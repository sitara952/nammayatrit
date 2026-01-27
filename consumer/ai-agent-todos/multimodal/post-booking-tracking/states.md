Goal: Create a single custom React Native hook that returns all journey-related information to be used in tracking screens.

📥 INPUT:
- `journeyId` (string)

📡 Source of Information:

1. **Journey Meta Information**
   - API: `src/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet.ts`
   - Returns transit legs with details like place, vehicle number, time, distance, travelMode, etc.

2. **Leg Statuses and Rider Location**
   - Use: `useRiderLocation` (src-v2/multimodal/hooks/useRiderLocation.ts) hook
   - This updates Redux state with:
     - Real-time statuses of all legs
     - Current rider location
     - Vehicle positions per leg
     - Scope to include next stop info in the future

3. **Route Waypoints**
   - For `BUS`, `METRO`, `TRAIN`: Use `src/api/integrations/rtk/FrfsRouteRouteCodeGet.ts`
   - For `TAXI`, `WALK`: Use `src/api/integrations/rtk/TripRoutePost.ts`

4. **Stops for Public Transport Legs**
   - Use `usePublicTransportUtils` from:
     - `src-v2/multimodal/utils/PublicTransportUtils.ts`
   - Returns list of stops for a given route (BUS/METRO/TRAIN)

📤 OUTPUT (per leg):

```ts
{
  currentLeg: number, // legOrder of the current leg, computed from statuses

  userState: 'WALK' | 'WAITING' | 'INVEHICLE' | 'FARAWAY' | 'NONE',
  // Rules:
  // - WALK: only if current leg is walk
  // - WAITING: for non-walk legs if vehicleState is one of:
  //     'SEARCHINGFORVEHICLE', 'VEHICLEISARRIVING', 'VEHICLEALMOSTARRIVED', 'VEHICLEARRIVED', 'VEHICLEMISSED' (Note: 'WAITINGFORVEHICLE' from original spec replaced with 'SEARCHINGFORVEHICLE' to align with vehicleState type)
  // - INVEHICLE: for non-walk legs if vehicleState is one of:
  //     'RIDESTARTED', 'RIDECLOSETODESTINATION', 'RIDEREACHEDDESTINATION'
  // - FARAWAY: if user is far (>1 km; configurable) from origin stop of the leg AND vehicleState is one of:
  //     'SEARCHINGFORVEHICLE', 'VEHICLEISARRIVING', 'VEHICLEALMOSTARRIVED', 'VEHICLEARRIVED' (Note: 'WAITINGFORVEHICLE' from original spec replaced with 'SEARCHINGFORVEHICLE')
  // - NONE: for all other legs that are not currentLeg

  vehicleState: 
    | 'SEARCHINGFORVEHICLE'
    | 'VEHICLEISARRIVING'
    | 'VEHICLEALMOSTARRIVED'
    | 'VEHICLEARRIVED'
    | 'RIDESTARTED'
    | 'RIDECLOSETODESTINATION'
    | 'RIDEREACHEDDESTINATION'
    | 'VEHICLEMISSED',

  // Map from legStatus (real-time status from Redux, type Enums_JourneyLegStatus_journeyLegStatus):
  // - 'Arriving'     => 'VEHICLEALMOSTARRIVED'
  // - 'OnTheWay'     => 'VEHICLEISARRIVING'
  // - 'Arrived'      => 'VEHICLEARRIVED'
  // - 'Ongoing', 'Departed' => 'RIDESTARTED'
  // - 'Finishing'    => 'RIDECLOSETODESTINATION'
  // - 'Completed'    => 'RIDEREACHEDDESTINATION'
  // - 'Missed'       => 'VEHICLEMISSED'
  // - default (e.g. 'Booked', 'Assigning', 'InPlan', 'Cancelled') => 'SEARCHINGFORVEHICLE' (Note: 'WAITINGFORVEHICLE' from original spec replaced with 'SEARCHINGFORVEHICLE')

  transitMode: 'WALK' | 'BUS' | 'METRO' | 'SUBWAY' | 'TAXI',
  // Inferred from travelMode in journey meta

  details: object, // full leg meta details from journey info API (actually LegInfo_legInfo type)

  stops: array, // ordered list of stops for the leg (empty for WALK/TAXI)

  routeWaypoints: array, // ordered route coordinates (empty if API fails)

  riderLocation: object, // current location from useRiderLocation (selected from Redux session state)

  vehiclePositions: array // positions from useRiderLocation (from LegStatus_legStatus.vehiclePositions in Redux)
}
```

Deliverable:

Create a hook named: useJourneyTrackingData

Location: src-v2/multimodal/

It should:

Accept journeyId as input

Fetch and transform all above data

Expose memoized output as described

Avoid unnecessary re-renders

Include all dependencies in memory bank

📏 Success Metrics:

Output structure must match exactly as defined above

Leg statuses must be consumed from Redux state updated via useRiderLocation

userState and vehicleState should be computed correctly

Fallback handling and retry logic must be implemented for API failures

Test thoroughly using: journeyId = 77769b90-1df3-4ebe-b43b-58fbe2049ae4

Suggest any required MCP server mocks, mocks for Redux, and related test setup needed to simulate a full working environment

---
## 🚀 Progress Update (YYYY-MM-DD)

**Status:**
- Hook `useJourneyTrackingData` created at `src-v2/multimodal/hooks/useJourneyTrackingData.ts`.
- Initial implementation covers data fetching setup (journey meta, Redux selections), type definitions, and core transformation logic for `vehicleState`, `transitMode`, `currentLeg`, `userState`, `stops`, and `details`.
- Waypoint fetching is set up with RTK Query hooks but actual invocation and data integration into the final `routeWaypoints` array is a placeholder (marked as TODO) due to complexity of managing multiple async calls per leg within `useMemo`.

**Key Findings & Decisions:**
- Performed detailed type analysis for all data sources:
    - Journey Meta: `journeyInfoResp` -> `legInfo[]` (each `legInfo` contains `legExtraInfo`).
    - `legExtraInfo` is a tagged union (`BusLegExtraInfo`, `MetroLegExtraInfo`, etc.).
    - Real-time leg data from Redux (updated by `useRiderLocation`) is `legStatus[]`. Each `legStatus` contains `Enums_JourneyLegStatus_journeyLegStatus` and `vehiclePosition[]`.
    - Waypoint API responses: `fRFSRouteAPI` (for public transport) and `routeInfoArray` (for walk/taxi).
    - Public transport stops data: `publicTransportData` (contains `transportStation[]` and `transportRouteStopMapping[]`).
- Implemented mapping from `Enums_JourneyLegStatus_journeyLegStatus` to `vehicleState`.
- Implemented mapping from `Enums_MultimodalTravelMode_multimodalTravelMode` (from `legInfo.travelMode`) to `transitMode`.
- Drafted logic for `currentLeg` computation based on real-time leg statuses.
- Drafted logic for `userState` computation, including distance calculation for `FARAWAY` state.
    - Adjusted `userState: 'WAITING'` and `userState: 'FARAWAY'` conditions to use `'SEARCHINGFORVEHICLE'` in line with the defined `vehicleState` enum, replacing the ambiguous `'WAITINGFORVEHICLE'` from the original spec.
- Logic for populating `stops` array for public transport legs by combining `getStopsForRoute` and `transportStation` details is included.
- `details` field per leg is the `legInfo` object from the journey meta.
- `riderLocation` is sourced from Redux session state.
- `vehiclePositions` are sourced from the `legStatus.vehiclePositions` in Redux.
- Identified that `metroLegExtraInfo` (and assumed `subwayLegExtraInfo`) nests `routeCode` and `originStop` within a `routeInfo[0]` object, requiring different access patterns than `busLegExtraInfo`. This is handled in the draft.

**Future TODOs & Refinements for `useJourneyTrackingData.ts`:**
- **Full Waypoint Fetching**:
    - Implement robust asynchronous fetching for the `routeWaypoints` field. The current implementation has RTK Query hooks set up but the per-leg invocation and data merging logic within `useMemo`'s `map` function is placeholder.
    - This will likely involve managing loading/error states from `useFrfsRouteRouteCodeGetMutation` and `useTripRoutePostMutation` more actively and potentially using `useEffect` to trigger these fetches based on `metaLegs` and then combining results into a state variable that `processedData` can use.
- **Dynamic City for `FrfsRouteRouteCodeGet`**: The `DEFAULT_CITY` constant is a placeholder. The actual city parameter for `useFrfsRouteRouteCodeGetMutation` needs to be sourced dynamically, likely from `journeyMetaResp` or individual `legInfo`.
- **`getRoutesReq` Body for `TripRoutePost`**: The request body for `useTripRoutePostMutation` (for walk/taxi waypoints) is commented out. It needs to be correctly constructed using origin and destination coordinates from `legInfo.legExtraInfo`.
- **Refined Redux Selectors**:
    - The selector `(state as any).cache?.publicTransportData` is a temporary workaround. A type-safe selector for `publicTransportData` from the cache should be created and used.
    - Similarly, `(state.journey as any).journeys[journeyId]` uses a cast to `any`. If more specific types for `state.journey` are available, they should be used for better type safety.
- **Comprehensive Error Handling**:
    - Consolidate errors from `fetchJourneyMeta`, waypoint fetches, and other sources. The hook currently returns `errorMeta`. A more comprehensive error object or strategy might be needed.
    - Ensure graceful fallbacks (e.g., empty arrays for `stops`, `routeWaypoints`) are consistently applied when underlying data or API calls fail.
- **Retry Logic**: Implement or configure retry logic for API failures as per the project's standards (RTK Query offers some default retry behavior).
- **`JourneyId` Type Handling**: Ensure consistent and type-safe handling of the `JourneyId` branded type versus primitive `string` types, especially for API call parameters. The current hook uses casts like `journeyId as string` for `fetchJourneyMeta`.
- **Testing**:
    - Write unit/integration tests for the hook.
    - Test thoroughly with the journeyId `77769b90-1df3-4ebe-b43b-58fbe2049ae4` and other diverse scenarios (e.g., different travel modes, API failures, missing data).
- **Performance Optimization**:
    - Review `useEffect` and `useMemo` dependencies carefully to prevent unnecessary re-renders or re-computations, especially if Redux selectors might return new object/array references frequently.
- **Code Cleanup**: Remove any remaining unused commented-out code or imports once waypoint fetching is fully implemented.
