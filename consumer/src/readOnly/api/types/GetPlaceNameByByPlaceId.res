open Utils

@genType
type getPlaceNameByByPlaceId = {contents: option<string>}

let decodeGetPlaceNameByByPlaceId = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          contents: getOptionString(dict, "contents"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetPlaceNameByByPlaceId ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getPlaceNameByByPlaceId) => {
  req->asJson
}
