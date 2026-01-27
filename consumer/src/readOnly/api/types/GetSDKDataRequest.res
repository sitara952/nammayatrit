open Utils

@genType
type getSDKDataRequest = {
  deviceID: string,
  mobileNo: string,
}

let decodeGetSDKDataRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          deviceID: getOptionString(dict, "deviceID")->Option.getExn(~message="deviceID not found"),
          mobileNo: getOptionString(dict, "mobileNo")->Option.getExn(~message="mobileNo not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetSDKDataRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getSDKDataRequest) => {
  req->asJson
}
