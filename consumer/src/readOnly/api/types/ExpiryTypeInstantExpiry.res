open Utils

@genType
type expiryTypeInstantExpiry = {contents: option<int>}

let decodeExpiryTypeInstantExpiry = data => {
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
      Console.log2("ExpiryTypeInstantExpiry ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: expiryTypeInstantExpiry) => {
  req->asJson
}
