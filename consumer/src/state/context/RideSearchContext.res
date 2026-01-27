open LocationTypes

@genType
type estimateID = None | Loading | Loaded(string) | Error

@genType
type rideSearchContext = {
  source: option<location>,
  destination: option<location>,
  searchId: option<string>,
  gateId: option<string>,
  estimateId: estimateID,
  estimateList: array<EstimateType.estimate>,
  sourceSetUsingPin: bool,
  destSet: bool,
  isPickup: bool,
  validTill: string,
}

let defaultRideSearchContext = (estimateId: estimateID) => {
  source: None,
  destination: None,
  searchId: None,
  gateId: None,
  estimateId,
  estimateList: [],
  sourceSetUsingPin: false,
  destSet: false,
  isPickup: true,
  validTill: "",
}
let defaultSetter = (_: rideSearchContext) => ()

@genType
let rideSearchContext = React.createContext((defaultRideSearchContext(None), defaultSetter))
module Provider = {
  let make = React.Context.provider(rideSearchContext)
}

@react.component
let make = (~children, ~estimateId=None) => {
  let (state, setState) = React.useState(_ => defaultRideSearchContext(estimateId))
  let setState' = React.useCallback1(val => {
    setState(_ => val)
  }, [setState])
  <Provider value=(state, setState')> children </Provider>
}
