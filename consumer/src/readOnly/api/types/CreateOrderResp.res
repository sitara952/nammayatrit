open Enums
open PaymentLinks
open SDKPayload
open Utils

@genType
type createOrderResp = {
  id: string,
  order_id: string,
  payment_links: option<paymentLinks>,
  sdk_payload: sDKPayload,
  sdk_payload_json: string,
  status: TransactionStatus.transactionStatus,
}

let decodeCreateOrderResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          order_id: getOptionString(dict, "order_id")->Option.getExn(~message="order_id not found"),
          payment_links: dict
          ->Dict.get("payment_links")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePaymentLinks(x)->Result.mapOr(None, x => Some(x))),
          sdk_payload: dict
          ->Dict.get("sdk_payload")
          ->Option.getExn(~message="sdk_payload is not found")
          ->decodeSDKPayload
          ->Utils.getResultExn(~message="sdk_payload is coming as undefined"),
          sdk_payload_json: getOptionalJsonAsString(dict, "sdk_payload_json")->Option.getExn(
            ~message="sdk_payload_json not found",
          ),
          status: TransactionStatus.decodeTransactionStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CreateOrderResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: createOrderResp) => {
  req->asJson
}
