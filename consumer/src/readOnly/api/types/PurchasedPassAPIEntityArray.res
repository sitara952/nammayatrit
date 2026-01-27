open PurchasedPassAPIEntity
open Utils

@genType
type purchasedPassAPIEntityArray = array<purchasedPassAPIEntity>

let decodePurchasedPassAPIEntityArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodePurchasedPassAPIEntity(x)->Utils.getResultExn(
          ~message="error in parsing purchasedPassAPIEntity",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("PurchasedPassAPIEntityArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: purchasedPassAPIEntityArray) => {
  req->asJson
}
