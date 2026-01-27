open Utils

@genType
type split = {
  frfsBookingId: string,
  splitAmount: float,
}

let decodeSplit = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          frfsBookingId: getOptionString(dict, "frfsBookingId")->Option.getExn(
            ~message="frfsBookingId not found",
          ),
          splitAmount: getOptionFloat(dict, "splitAmount")->Option.getExn(
            ~message="splitAmount not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Split ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: split) => {
  req->asJson
}
