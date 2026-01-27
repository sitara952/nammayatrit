You previously implemented `LiveJourneyDetail` screen by:

- Fetching journey-level data using the src-v2/multimodal/hooks/useJourneyTrackingData.ts hook
- Transforming the data into displayable units inside src-v2/multimodal/screens/LiveJourneyDetail/Flow.tsx src-v2/multimodal/screens/LiveJourneyDetail/UI.tsx by handling various conditions

Please understand the code written in this and share your understanding. Now, you have to add one more component in the screen `DetailedTransitTrackingUI` being taken from src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/DetailedTransitTrackingUI.tsx which will open when user will click on Track ${mode} button in src-v2/multimodal/screens/NewLiveJourney/molecules/PreboardingState.tsx or src-v2/multimodal/screens/NewLiveJourney/components/InZoneExperience/InMetroSuburbanTransit.tsx or src-v2/multimodal/screens/NewLiveJourney/components/InZoneExperience/InStationZone.tsx component of UI file. All the data required for the component could already be there in Flow file or could be taken and transfromed from the useJourneyTrackingData hook. Please devise a plan for implemententing this task.
