open LatLong
open Utils

@genType
type riderLocationReq = {
  currTime: string,
  latLong: latLong,
}

let decodeRiderLocationReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          currTime: getOptionString(dict, "currTime")->Option.getExn(~message="currTime not found"),
          latLong: dict
          ->Dict.get("latLong")
          ->Option.getExn(~message="latLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="latLong is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RiderLocationReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: riderLocationReq) => {
  req->asJson
}
