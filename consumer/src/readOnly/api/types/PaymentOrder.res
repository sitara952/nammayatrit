open Enums
open CreateOrderResp
open Utils

@genType
type paymentOrder = {
  sdkPayload: option<createOrderResp>,
  status: FRFSBookingPaymentStatusAPI.fRFSBookingPaymentStatusAPI,
}

let decodePaymentOrder = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          sdkPayload: dict
          ->Dict.get("sdkPayload")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeCreateOrderResp(x)->Result.mapOr(None, x => Some(x))),
          status: FRFSBookingPaymentStatusAPI.decodeFRFSBookingPaymentStatusAPIResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentOrder ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentOrder) => {
  req->asJson
}
