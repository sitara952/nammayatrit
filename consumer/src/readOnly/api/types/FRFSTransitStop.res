open Utils

@genType
type fRFSTransitStop = {
  lat: float,
  lon: float,
  stopName: string,
  stopType: option<string>,
}

let decodeFRFSTransitStop = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          stopName: getOptionString(dict, "stopName")->Option.getExn(~message="stopName not found"),
          stopType: getOptionString(dict, "stopType"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSTransitStop ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSTransitStop) => {
  req->asJson
}
