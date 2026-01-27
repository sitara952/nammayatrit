open BestOfferCombinationOffer
open OrderBreakup
open Utils

@genType
type bestOfferCombination = {
  offers: array<bestOfferCombinationOffer>,
  orderBreakup: orderBreakup,
}

let decodeBestOfferCombination = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          offers: dict
          ->Dict.get("offers")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="offers is not of array")
          ->Array.map(x =>
            decodeBestOfferCombinationOffer(x)->Utils.getResultExn(
              ~message="offers is coming as undefined",
            )
          ),
          orderBreakup: dict
          ->Dict.get("orderBreakup")
          ->Option.getExn(~message="orderBreakup is not found")
          ->decodeOrderBreakup
          ->Utils.getResultExn(~message="orderBreakup is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BestOfferCombination ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bestOfferCombination) => {
  req->asJson
}
