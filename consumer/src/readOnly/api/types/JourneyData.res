open Enums
open Distance
open JourneyLeg
open Utils

@genType
type journeyData = {
  distance: distance,
  duration: option<int>,
  endTime: option<string>,
  hasPreferredServiceTier: option<bool>,
  hasPreferredTransitModes: option<bool>,
  journeyId: string,
  journeyLegs: array<journeyLeg>,
  modes: array<MultimodalTravelMode.multimodalTravelMode>,
  relevanceScore: float,
  startTime: option<string>,
  totalMaxFare: float,
  totalMinFare: float,
}

let decodeJourneyData = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          distance: dict
          ->Dict.get("distance")
          ->Option.getExn(~message="distance is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="distance is coming as undefined"),
          duration: getOptionInt(dict, "duration"),
          endTime: getOptionString(dict, "endTime"),
          hasPreferredServiceTier: getOptionBool(dict, "hasPreferredServiceTier"),
          hasPreferredTransitModes: getOptionBool(dict, "hasPreferredTransitModes"),
          journeyId: getOptionString(dict, "journeyId")->Option.getExn(
            ~message="journeyId not found",
          ),
          journeyLegs: dict
          ->Dict.get("journeyLegs")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="journeyLegs is not of array")
          ->Array.map(x =>
            decodeJourneyLeg(x)->Utils.getResultExn(~message="journeyLegs is coming as undefined")
          ),
          modes: dict
          ->Dict.get("modes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="modes not found")
          ->Array.map(x =>
            MultimodalTravelMode.decodeMultimodalTravelMode(x)->Utils.getResultExn(
              ~message="modes is coming as undefined",
            )
          ),
          relevanceScore: getOptionFloat(dict, "relevanceScore")->Option.getExn(
            ~message="relevanceScore not found",
          ),
          startTime: getOptionString(dict, "startTime"),
          totalMaxFare: getOptionFloat(dict, "totalMaxFare")->Option.getExn(
            ~message="totalMaxFare not found",
          ),
          totalMinFare: getOptionFloat(dict, "totalMinFare")->Option.getExn(
            ~message="totalMinFare not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyData ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyData) => {
  req->asJson
}
