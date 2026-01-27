open Utils

@genType
type aadhaarVerificationResp = {
  message: string,
  requestId: string,
  statusCode: string,
  transactionId: option<string>,
}

let decodeAadhaarVerificationResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          requestId: getOptionString(dict, "requestId")->Option.getExn(
            ~message="requestId not found",
          ),
          statusCode: getOptionString(dict, "statusCode")->Option.getExn(
            ~message="statusCode not found",
          ),
          transactionId: getOptionString(dict, "transactionId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AadhaarVerificationResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: aadhaarVerificationResp) => {
  req->asJson
}
