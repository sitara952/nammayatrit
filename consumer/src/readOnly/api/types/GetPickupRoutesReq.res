open Enums
open LatLong
open Utils

@genType
type getPickupRoutesReq = {
  calcPoints: bool,
  mode: option<TravelMode.travelMode>,
  rideId: option<string>,
  waypoints: array<latLong>,
}

let decodeGetPickupRoutesReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          calcPoints: getOptionBool(dict, "calcPoints")->Option.getExn(
            ~message="calcPoints not found",
          ),
          mode: TravelMode.decodeTravelModeResult(dict, "mode")->Result.mapOr(None, x => Some(x)),
          rideId: getOptionString(dict, "rideId"),
          waypoints: dict
          ->Dict.get("waypoints")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="waypoints is not of array")
          ->Array.map(x =>
            decodeLatLong(x)->Utils.getResultExn(~message="waypoints is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetPickupRoutesReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getPickupRoutesReq) => {
  req->asJson
}
