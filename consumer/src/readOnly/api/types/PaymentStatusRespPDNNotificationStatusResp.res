open Enums
open SourceInfo
open Utils

@genType
type paymentStatusRespPDNNotificationStatusResp = {
  eventName: option<PaymentStatus.paymentStatus>,
  juspayProviedId: string,
  notificationId: string,
  notificationStatus: NotificationStatus.notificationStatus,
  notificationType: option<string>,
  responseCode: option<string>,
  responseMessage: option<string>,
  sourceInfo: sourceInfo,
  sourceObject: option<string>,
}

let decodePaymentStatusRespPDNNotificationStatusResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          eventName: PaymentStatus.decodePaymentStatusResult(dict, "eventName")->Result.mapOr(
            None,
            x => Some(x),
          ),
          juspayProviedId: getOptionString(dict, "juspayProviedId")->Option.getExn(
            ~message="juspayProviedId not found",
          ),
          notificationId: getOptionString(dict, "notificationId")->Option.getExn(
            ~message="notificationId not found",
          ),
          notificationStatus: NotificationStatus.decodeNotificationStatusResult(
            dict,
            "notificationStatus",
          )->Utils.getResultExn(~message="notificationStatus is coming as undefined"),
          notificationType: getOptionString(dict, "notificationType"),
          responseCode: getOptionString(dict, "responseCode"),
          responseMessage: getOptionString(dict, "responseMessage"),
          sourceInfo: dict
          ->Dict.get("sourceInfo")
          ->Option.getExn(~message="sourceInfo is not found")
          ->decodeSourceInfo
          ->Utils.getResultExn(~message="sourceInfo is coming as undefined"),
          sourceObject: getOptionString(dict, "sourceObject"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentStatusRespPDNNotificationStatusResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentStatusRespPDNNotificationStatusResp) => {
  req->asJson
}
