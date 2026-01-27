open Utils

@genType
type publicTransportStation = {
  lat: float,
  lon: float,
  name: string,
  stationCode: string,
}

let decodePublicTransportStation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          stationCode: getOptionString(dict, "stationCode")->Option.getExn(
            ~message="stationCode not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PublicTransportStation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: publicTransportStation) => {
  req->asJson
}
