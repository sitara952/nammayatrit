open LatLong
open Utils

@genType
type applyCodeReq = {
  androidId: option<string>,
  code: string,
  deviceId: option<string>,
  gps: option<latLong>,
}

let decodeApplyCodeReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          androidId: getOptionString(dict, "androidId"),
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          deviceId: getOptionString(dict, "deviceId"),
          gps: dict
          ->Dict.get("gps")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ApplyCodeReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: applyCodeReq) => {
  req->asJson
}
