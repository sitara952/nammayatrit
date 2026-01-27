open EditLocation
open Utils

@genType
type editLocationReq = {
  destination: option<editLocation>,
  origin: option<editLocation>,
}

let decodeEditLocationReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          destination: dict
          ->Dict.get("destination")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeEditLocation(x)->Result.mapOr(None, x => Some(x))),
          origin: dict
          ->Dict.get("origin")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeEditLocation(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EditLocationReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: editLocationReq) => {
  req->asJson
}
