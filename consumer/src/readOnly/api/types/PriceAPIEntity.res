open Enums
open Utils

@genType
type priceAPIEntity = {
  amount: float,
  currency: Currency.currency,
}

let decodePriceAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          currency: Currency.decodeCurrencyResult(dict, "currency")->Utils.getResultExn(
            ~message="currency is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PriceAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: priceAPIEntity) => {
  req->asJson
}
