open Enums
open LatLong
open Utils

@genType
type fareCacheReq = {
  currentCity: option<City.city>,
  currentLatLong: latLong,
}

let decodeFareCacheReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          currentCity: City.decodeCityResult(dict, "currentCity")->Result.mapOr(None, x => Some(x)),
          currentLatLong: dict
          ->Dict.get("currentLatLong")
          ->Option.getExn(~message="currentLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="currentLatLong is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FareCacheReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fareCacheReq) => {
  req->asJson
}
