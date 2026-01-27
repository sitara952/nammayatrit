open Utils

@genType
type availableRoutesInfo = {
  isLiveTrackingAvailable: bool,
  routeCode: string,
  shortName: string,
}

let decodeAvailableRoutesInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          isLiveTrackingAvailable: getOptionBool(dict, "isLiveTrackingAvailable")->Option.getExn(
            ~message="isLiveTrackingAvailable not found",
          ),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          shortName: getOptionString(dict, "shortName")->Option.getExn(
            ~message="shortName not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AvailableRoutesInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: availableRoutesInfo) => {
  req->asJson
}
