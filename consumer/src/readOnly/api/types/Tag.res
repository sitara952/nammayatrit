open Utils

@genType
type tag = {
  name: string,
  value: string,
}

let decodeTag = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          value: getOptionString(dict, "value")->Option.getExn(~message="value not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Tag ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: tag) => {
  req->asJson
}
