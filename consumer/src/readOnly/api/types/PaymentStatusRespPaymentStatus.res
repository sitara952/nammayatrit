open Enums
open CardInfo
open RefundsData
open Utils

@genType
type paymentStatusRespPaymentStatus = {
  authIdCode: option<string>,
  bankErrorCode: option<string>,
  bankErrorMessage: option<string>,
  card: option<cardInfo>,
  isRetargeted: option<bool>,
  isRetried: option<bool>,
  payerVpa: option<string>,
  paymentMethodType: option<string>,
  refunds: array<refundsData>,
  retargetLink: option<string>,
  amount: option<float>,
  status: TransactionStatus.transactionStatus,
  paymentServiceType: option<string>,
  txnUUID: option<string>,
  paymentFulfillmentStatus: PaymentFulfillmentStatus.paymentFulfillmentStatus,
  domainEntityId: option<string>,
}

let decodePaymentStatusRespPaymentStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          authIdCode: getOptionString(dict, "authIdCode"),
          bankErrorCode: getOptionString(dict, "bankErrorCode"),
          bankErrorMessage: getOptionString(dict, "bankErrorMessage"),
          card: dict
          ->Dict.get("card")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeCardInfo(x)->Result.mapOr(None, x => Some(x))),
          isRetargeted: getOptionBool(dict, "isRetargeted"),
          isRetried: getOptionBool(dict, "isRetried"),
          payerVpa: getOptionString(dict, "payerVpa"),
          paymentServiceType: getOptionString(dict, "paymentServiceType"),
          paymentMethodType: getOptionString(dict, "paymentMethodType"),
          amount: getOptionFloat(dict, "amount"),
          refunds: dict
          ->Dict.get("refunds")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="refunds is not of array")
          ->Array.map(x =>
            decodeRefundsData(x)->Utils.getResultExn(~message="refunds is coming as undefined")
          ),
          retargetLink: getOptionString(dict, "retargetLink"),
          status: TransactionStatus.decodeTransactionStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          txnUUID: getOptionString(dict, "txnUUID"),
          paymentFulfillmentStatus: PaymentFulfillmentStatus.decodePaymentFulfillmentStatusResult(
            dict,
            "paymentFulfillmentStatus",
          )->Utils.getResultExn(~message="paymentFulfillmentStatus is coming as undefined"),
          domainEntityId: getOptionString(dict, "domainEntityId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentStatusRespPaymentStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentStatusRespPaymentStatus) => {
  req->asJson
}
