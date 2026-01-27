open Utils

@genType
type safetyCheckSupportReq = {
  bookingId: string,
  description: string,
  isSafe: bool,
}

let decodeSafetyCheckSupportReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId")->Option.getExn(
            ~message="bookingId not found",
          ),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          isSafe: getOptionBool(dict, "isSafe")->Option.getExn(~message="isSafe not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SafetyCheckSupportReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: safetyCheckSupportReq) => {
  req->asJson
}
