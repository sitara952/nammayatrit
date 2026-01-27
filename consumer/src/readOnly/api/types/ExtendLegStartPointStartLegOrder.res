open Utils

@genType
type extendLegStartPointStartLegOrder = {contents: option<int>}

let decodeExtendLegStartPointStartLegOrder = data => {
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
      Console.log2("ExtendLegStartPointStartLegOrder ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: extendLegStartPointStartLegOrder) => {
  req->asJson
}
