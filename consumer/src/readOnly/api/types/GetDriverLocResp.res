open Utils

@genType
type getDriverLocResp = {
  lastUpdate: string,
  lat: float,
  lon: float,
  pickupEtaInMinutes: option<int>,
}

let decodeGetDriverLocResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          lastUpdate: getOptionString(dict, "lastUpdate")->Option.getExn(
            ~message="lastUpdate not found",
          ),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          pickupEtaInMinutes: getOptionInt(dict, "pickupEtaInMinutes"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetDriverLocResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getDriverLocResp) => {
  req->asJson
}
