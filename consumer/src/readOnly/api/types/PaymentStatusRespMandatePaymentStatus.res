open Enums
open Upi
open Utils

@genType
type paymentStatusRespMandatePaymentStatus = {
  bankErrorCode: option<string>,
  bankErrorMessage: option<string>,
  mandateEndDate: string,
  mandateId: string,
  mandateMaxAmount: float,
  mandateStartDate: string,
  mandateStatus: MandateStatus.mandateStatus,
  payerVpa: option<string>,
  amount: option<float>,
  status: TransactionStatus.transactionStatus,
  paymentServiceType: option<string>,
  upi: option<upi>,
}

let decodePaymentStatusRespMandatePaymentStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bankErrorCode: getOptionString(dict, "bankErrorCode"),
          bankErrorMessage: getOptionString(dict, "bankErrorMessage"),
          amount: getOptionFloat(dict, "amount"),
          paymentServiceType: getOptionString(dict, "paymentServiceType"),
          mandateEndDate: getOptionString(dict, "mandateEndDate")->Option.getExn(
            ~message="mandateEndDate not found",
          ),
          mandateId: getOptionString(dict, "mandateId")->Option.getExn(
            ~message="mandateId not found",
          ),
          mandateMaxAmount: getOptionFloat(dict, "mandateMaxAmount")->Option.getExn(
            ~message="mandateMaxAmount not found",
          ),
          mandateStartDate: getOptionString(dict, "mandateStartDate")->Option.getExn(
            ~message="mandateStartDate not found",
          ),
          mandateStatus: MandateStatus.decodeMandateStatusResult(
            dict,
            "mandateStatus",
          )->Utils.getResultExn(~message="mandateStatus is coming as undefined"),
          payerVpa: getOptionString(dict, "payerVpa"),
          status: TransactionStatus.decodeTransactionStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          upi: dict
          ->Dict.get("upi")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeUpi(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentStatusRespMandatePaymentStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentStatusRespMandatePaymentStatus) => {
  req->asJson
}
