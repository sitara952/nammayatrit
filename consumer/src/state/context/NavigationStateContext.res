type flow =
  | SplashScreen
  | Login
  | CustomerOnboarding
  | MainApp(RideFlowContext.stage, option<RideTrackScreenType.rideDetail>)
  | CustomerInterest
  | PaymentMethods
  | DeepLink
  | NoInternet

let defaultSetter = (_: flow => flow) => ()
let navigationStateContext = React.createContext((SplashScreen, defaultSetter))

module Provider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(navigationStateContext)
}
@react.component
let make = (~children) => {
  let (state, setState) = React.useState(_ => SplashScreen)
  // let setState = React.useCallback1(val => {
  //   setState(_ => val)
  // }, [setState])

  <Provider value=(state, setState)> children </Provider>
}
