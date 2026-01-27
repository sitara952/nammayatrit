open CreateOrderResp
open Utils

@genType
type passSelectionAPIEntity = {
  paymentOrder: option<createOrderResp>,
  purchasedPassId: string,
}

let decodePassSelectionAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          paymentOrder: dict
          ->Dict.get("paymentOrder")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeCreateOrderResp(x)->Result.mapOr(None, x => Some(x))),
          purchasedPassId: getOptionString(dict, "purchasedPassId")->Option.getExn(
            ~message="purchasedPassId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PassSelectionAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: passSelectionAPIEntity) => {
  req->asJson
}
