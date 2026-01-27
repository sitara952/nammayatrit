type rideTrackAction = Enable | Disable
type rideTrackType = {enablePooling: bool}
let defaultRideTrackConfig: rideTrackType = {enablePooling: true}
let defaultAction = (_: rideTrackAction) => ()
let stateContext = React.createContext((defaultRideTrackConfig, defaultAction))

module Provider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(stateContext)
}
@react.component
let make = (~children) => {
  let (state, dispatch) = React.useReducer((_, action) => {
    switch action {
    | Enable => {
        Js.log("enable")
        {enablePooling: true}
      }
    | Disable => {
        Js.log("disable")
        {enablePooling: false}
      }
    }
  }, defaultRideTrackConfig)

  <Provider value=(state, dispatch)> children </Provider>
}
