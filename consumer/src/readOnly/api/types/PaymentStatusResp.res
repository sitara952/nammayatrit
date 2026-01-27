open Enums
open PaymentStatusRespMandatePaymentStatus
open PaymentStatusRespPDNNotificationStatusResp
open PaymentStatusRespPaymentStatus
open Utils

@genType
type paymentStatusResp =
  | PaymentStatus(paymentStatusRespPaymentStatus)
  | MandatePaymentStatus(paymentStatusRespMandatePaymentStatus)
  | PDNNotificationStatusResp(paymentStatusRespPDNNotificationStatusResp)

let decodePaymentStatusResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("PaymentStatus") =>
            data
            ->decodePaymentStatusRespPaymentStatus
            ->Result.map(x => PaymentStatus(x))
            ->Utils.getResultExn(~message="eventName is coming as undefined")
          | Some("MandatePaymentStatus") =>
            data
            ->decodePaymentStatusRespMandatePaymentStatus
            ->Result.map(x => MandatePaymentStatus(x))
            ->Utils.getResultExn(~message="eventName is coming as undefined")
          | Some("PDNNotificationStatusResp") =>
            data
            ->decodePaymentStatusRespPDNNotificationStatusResp
            ->Result.map(x => PDNNotificationStatusResp(x))
            ->Utils.getResultExn(~message="eventName is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentStatusResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentStatusResp) => {
  req->asJson
}
