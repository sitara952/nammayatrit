open Utils

@genType
type rule = {timezone: int}

let decodeRule = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          timezone: getOptionInt(dict, "timezone")->Option.getExn(~message="timezone not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Rule ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rule) => {
  req->asJson
}
