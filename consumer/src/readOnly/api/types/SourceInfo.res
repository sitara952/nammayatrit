open Utils

@genType
type sourceInfo = {
  sourceAmount: option<float>,
  txnDate: option<string>,
}

let decodeSourceInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          sourceAmount: getOptionFloat(dict, "sourceAmount"),
          txnDate: getOptionString(dict, "txnDate"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SourceInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sourceInfo) => {
  req->asJson
}
