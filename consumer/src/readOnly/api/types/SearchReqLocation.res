open LatLong
open LocationAddress
open Utils

@genType
type searchReqLocation = {
  address: locationAddress,
  gps: latLong,
}

let decodeSearchReqLocation = data => {
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
      Console.log2("SearchReqLocation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: searchReqLocation) => {
  req->asJson
}
