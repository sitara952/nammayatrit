open Enums
open Utils

@genType
type multimodalUserPreferences = {
  allowedTransitModes: array<MultimodalTravelMode.multimodalTravelMode>,
  busTransitTypes: option<array<FRFSServiceTierType.fRFSServiceTierType>>,
  journeyOptionsSortingType: option<JourneyOptionsSortingType.journeyOptionsSortingType>,
  subwayTransitTypes: option<array<FRFSServiceTierType.fRFSServiceTierType>>,
}

let decodeMultimodalUserPreferences = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowedTransitModes: dict
          ->Dict.get("allowedTransitModes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="allowedTransitModes not found")
          ->Array.map(x =>
            MultimodalTravelMode.decodeMultimodalTravelMode(x)->Utils.getResultExn(
              ~message="allowedTransitModes is coming as undefined",
            )
          ),
          busTransitTypes: dict
          ->Dict.get("busTransitTypes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              FRFSServiceTierType.decodeFRFSServiceTierType(x)->Utils.getResultExn(
                ~message="busTransitTypes is coming as undefined",
              )
            )
          ),
          journeyOptionsSortingType: JourneyOptionsSortingType.decodeJourneyOptionsSortingTypeResult(
            dict,
            "journeyOptionsSortingType",
          )->Result.mapOr(None, x => Some(x)),
          subwayTransitTypes: dict
          ->Dict.get("subwayTransitTypes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              FRFSServiceTierType.decodeFRFSServiceTierType(x)->Utils.getResultExn(
                ~message="subwayTransitTypes is coming as undefined",
              )
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultimodalUserPreferences ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multimodalUserPreferences) => {
  req->asJson
}
