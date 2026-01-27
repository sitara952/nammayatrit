open LocationAPIEntity
open Utils

@genType
type startLocationType = {
  legOrder: int,
  location: locationAPIEntity,
}

let decodeStartLocationType = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          legOrder: getOptionInt(dict, "legOrder")->Option.getExn(~message="legOrder not found"),
          location: dict
          ->Dict.get("location")
          ->Option.getExn(~message="location is not found")
          ->decodeLocationAPIEntity
          ->Utils.getResultExn(~message="location is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("StartLocationType ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: startLocationType) => {
  req->asJson
}
