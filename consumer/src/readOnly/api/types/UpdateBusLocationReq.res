open Utils

@genType
type updateBusLocationReq = {
  lat: float,
  long: float,
  timestamp: float,
}

let decodeUpdateBusLocationReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          long: getOptionFloat(dict, "long")->Option.getExn(~message="long not found"),
          timestamp: getOptionFloat(dict, "timestamp")->Option.getExn(
            ~message="timestamp not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdateBusLocationReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updateBusLocationReq) => {
  req->asJson
}
