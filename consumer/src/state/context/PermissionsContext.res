type dataType = {locationPermission: bool, locationPermSetter: bool => unit}
let defaultPayloadData = {
  locationPermission: false,
  locationPermSetter: _ => (),
}
let defaultSetter = (_: dataType) => ()
let permissionContext = React.createContext(defaultPayloadData)
module Provider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(permissionContext)
}
@react.component
let make = (~children) => {
  let (locationPermission, locationPermSetter) = React.useState(_ => false)
  let setState = React.useCallback1(val => {
    locationPermSetter(_ => val)
  }, [locationPermSetter])

  <Provider value={locationPermission, locationPermSetter: setState}> children </Provider>
}
