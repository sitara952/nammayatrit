open RideTrackScreenType
open RecentSearchesHelpers
type stage =
  | HomeScreen
  | Search(int)
  | ConfirmPickup
  | ConfirmSpecialPickup
  | WaitingForDriverOffer(string)
  | ConfirmingRide(string)
  | RideAssigned
  | CustomerDriverChat
  | RideStarted
  | RideCancelled
  | RideCompleted
  | ChooseYourRide
  | FindingRides

@genType
type rideFlowType = {
  stage: stage,
  rideDetail: option<rideDetail>,
  currentLocation: option<LocationTypes.location>,
  savedLocation: option<array<SavedLocationType.tagConfig>>,
  recentSearches: option<array<LocationTypes.location>>,
  suggestionsPrediction: option<array<SuggestionPrediction.suggestions>>,
  suggestionsDefinition: option<array<SuggestionDefinition.suggestionDefinitions>>,
}

let defaultRideFlowConfig: rideFlowType = {
  stage: HomeScreen,
  rideDetail: None,
  currentLocation: None,
  savedLocation: None,
  recentSearches: None,
  suggestionsPrediction: None,
  suggestionsDefinition: None,
}

let getStageFromRideStatus = (rideDetail: option<rideDetail>): stage => {
  switch rideDetail {
  | Some(rideDetail') =>
    switch rideDetail'.rideStatus {
    | NEW => RideAssigned
    | INPROGRESS => RideStarted
    | CANCELLED => HomeScreen
    | COMPLETED => RideCompleted
    }
  | None => HomeScreen
  }
}

let makeDefaultRideFlowConfig = (stage: stage, rideDetail: option<rideDetail>): rideFlowType => {
  stage,
  rideDetail,
  currentLocation: None,
  savedLocation: None,
  recentSearches: None,
  suggestionsPrediction: SuggestionPrediction.getSuggestionFromRC(),
  suggestionsDefinition: SuggestionDefinition.getSuggestionsDefinitionFromRC(),
}

type rideFlowAction =
  | UpdateRideDetail(option<rideDetail>)
  | UpdateStage(stage)
  | UpdateCurrentLocation(LocationTypes.location)
  | UpdatedSavedLocation(array<SavedLocationType.tagConfig>)
  | AddToRecentSearches(LocationTypes.location)
  | SetRecentSearches(array<LocationTypes.location>)

let action = (_: rideFlowAction) => ()
let context = React.createContext((defaultRideFlowConfig, action))

module Provider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(context)
}

@react.component
let make = (~children, ~stage, ~rideDetailData) => {
  let (state, dispatch) = React.useReducer((state, action) => {
    switch action {
    | UpdateRideDetail(rideDetail) => {
        let newStage = getStageFromRideStatus(rideDetail)
        if rideDetail != state.rideDetail || newStage != state.stage {
          {...state, rideDetail, stage: newStage}
        } else {
          state
        }
      }
    | UpdateStage(newStage) => {...state, stage: newStage}
    | UpdateCurrentLocation(currentLocation) => {...state, currentLocation: Some(currentLocation)}
    | UpdatedSavedLocation(savedLocation) => {
        Console.log2("saved location updated", savedLocation)
        {...state, savedLocation: Some(savedLocation)}
      }
    | AddToRecentSearches(recentSearches) => {
        Console.log2("recent searches updated", recentSearches)
        let recents = setRecentSearches(state.recentSearches, recentSearches)
        {...state, recentSearches: Some(recents)}
      }
    | SetRecentSearches(recentSearches) => {
        Console.log2("recent searches updated", recentSearches)
        {...state, recentSearches: Some(recentSearches)}
      }
    }
  }, makeDefaultRideFlowConfig(stage, rideDetailData))

  <Provider value=(state, dispatch)> children </Provider>
}

let rideFlowContext = make
