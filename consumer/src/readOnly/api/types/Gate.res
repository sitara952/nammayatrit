open Utils

@genType
type gate = {
  gateName: string,
  lat: float,
  lon: float,
  stopCode: string,
}

let decodeGate = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          gateName: getOptionString(dict, "gateName")->Option.getExn(~message="gateName not found"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          stopCode: getOptionString(dict, "stopCode")->Option.getExn(~message="stopCode not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Gate ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: gate) => {
  req->asJson
}
