open Utils

@genType
type changeStopsResp = {stationsChanged: bool}

let decodeChangeStopsResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          stationsChanged: getOptionBool(dict, "stationsChanged")->Option.getExn(
            ~message="stationsChanged not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ChangeStopsResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: changeStopsResp) => {
  req->asJson
}
