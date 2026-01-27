open Utils

@genType
type latLngV2 = {
  latitude: float,
  longitude: float,
}

let decodeLatLngV2 = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          latitude: getOptionFloat(dict, "latitude")->Option.getExn(~message="latitude not found"),
          longitude: getOptionFloat(dict, "longitude")->Option.getExn(
            ~message="longitude not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LatLngV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: latLngV2) => {
  req->asJson
}
