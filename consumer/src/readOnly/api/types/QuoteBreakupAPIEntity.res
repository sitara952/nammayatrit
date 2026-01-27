open PriceAPIEntity
open Utils

@genType
type quoteBreakupAPIEntity = {
  priceWithCurrency: priceAPIEntity,
  title: string,
}

let decodeQuoteBreakupAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
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
      Console.log2("QuoteBreakupAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: quoteBreakupAPIEntity) => {
  req->asJson
}
