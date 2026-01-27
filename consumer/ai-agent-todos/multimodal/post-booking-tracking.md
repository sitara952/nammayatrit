# 🔧 Feature Spec: Post-Booking Tracking

## 🔍 Big Picture
The Post-Booking Tracking module is part of the `src-v2/multimodal` flow. It allows users to view and interact with the real-time status of their multimodal journey after booking.

This feature will be developed in **three sequential phases**:

### ✅ TODOs by Phase
- [x] **Phase 1**: Build `LiveJourneyOverview` screen and integrate `RideConfirmed` screen for taxi legs.
- [ ] **Phase 2**: Build journey detail screens for Train (`LiveJourneyDetailsTrain.tsx`), Bus (`LiveJourneyDetailsBus.tsx`), and Walk (`LiveJourneyDetailsWalk.tsx`).
- [ ] **Phase 3**: Implement fallback states (`LiveJourneyFallback.tsx`) and dynamic alerts (`LiveJourneyAlerts.tsx`) for real-time transitions.

Each phase will follow the same structured template below.

---

# 🔧 Feature Spec: Post-Booking Tracking - Phase 1

## 🌟 Goal
Implement Phase 1 of the post-booking tracking experience within the `src-v2/multimodal` flow. This includes:
- A `LiveJourneyOverview` screen showing an overview of the multimodal journey.
- Integration of the existing `RideConfirmed` screen as the journey details view for taxi mode.

## 🔬 Inputs & Data

- `journeyId` - passed as a route param

### APIs Involved:
- `src/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet.ts`
  - Fetches all transit legs of the journey.
- `src/api/integrations/rtk/MultimodalJourneyIdRiderLocationPost.ts`
  - Requires rider's current location (can be accessed via `useRiderLocation` hook).

### Hook:
- `useRiderLocation` - provides user location and is connected to `postRiderLocation`.

## 🖼️ UI Reference
- `ItineraryCard` component: [Notion Doc](https://www.notion.so/Iternary-Card-Documentation-20fefda29f0a8166aff3d09f7f4310c2)
- Layout: map background with the itinerary content in the foreground (no vertical scroll).

## 🔹 Components
- `src-v2/screens/LiveJourneyOverview.tsx`
- Integrate existing `src-v2/screens/RideConfirmed.tsx` screen for taxi/auto/bike transit legs.
- Use and transform API data to construct props for the `ItineraryCard` component.

## ⚖️ States
- **Loading**: show shimmer or loader while fetching journey info.
- **Error**: fallback with retry.
- **Empty**: show message if no journey data found.
- **Success**: display itinerary with map background.

## ⚠️ Edge Cases
- Journey ID missing or invalid.
- No current location available.
- API failure for either `journeyInfo` or `postRiderLocation`.
- Missing or malformed transit leg details.

## 🤞 Test Scenarios
- Renders overview screen with mock journey data.
- Accurately transforms and passes props to `ItineraryCard`.
- Navigates to `RideConfirmed` when current leg is taxi.
- Handles missing location via fallback.
- Displays proper UI on API failure.

---

# 🔊 Initial Prompt Template for Cline (Phase 1)

```
You are a senior React Native + TypeScript developer working on a multimodal transport flow.

Your task is to build the `Phase 1` of the post-booking tracking feature in `src-v2/multimodal`.

This includes:
1. RideConfirmed screen: src-v2/screens/RideConfirmed
2. IternaryCard component: /src-v2/multimodal/screens/NewLiveJourney/components/Iternary/UI.tsx
2. Use existing components or screens where applicable (e.g. RideConfirmed for taxi).

Fetch and transform data from the following APIs:
- `src/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet.ts`
- `src/api/integrations/rtk/MultimodalJourneyIdRiderLocationPost.ts` (via `useRiderLocation` hook)

The `journeyId` will be passed as a route param. You must:
- Compose the correct transformed props as per the component spec.
- Explicitly define the transform logic and get it reviewed before coding.
- Handle loading, error, and fallback states gracefully.
- Ensure code modularity and testability.

Write the full screen/component in `src-v2/mutilmodal/screens/` and extract reusable utility functions where needed.
```

# 🔊 Update 1: Prompt Template for Cline (Phase 1)
```
You have done a quite good job in Phase 1 but still you missed many points
1. Forget to Implement actual 'OFFTRACK'/'NOTMOVING' detection using riderLatLong and apiCurrentLeg path
2. Read inside useRiderLocation hook and check it is updating the redux state with the leg status, consume those leg status to keep update the IternaryCard status, right now you are just consuming the initial status from the journeyDetails, you should also keep updating it with the new statuses
3. Also, let me know if we are missing anything from phase 1 goals
```

# 🔊 Update 2: Prompt Template for Cline (Phase 1)
```
We missed one important detail of while doing the transforms
1. Tranforms transit.type is not proper, all transit types are 'WALK' | 'BUS' | 'METRO' | 'SUBWAY' | 'WAITING' | 'DESTINATION' | 'FARAWAY' | 'NOTMOVING' but we are only transforming into 'WALK' | 'BUS' | 'METRO' | 'SUBWAY' | 'WAITING', also having 1 to 1 mapping of journey leg to a transit type. Actually, scenario is, a single leg could also have 2 transit type e.g. if current leg is Bus but you haven't onboarded the bus then the two transits would be WAITING and BUS, instead of picking the next leg. Same with other modes as well
```