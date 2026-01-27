let useCurrentLocation = () => {
  let userLocation = React.useContext(WatchUserLocationContext.context)
  let (
    userCurrLocation: option<LocationTypes.location>,
    _,
    serviceable,
    fetchLocationAndServiceability,
  ) = UseLocationDetails.useLocationDetails()
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)

  React.useEffect1(() => {
    switch userLocation.position {
    | Some(currLoc) => {
        let locationReq: LocationTypes.location = LocationUtils.createLocation(
          currLoc.coords.latitude,
          currLoc.coords.longitude,
        )
        fetchLocationAndServiceability(locationReq, 0)
      }
    | None => ()
    }
    ()
    None
  }, [userLocation])

  React.useEffect1(() => {
    switch userCurrLocation {
    | Some(loc) => rideFlowAction(UpdateCurrentLocation(loc))
    | None => ()
    }
    None
  }, [userCurrLocation])

  serviceable
}
