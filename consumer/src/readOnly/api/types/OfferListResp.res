open BestOfferCombination
open OfferResp
open Utils

@genType
type offerListResp = {
  bestOfferCombination: option<bestOfferCombination>,
  offerResp: array<offerResp>,
}

let decodeOfferListResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bestOfferCombination: dict
          ->Dict.get("bestOfferCombination")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeBestOfferCombination(x)->Result.mapOr(None, x => Some(x))
          ),
          offerResp: dict
          ->Dict.get("offerResp")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="offerResp is not of array")
          ->Array.map(x =>
            decodeOfferResp(x)->Utils.getResultExn(~message="offerResp is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OfferListResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: offerListResp) => {
  req->asJson
}
