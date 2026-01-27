open LatLong
open Utils

@genType
type metroStation = {
  name: string,
  point: latLong,
  stationCode: option<string>,
}

let decodeMetroStation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          point: dict
          ->Dict.get("point")
          ->Option.getExn(~message="point is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="point is coming as undefined"),
          stationCode: getOptionString(dict, "stationCode"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MetroStation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: metroStation) => {
  req->asJson
}
