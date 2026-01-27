open Enums
open CreateOrderResp
open Utils

@genType
type fRFSBookingPaymentAPI = {
  paymentOrder: option<createOrderResp>,
  status: FRFSBookingPaymentStatusAPI.fRFSBookingPaymentStatusAPI,
  transactionId: option<string>,
}

let decodeFRFSBookingPaymentAPI = data => {
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
          status: FRFSBookingPaymentStatusAPI.decodeFRFSBookingPaymentStatusAPIResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          transactionId: getOptionString(dict, "transactionId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSBookingPaymentAPI ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSBookingPaymentAPI) => {
  req->asJson
}
