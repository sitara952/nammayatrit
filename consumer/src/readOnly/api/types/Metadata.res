open Utils

@genType
type metadata = {
  icon: option<string>,
  key: string,
  value: string,
}

let decodeMetadata = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          icon: getOptionString(dict, "icon"),
          key: getOptionString(dict, "key")->Option.getExn(~message="key not found"),
          value: getOptionString(dict, "value")->Option.getExn(~message="value not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Metadata ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: metadata) => {
  req->asJson
}
