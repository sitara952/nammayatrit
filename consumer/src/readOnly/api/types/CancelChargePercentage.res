open Utils

@genType
type cancelChargePercentage = {contents: option<int>}

let decodeCancelChargePercentage = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          contents: getOptionInt(dict, "contents"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CancelChargePercentage ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancelChargePercentage) => {
  req->asJson
}
