open Enums
open Utils

@genType
type rateMultiModelTravelModes = {
  isExperienceGood: option<bool>,
  legOrder: int,
  rating: option<int>,
  travelMode: option<MultimodalTravelMode.multimodalTravelMode>,
}

let decodeRateMultiModelTravelModes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          isExperienceGood: getOptionBool(dict, "isExperienceGood"),
          legOrder: getOptionInt(dict, "legOrder")->Option.getExn(~message="legOrder not found"),
          rating: getOptionInt(dict, "rating"),
          travelMode: MultimodalTravelMode.decodeMultimodalTravelModeResult(
            dict,
            "travelMode",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RateMultiModelTravelModes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rateMultiModelTravelModes) => {
  req->asJson
}
