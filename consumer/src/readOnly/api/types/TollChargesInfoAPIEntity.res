open PriceAPIEntity
open Utils

@genType
type tollChargesInfoAPIEntity = {
  tollChargesWithCurrency: priceAPIEntity,
  tollNames: array<string>,
}

let decodeTollChargesInfoAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          tollChargesWithCurrency: dict
          ->Dict.get("tollChargesWithCurrency")
          ->Option.getExn(~message="tollChargesWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="tollChargesWithCurrency is coming as undefined"),
          tollNames: getOptionStrArrayFromDict(dict, "tollNames")->Option.getExn(
            ~message="tollNames not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TollChargesInfoAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: tollChargesInfoAPIEntity) => {
  req->asJson
}
