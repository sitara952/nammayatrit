open Enums
open Utils

@genType
type multiModalLegGate = {
  absoluteDirection: option<AbsoluteDirection.absoluteDirection>,
  area: option<bool>,
  bogusName: option<bool>,
  distance: option<float>,
  exit: option<string>,
  isEntrance: option<bool>,
  lat: option<float>,
  lon: option<float>,
  stayOn: option<bool>,
  streetName: option<string>,
  walkingBike: option<bool>,
}

let decodeMultiModalLegGate = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          absoluteDirection: AbsoluteDirection.decodeAbsoluteDirectionResult(
            dict,
            "absoluteDirection",
          )->Result.mapOr(None, x => Some(x)),
          area: getOptionBool(dict, "area"),
          bogusName: getOptionBool(dict, "bogusName"),
          distance: getOptionFloat(dict, "distance"),
          exit: getOptionString(dict, "exit"),
          isEntrance: getOptionBool(dict, "isEntrance"),
          lat: getOptionFloat(dict, "lat"),
          lon: getOptionFloat(dict, "lon"),
          stayOn: getOptionBool(dict, "stayOn"),
          streetName: getOptionString(dict, "streetName"),
          walkingBike: getOptionBool(dict, "walkingBike"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultiModalLegGate ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multiModalLegGate) => {
  req->asJson
}
