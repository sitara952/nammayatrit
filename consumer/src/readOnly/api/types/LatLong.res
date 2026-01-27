open Utils

@genType
type latLong = {
  lat: float,
  lon: float,
}

let decodeLatLong = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LatLong ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: latLong) => {
  req->asJson
}
