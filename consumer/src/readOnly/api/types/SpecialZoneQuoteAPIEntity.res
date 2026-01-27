open PriceAPIEntity
open Utils

@genType
type specialZoneQuoteAPIEntity = {
  quoteId: string,
  tollCharges: option<priceAPIEntity>,
}

let decodeSpecialZoneQuoteAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          quoteId: getOptionString(dict, "quoteId")->Option.getExn(~message="quoteId not found"),
          tollCharges: dict
          ->Dict.get("tollCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SpecialZoneQuoteAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: specialZoneQuoteAPIEntity) => {
  req->asJson
}
