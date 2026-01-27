open PriceAPIEntity
open Utils

@genType
type businessDiscountInfoAPIEntity = {
  businessDiscount: int,
  businessDiscountPercentage: float,
  businessDiscountWithCurrency: priceAPIEntity,
}

let decodeBusinessDiscountInfoAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          businessDiscount: getOptionInt(dict, "businessDiscount")->Option.getExn(
            ~message="businessDiscount not found",
          ),
          businessDiscountPercentage: getOptionFloat(
            dict,
            "businessDiscountPercentage",
          )->Option.getExn(~message="businessDiscountPercentage not found"),
          businessDiscountWithCurrency: dict
          ->Dict.get("businessDiscountWithCurrency")
          ->Option.getExn(~message="businessDiscountWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="businessDiscountWithCurrency is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BusinessDiscountInfoAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: businessDiscountInfoAPIEntity) => {
  req->asJson
}
