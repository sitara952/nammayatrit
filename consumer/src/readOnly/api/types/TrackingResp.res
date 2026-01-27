open VehicleTrackingInfo
open Utils

@genType
type trackingResp = {vehicleTrackingInfo: array<vehicleTrackingInfo>}

let decodeTrackingResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          vehicleTrackingInfo: dict
          ->Dict.get("vehicleTrackingInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="vehicleTrackingInfo is not of array")
          ->Array.map(x =>
            decodeVehicleTrackingInfo(x)->Utils.getResultExn(
              ~message="vehicleTrackingInfo is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TrackingResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: trackingResp) => {
  req->asJson
}
