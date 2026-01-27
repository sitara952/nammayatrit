open Utils

@genType
type getSDKDataResponse = {
  respCode: int,
  respMessage: string,
  sdkData: string,
}

let decodeGetSDKDataResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          respCode: getOptionInt(dict, "respCode")->Option.getExn(~message="respCode not found"),
          respMessage: getOptionString(dict, "respMessage")->Option.getExn(
            ~message="respMessage not found",
          ),
          sdkData: getOptionString(dict, "sdkData")->Option.getExn(~message="sdkData not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetSDKDataResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getSDKDataResponse) => {
  req->asJson
}
