open Enums
open RouteStopMapping
open UpcomingStop
open VehicleInfoForRoute
open Utils

@genType
type vehicleTrackingInfo = {
  delay: option<int>,
  nextStop: option<routeStopMapping>,
  nextStopTravelDistance: option<int>,
  nextStopTravelTime: option<int>,
  routeCode: string,
  routeShortName: option<string>,
  serviceTierType: option<FRFSServiceTierType.fRFSServiceTierType>,
  upcomingStops: array<upcomingStop>,
  vehicleId: string,
  vehicleInfo: vehicleInfoForRoute,
}

let decodeVehicleTrackingInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          delay: getOptionInt(dict, "delay"),
          nextStop: dict
          ->Dict.get("nextStop")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeRouteStopMapping(x)->Result.mapOr(None, x => Some(x))),
          nextStopTravelDistance: getOptionInt(dict, "nextStopTravelDistance"),
          nextStopTravelTime: getOptionInt(dict, "nextStopTravelTime"),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          routeShortName: getOptionString(dict, "routeShortName"),
          serviceTierType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceTierType",
          )->Result.mapOr(None, x => Some(x)),
          upcomingStops: dict
          ->Dict.get("upcomingStops")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="upcomingStops is not of array")
          ->Array.map(x =>
            decodeUpcomingStop(x)->Utils.getResultExn(
              ~message="upcomingStops is coming as undefined",
            )
          ),
          vehicleId: getOptionString(dict, "vehicleId")->Option.getExn(
            ~message="vehicleId not found",
          ),
          vehicleInfo: dict
          ->Dict.get("vehicleInfo")
          ->Option.getExn(~message="vehicleInfo is not found")
          ->decodeVehicleInfoForRoute
          ->Utils.getResultExn(~message="vehicleInfo is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VehicleTrackingInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: vehicleTrackingInfo) => {
  req->asJson
}
