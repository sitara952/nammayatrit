open Utils

@genType
type multimodalSelectRes = {
  journeyId: option<string>,
  result: string,
}

let decodeMultimodalSelectRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          journeyId: getOptionString(dict, "journeyId"),
          result: getOptionString(dict, "result")->Option.getExn(~message="result not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultimodalSelectRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multimodalSelectRes) => {
  req->asJson
}
