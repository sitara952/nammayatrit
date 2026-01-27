open PriceAPIEntity
open Utils

@genType
type fareRangeAPIEntity = {
  maxFare: int,
  maxFareWithCurrency: priceAPIEntity,
  minFare: int,
  minFareWithCurrency: priceAPIEntity,
}

let decodeFareRangeAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          maxFare: getOptionInt(dict, "maxFare")->Option.getExn(~message="maxFare not found"),
          maxFareWithCurrency: dict
          ->Dict.get("maxFareWithCurrency")
          ->Option.getExn(~message="maxFareWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="maxFareWithCurrency is coming as undefined"),
          minFare: getOptionInt(dict, "minFare")->Option.getExn(~message="minFare not found"),
          minFareWithCurrency: dict
          ->Dict.get("minFareWithCurrency")
          ->Option.getExn(~message="minFareWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="minFareWithCurrency is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FareRangeAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fareRangeAPIEntity) => {
  req->asJson
}
