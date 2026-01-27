open Utils

@genType
type stationAPIEntity = {stopCode: string}

let decodeStationAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          stopCode: getOptionString(dict, "stopCode")->Option.getExn(~message="stopCode not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("StationAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: stationAPIEntity) => {
  req->asJson
}
