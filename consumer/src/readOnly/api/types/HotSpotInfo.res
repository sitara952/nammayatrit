open LatLong
open LocationAddress
open Utils

@genType
type hotSpotInfo = {
  _address: option<locationAddress>,
  _centroidLatLong: latLong,
  _geoHash: string,
}

let decodeHotSpotInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _address: dict
          ->Dict.get("_address")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocationAddress(x)->Result.mapOr(None, x => Some(x))),
          _centroidLatLong: dict
          ->Dict.get("_centroidLatLong")
          ->Option.getExn(~message="_centroidLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="_centroidLatLong is coming as undefined"),
          _geoHash: getOptionString(dict, "_geoHash")->Option.getExn(~message="_geoHash not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("HotSpotInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: hotSpotInfo) => {
  req->asJson
}
