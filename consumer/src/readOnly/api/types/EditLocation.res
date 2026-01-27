open LatLong
open LocationAddress
open Utils

@genType
type editLocation = {
  address: locationAddress,
  gps: latLong,
}

let decodeEditLocation = data => {
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
      Console.log2("EditLocation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: editLocation) => {
  req->asJson
}
