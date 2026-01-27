open Version
open Utils

@genType
type appInstallsReq = {
  appVersion: option<version>,
  bundleVersion: option<version>,
  deviceToken: string,
  merchantId: string,
  platform: option<string>,
  source: option<string>,
}

let decodeAppInstallsReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          appVersion: dict
          ->Dict.get("appVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          bundleVersion: dict
          ->Dict.get("bundleVersion")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeVersion(x)->Result.mapOr(None, x => Some(x))),
          deviceToken: getOptionString(dict, "deviceToken")->Option.getExn(
            ~message="deviceToken not found",
          ),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          platform: getOptionString(dict, "platform"),
          source: getOptionString(dict, "source"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AppInstallsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: appInstallsReq) => {
  req->asJson
}
