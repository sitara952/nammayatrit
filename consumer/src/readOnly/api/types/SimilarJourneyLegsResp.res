open JourneyLegOption
open Utils

@genType
type similarJourneyLegsResp = {
  allLegsLoaded: option<bool>,
  journeyLegsInfo: array<journeyLegOption>,
}

let decodeSimilarJourneyLegsResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allLegsLoaded: getOptionBool(dict, "allLegsLoaded"),
          journeyLegsInfo: dict
          ->Dict.get("journeyLegsInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="journeyLegsInfo is not of array")
          ->Array.map(x =>
            decodeJourneyLegOption(x)->Utils.getResultExn(
              ~message="journeyLegsInfo is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SimilarJourneyLegsResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: similarJourneyLegsResp) => {
  req->asJson
}
