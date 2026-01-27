open LatLong
open Utils

@genType
type isIntercityReq = {
  mbDropLatLong: option<latLong>,
  pickupLatLong: latLong,
}

let decodeIsIntercityReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          mbDropLatLong: dict
          ->Dict.get("mbDropLatLong")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          pickupLatLong: dict
          ->Dict.get("pickupLatLong")
          ->Option.getExn(~message="pickupLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="pickupLatLong is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IsIntercityReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: isIntercityReq) => {
  req->asJson
}
