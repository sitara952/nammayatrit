open PriceAPIEntity
open Utils

@genType
type paymentFareUpdate = {
  journeyLegOrder: int,
  newFare: priceAPIEntity,
  oldFare: priceAPIEntity,
}

let decodePaymentFareUpdate = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          journeyLegOrder: getOptionInt(dict, "journeyLegOrder")->Option.getExn(
            ~message="journeyLegOrder not found",
          ),
          newFare: dict
          ->Dict.get("newFare")
          ->Option.getExn(~message="newFare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="newFare is coming as undefined"),
          oldFare: dict
          ->Dict.get("oldFare")
          ->Option.getExn(~message="oldFare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="oldFare is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentFareUpdate ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentFareUpdate) => {
  req->asJson
}
