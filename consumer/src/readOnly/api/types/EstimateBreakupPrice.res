open PriceAPIEntity
open Utils

@genType
type estimateBreakupPrice = {value: priceAPIEntity}

let decodeEstimateBreakupPrice = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          value: dict
          ->Dict.get("value")
          ->Option.getExn(~message="value is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="value is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EstimateBreakupPrice ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: estimateBreakupPrice) => {
  req->asJson
}
