open LatLong
open LocationAddress
open Utils

@genType
type stopReq = {
  address: locationAddress,
  gps: latLong,
}

let decodeStopReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          address: dict
          ->Dict.get("address")
          ->Option.getExn(~message="address is not found")
          ->decodeLocationAddress
          ->Utils.getResultExn(~message="address is coming as undefined"),
          gps: dict
          ->Dict.get("gps")
          ->Option.getExn(~message="gps is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="gps is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("StopReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: stopReq) => {
  req->asJson
}
