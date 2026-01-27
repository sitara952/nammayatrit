open Enums
open LatLong
open NextStopDetails
open Utils

@genType
type vehiclePosition = {
  position: option<latLong>,
  route_state: option<RouteState.routeState>,
  upcomingStops: array<nextStopDetails>,
  vehicleId: string,
}

let decodeVehiclePosition = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          position: dict
          ->Dict.get("position")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          route_state: RouteState.decodeRouteStateResult(dict, "route_state")->Result.mapOr(
            None,
            x => Some(x),
          ),
          upcomingStops: dict
          ->Dict.get("upcomingStops")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="upcomingStops is not of array")
          ->Array.map(x =>
            decodeNextStopDetails(x)->Utils.getResultExn(
              ~message="upcomingStops is coming as undefined",
            )
          ),
          vehicleId: getOptionString(dict, "vehicleId")->Option.getExn(
            ~message="vehicleId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VehiclePosition ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: vehiclePosition) => {
  req->asJson
}
