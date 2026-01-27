open Utils

@genType
type verifyBusinessEmailRes = {
  message: string,
  verified: bool,
}

let decodeVerifyBusinessEmailRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          verified: getOptionBool(dict, "verified")->Option.getExn(~message="verified not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VerifyBusinessEmailRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: verifyBusinessEmailRes) => {
  req->asJson
}
