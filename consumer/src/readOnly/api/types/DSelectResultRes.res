open Utils

@genType
type dSelectResultRes = {selectTtl: int}

let decodeDSelectResultRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          selectTtl: getOptionInt(dict, "selectTtl")->Option.getExn(~message="selectTtl not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DSelectResultRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: dSelectResultRes) => {
  req->asJson
}
