open Utils

@genType
type passSwitchDeviceIdReq = {deviceId: option<string>, imeiNumber: string}

let decodePassSwitchDeviceIdReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          deviceId: getOptionString(dict, "deviceId"),
          imeiNumber: getOptionString(dict, "imeiNumber")->Option.getExn(
            ~message="imeiNumber not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassSwitchDeviceIdReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passSwitchDeviceIdReq) => {
  req->asJson
}
