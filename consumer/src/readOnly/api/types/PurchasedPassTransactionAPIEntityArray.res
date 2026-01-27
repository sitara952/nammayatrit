open PurchasedPassTransactionAPIEntity
open Utils

@genType
type purchasedPassTransactionAPIEntityArray = array<purchasedPassTransactionAPIEntity>

let decodePurchasedPassTransactionAPIEntityArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodePurchasedPassTransactionAPIEntity(x)->Utils.getResultExn(
          ~message="error in parsing purchasedPassTransactionAPIEntity",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("PurchasedPassTransactionAPIEntityArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: purchasedPassTransactionAPIEntityArray) => {
  req->asJson
}
