open PriceAPIEntity
open Utils

@genType
type estimateBreakupAPIEntity = {
  price: int,
  priceWithCurrency: priceAPIEntity,
  title: string,
}

let decodeEstimateBreakupAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          price: getOptionInt(dict, "price")->Option.getExn(~message="price not found"),
          priceWithCurrency: dict
          ->Dict.get("priceWithCurrency")
          ->Option.getExn(~message="priceWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="priceWithCurrency is coming as undefined"),
          title: getOptionString(dict, "title")->Option.getExn(~message="title not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EstimateBreakupAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: estimateBreakupAPIEntity) => {
  req->asJson
}
