open Enums
open Utils

@genType
type authVerifyReq = {
  deviceToken: string,
  otp: string,
  whatsappNotificationEnroll: option<OptApiMethods.optApiMethods>,
}

let decodeAuthVerifyReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          deviceToken: getOptionString(dict, "deviceToken")->Option.getExn(
            ~message="deviceToken not found",
          ),
          otp: getOptionString(dict, "otp")->Option.getExn(~message="otp not found"),
          whatsappNotificationEnroll: OptApiMethods.decodeOptApiMethodsResult(
            dict,
            "whatsappNotificationEnroll",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AuthVerifyReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: authVerifyReq) => {
  req->asJson
}
