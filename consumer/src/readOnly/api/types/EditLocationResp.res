open Utils

@genType
type editLocationResp = {
  bookingUpdateRequestId: option<string>,
  result: string,
}

let decodeEditLocationResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingUpdateRequestId: getOptionString(dict, "bookingUpdateRequestId"),
          result: getOptionString(dict, "result")->Option.getExn(~message="result not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EditLocationResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: editLocationResp) => {
  req->asJson
}
