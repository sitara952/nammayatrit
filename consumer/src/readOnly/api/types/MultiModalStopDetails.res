open Utils

@genType
type multiModalStopDetails = {
  gtfsId: option<string>,
  name: option<string>,
  platformCode: option<string>,
  stopCode: option<string>,
}

let decodeMultiModalStopDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          gtfsId: getOptionString(dict, "gtfsId"),
          name: getOptionString(dict, "name"),
          platformCode: getOptionString(dict, "platformCode"),
          stopCode: getOptionString(dict, "stopCode"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultiModalStopDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multiModalStopDetails) => {
  req->asJson
}
