open Enums
open Utils

@genType
type price = {
  amount: float,
  amountInt: int,
  currency: Currency.currency,
}

let decodePrice = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          amountInt: getOptionInt(dict, "amountInt")->Option.getExn(~message="amountInt not found"),
          currency: Currency.decodeCurrencyResult(dict, "currency")->Utils.getResultExn(
            ~message="currency is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Price ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: price) => {
  req->asJson
}
