open Utils

@genType
type confirmRes = {
  bookingId: string,
  confirmTtl: int,
}

let decodeConfirmRes = data => {
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
          confirmTtl: getOptionInt(dict, "confirmTtl")->Option.getExn(
            ~message="confirmTtl not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ConfirmRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: confirmRes) => {
  req->asJson
}
