open RateMultiModelTravelModes
open Utils

@genType
type journeyFeedBackForm = {
  additionalFeedBack: option<string>,
  rateTravelMode: array<rateMultiModelTravelModes>,
  rating: option<int>,
}

let decodeJourneyFeedBackForm = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          additionalFeedBack: getOptionString(dict, "additionalFeedBack"),
          rateTravelMode: dict
          ->Dict.get("rateTravelMode")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="rateTravelMode is not of array")
          ->Array.map(x =>
            decodeRateMultiModelTravelModes(x)->Utils.getResultExn(
              ~message="rateTravelMode is coming as undefined",
            )
          ),
          rating: getOptionInt(dict, "rating"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyFeedBackForm ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyFeedBackForm) => {
  req->asJson
}
