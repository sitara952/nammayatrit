open Utils

@genType
type verifyAadhaarOtpReq = {
  otp: int,
  shareCode: string,
}

let decodeVerifyAadhaarOtpReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          otp: getOptionInt(dict, "otp")->Option.getExn(~message="otp not found"),
          shareCode: getOptionString(dict, "shareCode")->Option.getExn(
            ~message="shareCode not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VerifyAadhaarOtpReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: verifyAadhaarOtpReq) => {
  req->asJson
}
