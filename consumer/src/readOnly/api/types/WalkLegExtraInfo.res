open Enums
open Location
open Utils

@genType
type walkLegExtraInfo = {
  destination: location,
  id: string,
  origin: location,
  trackingStatus: option<TrackingStatus.trackingStatus>,
  trackingStatusLastUpdatedAt: option<string>,
}

let decodeWalkLegExtraInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          destination: dict
          ->Dict.get("destination")
          ->Option.getExn(~message="destination is not found")
          ->decodeLocation
          ->Utils.getResultExn(~message="destination is coming as undefined"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          origin: dict
          ->Dict.get("origin")
          ->Option.getExn(~message="origin is not found")
          ->decodeLocation
          ->Utils.getResultExn(~message="origin is coming as undefined"),
          trackingStatus: TrackingStatus.decodeTrackingStatusResult(
            dict,
            "trackingStatus",
          )->Result.mapOr(None, x => Some(x)),
          trackingStatusLastUpdatedAt: getOptionString(dict, "trackingStatusLastUpdatedAt"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("WalkLegExtraInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: walkLegExtraInfo) => {
  req->asJson
}
