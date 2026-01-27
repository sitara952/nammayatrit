open Enums
open UpcomingStop
open Utils

@genType
type vehicleInfoForRoute = {
  latitude: option<float>,
  longitude: option<float>,
  routeState: option<RouteState.routeState>,
  scheduleRelationship: option<string>,
  speed: option<float>,
  startDate: option<string>,
  startTime: option<string>,
  timestamp: option<string>,
  tripId: option<string>,
  upcomingStops: option<array<upcomingStop>>,
}

let decodeVehicleInfoForRoute = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          latitude: getOptionFloat(dict, "latitude"),
          longitude: getOptionFloat(dict, "longitude"),
          routeState: RouteState.decodeRouteStateResult(dict, "routeState")->Result.mapOr(
            None,
            x => Some(x),
          ),
          scheduleRelationship: getOptionString(dict, "scheduleRelationship"),
          speed: getOptionFloat(dict, "speed"),
          startDate: getOptionString(dict, "startDate"),
          startTime: getOptionString(dict, "startTime"),
          timestamp: getOptionString(dict, "timestamp"),
          tripId: getOptionString(dict, "tripId"),
          upcomingStops: dict
          ->Dict.get("upcomingStops")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeUpcomingStop(x)->Utils.getResultExn(
                ~message="upcomingStops is coming as undefined",
              )
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VehicleInfoForRoute ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: vehicleInfoForRoute) => {
  req->asJson
}
