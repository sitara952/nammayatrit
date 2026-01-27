open ReactNative
open Style

@genType
let useMapRoute = (bottomPadding: option<float>, topPadding: option<float>) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)

  let drawRoute = async (routeInfo: option<RouteAPI.routeApiType>) => {
    let transformSnappedToRouteLatLon = (route: option<RouteAPI.routeApiType>): option<
      array<ReactMap.latLng>,
    > => {
      switch route {
      | Some(route') => Some(route'.points->Array.map(RouteAPI.transformSnappedToLatLon))
      | None => None
      }
    }
    let transformedPoint: option<array<ReactMap.latLng>> = transformSnappedToRouteLatLon(routeInfo)
  }
  drawRoute
}
