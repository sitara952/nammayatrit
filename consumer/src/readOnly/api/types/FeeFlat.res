open Utils

@genType
type feeFlat = {contents: option<float>}

let decodeFeeFlat = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          contents: getOptionFloat(dict, "contents"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeeFlat ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feeFlat) => {
  req->asJson
}
