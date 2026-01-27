open Enums
open JourneyData
open JourneyInfoResp
open Utils

@genType
type multimodalSearchResp = {
  crisSdkToken: option<string>,
  firstJourney: option<journeyData>,
  firstJourneyInfo: option<journeyInfoResp>,
  journeys: array<journeyData>,
  multimodalWarning: option<MultimodalWarning.multimodalWarning>,
  searchExpiry: string,
  searchId: string,
  showMultimodalWarning: bool,
}

let decodeMultimodalSearchResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          crisSdkToken: getOptionString(dict, "crisSdkToken"),
          firstJourney: dict
          ->Dict.get("firstJourney")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeJourneyData(x)->Result.mapOr(None, x => Some(x))),
          firstJourneyInfo: dict
          ->Dict.get("firstJourneyInfo")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeJourneyInfoResp(x)->Result.mapOr(None, x => Some(x))),
          journeys: dict
          ->Dict.get("journeys")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="journeys is not of array")
          ->Array.map(x =>
            decodeJourneyData(x)->Utils.getResultExn(~message="journeys is coming as undefined")
          ),
          multimodalWarning: MultimodalWarning.decodeMultimodalWarningResult(
            dict,
            "multimodalWarning",
          )->Result.mapOr(None, x => Some(x)),
          searchExpiry: getOptionString(dict, "searchExpiry")->Option.getExn(
            ~message="searchExpiry not found",
          ),
          searchId: getOptionString(dict, "searchId")->Option.getExn(~message="searchId not found"),
          showMultimodalWarning: getOptionBool(dict, "showMultimodalWarning")->Option.getExn(
            ~message="showMultimodalWarning not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultimodalSearchResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multimodalSearchResp) => {
  req->asJson
}
