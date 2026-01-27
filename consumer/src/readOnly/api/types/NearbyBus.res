open Enums
open LatLong
open Utils

@genType
type nearbyBus = {
  currentLocation: latLong,
  distance: option<float>,
  routeCode: string,
  routeState: option<RouteState.routeState>,
  serviceType: option<string>,
  shortName: option<string>,
  vehicleNumber: option<string>,
}

let decodeNearbyBus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          currentLocation: dict
          ->Dict.get("currentLocation")
          ->Option.getExn(~message="currentLocation is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="currentLocation is coming as undefined"),
          distance: getOptionFloat(dict, "distance"),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          routeState: RouteState.decodeRouteStateResult(dict, "routeState")->Result.mapOr(
            None,
            x => Some(x),
          ),
          serviceType: getOptionString(dict, "serviceType"),
          shortName: getOptionString(dict, "shortName"),
          vehicleNumber: getOptionString(dict, "vehicleNumber"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NearbyBus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nearbyBus) => {
  req->asJson
}
