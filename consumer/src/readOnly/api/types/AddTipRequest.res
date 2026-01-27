open PriceAPIEntity
open Utils

@genType
type addTipRequest = {amount: priceAPIEntity}

let decodeAddTipRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: dict
          ->Dict.get("amount")
          ->Option.getExn(~message="amount is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="amount is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AddTipRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: addTipRequest) => {
  req->asJson
}
