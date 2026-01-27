open Utils

@genType
type markAsSafeReq = {
  isMock: option<bool>,
  isRideEnded: option<bool>,
}

let decodeMarkAsSafeReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          isMock: getOptionBool(dict, "isMock"),
          isRideEnded: getOptionBool(dict, "isRideEnded"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MarkAsSafeReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: markAsSafeReq) => {
  req->asJson
}
