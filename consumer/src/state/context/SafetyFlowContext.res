let defaultSetter = (_: option<EmergencySettings.emergencySettingsReq>) => ()

let safetyContext = React.createContext((None, defaultSetter))

module Provider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(safetyContext)
}

@react.component
let make = (~children) => {
  let (state, setState) = React.useState(_ => None)
  let setState' = React.useCallback1(val => {
    setState(_ => val)
  }, [setState])

  <Provider value=(state, setState')> children </Provider>
}
