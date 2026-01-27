open Utils

@genType
type verifyBusinessEmailReq = {
  otp: option<string>,
  token: option<string>,
}

let decodeVerifyBusinessEmailReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          otp: getOptionString(dict, "otp"),
          token: getOptionString(dict, "token"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VerifyBusinessEmailReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: verifyBusinessEmailReq) => {
  req->asJson
}
