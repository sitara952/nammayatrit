open Enums
open Utils

@genType
type multimodalTransitOptionData = {
  duration: option<int>,
  travelModes: array<MultimodalTravelMode.multimodalTravelMode>,
}

let decodeMultimodalTransitOptionData = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          duration: getOptionInt(dict, "duration"),
          travelModes: dict
          ->Dict.get("travelModes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="travelModes not found")
          ->Array.map(x =>
            MultimodalTravelMode.decodeMultimodalTravelMode(x)->Utils.getResultExn(
              ~message="travelModes is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultimodalTransitOptionData ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multimodalTransitOptionData) => {
  req->asJson
}
