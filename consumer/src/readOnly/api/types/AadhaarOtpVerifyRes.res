open Utils

@genType
type aadhaarOtpVerifyRes = {
  code: string,
  date_of_birth: string,
  gender: string,
  image: string,
  message: string,
  name: string,
  request_id: string,
  share_code: string,
  transactionId: string,
}

let decodeAadhaarOtpVerifyRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          date_of_birth: getOptionString(dict, "date_of_birth")->Option.getExn(
            ~message="date_of_birth not found",
          ),
          gender: getOptionString(dict, "gender")->Option.getExn(~message="gender not found"),
          image: getOptionString(dict, "image")->Option.getExn(~message="image not found"),
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          request_id: getOptionString(dict, "request_id")->Option.getExn(
            ~message="request_id not found",
          ),
          share_code: getOptionString(dict, "share_code")->Option.getExn(
            ~message="share_code not found",
          ),
          transactionId: getOptionString(dict, "transactionId")->Option.getExn(
            ~message="transactionId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AadhaarOtpVerifyRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: aadhaarOtpVerifyRes) => {
  req->asJson
}
