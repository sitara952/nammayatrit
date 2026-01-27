open Utils

@genType
type feePercentage = {contents: option<int>}

let decodeFeePercentage = data => {
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
      Console.log2("FeePercentage ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feePercentage) => {
  req->asJson
}
