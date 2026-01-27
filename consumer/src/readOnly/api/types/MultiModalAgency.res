open Utils

@genType
type multiModalAgency = {
  gtfsId: option<string>,
  name: string,
}

let decodeMultiModalAgency = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          gtfsId: getOptionString(dict, "gtfsId"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultiModalAgency ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multiModalAgency) => {
  req->asJson
}
