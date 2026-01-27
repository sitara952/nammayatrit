open PriceAPIEntity
open Utils

@genType
type waitingChargesAPIEntity = {
  waitingChargePerMin: option<int>,
  waitingChargePerMinWithCurrency: option<priceAPIEntity>,
}

let decodeWaitingChargesAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          waitingChargePerMin: getOptionInt(dict, "waitingChargePerMin"),
          waitingChargePerMinWithCurrency: dict
          ->Dict.get("waitingChargePerMinWithCurrency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("WaitingChargesAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: waitingChargesAPIEntity) => {
  req->asJson
}
