open Utils

@genType
type aadhaarOtpReq = {
  aadhaarNumber: string,
  consent: string,
}

let decodeAadhaarOtpReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          aadhaarNumber: getOptionString(dict, "aadhaarNumber")->Option.getExn(
            ~message="aadhaarNumber not found",
          ),
          consent: getOptionString(dict, "consent")->Option.getExn(~message="consent not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AadhaarOtpReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: aadhaarOtpReq) => {
  req->asJson
}
