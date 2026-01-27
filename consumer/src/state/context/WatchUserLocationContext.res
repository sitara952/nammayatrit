// DEPRECATED

/*
 * WatchUserLocationContext is a context provider that watches the user's location changes and provides the location to its children components.
 * if the location is not available, it provides None.
 * Listen the `position` value in the children components to get the user's location.
 */
@genType
type watchUserLocationContextType = {
  position: option<GeoLocation.position>,
  positionErr: option<GeoLocation.error>,
}

let initContext: watchUserLocationContextType = {
  position: None,
  positionErr: None,
}
let context = React.createContext(initContext)

module Provider = {
  let make = React.Context.provider(context)
}

@react.component
let make = (~children) => {
  let (position, setPosition) = React.useState(_ => None)
  let (positionErr, setPositionErr) = React.useState(() => None)

  let success = (~position) => {
    let forSave = {"lastLocation": position}->Utils.asJson
    EncryptedStorage.setItem(LAST_KNOWN_LOCATION, forSave->JSON.stringify)->ignore
    Console.log2("Watching position", position)
    setPosition(_ => Some(position))
  }
  let permValue = React.useContext(PermissionsContext.permissionContext)

  let error = (~error: GeoLocation.error): unit => {
    setPositionErr(_ => Some(error))
    Console.error(error)
  }

  React.useEffect1(() => {
    if permValue.locationPermission {
      let config: GeoLocation.config = {
        skipPermissionRequests: false,
      }
      GeoLocation.setRNConfiguration(~config)
      // GeoLocation.requestAuthorization(~error)

      let watchID = GeoLocation.watchPosition(
        ~success,
        ~error,
        ~options={
          enableHighAccuracy: true,
          maximumAge: 20000.,
          interval: 20000.,
          fastestInterval: 20000.,
        },
      )
      Some(
        () => {
          GeoLocation.clearWatch(~watchID)
        },
      )
    } else {
      None
    }
  }, [permValue.locationPermission])

  <Provider value={position, positionErr}> {children} </Provider>
}
