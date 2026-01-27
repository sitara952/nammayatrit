open Enums
open FRFSStationAPI
open Utils

@genType
type legRouteInfo = {
  allAvailableRoutes: array<string>,
  destinationStop: fRFSStationAPI,
  frequency: option<int>,
  lineColor: option<string>,
  lineColorCode: option<string>,
  originStop: fRFSStationAPI,
  platformNumber: option<string>,
  routeCode: string,
  subOrder: option<int>,
  trackingStatus: option<TrackingStatus.trackingStatus>,
  trackingStatusLastUpdatedAt: option<string>,
  trainNumber: option<string>,
}

let decodeLegRouteInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allAvailableRoutes: getOptionStrArrayFromDict(dict, "allAvailableRoutes")->Option.getExn(
            ~message="allAvailableRoutes not found",
          ),
          destinationStop: dict
          ->Dict.get("destinationStop")
          ->Option.getExn(~message="destinationStop is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="destinationStop is coming as undefined"),
          frequency: getOptionInt(dict, "frequency"),
          lineColor: getOptionString(dict, "lineColor"),
          lineColorCode: getOptionString(dict, "lineColorCode"),
          originStop: dict
          ->Dict.get("originStop")
          ->Option.getExn(~message="originStop is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="originStop is coming as undefined"),
          platformNumber: getOptionString(dict, "platformNumber"),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          subOrder: getOptionInt(dict, "subOrder"),
          trackingStatus: TrackingStatus.decodeTrackingStatusResult(
            dict,
            "trackingStatus",
          )->Result.mapOr(None, x => Some(x)),
          trackingStatusLastUpdatedAt: getOptionString(dict, "trackingStatusLastUpdatedAt"),
          trainNumber: getOptionString(dict, "trainNumber"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegRouteInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legRouteInfo) => {
  req->asJson
}
