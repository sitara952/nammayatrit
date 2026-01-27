open PriceAPIEntity
open Utils

@genType
type fareBreakupAPIEntity = {
  amount: int,
  amountWithCurrency: priceAPIEntity,
  description: string,
}

let decodeFareBreakupAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionInt(dict, "amount")->Option.getExn(~message="amount not found"),
          amountWithCurrency: dict
          ->Dict.get("amountWithCurrency")
          ->Option.getExn(~message="amountWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="amountWithCurrency is coming as undefined"),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FareBreakupAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fareBreakupAPIEntity) => {
  req->asJson
}
