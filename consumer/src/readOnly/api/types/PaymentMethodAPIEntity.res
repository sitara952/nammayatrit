open Enums
open PaymentInstrument
open Utils

@genType
type paymentMethodAPIEntity = {
  collectedBy: PaymentCollector.paymentCollector,
  id: string,
  paymentInstrument: paymentInstrument,
  paymentType: PaymentType.paymentType,
}

let decodePaymentMethodAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          collectedBy: PaymentCollector.decodePaymentCollectorResult(
            dict,
            "collectedBy",
          )->Utils.getResultExn(~message="collectedBy is coming as undefined"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          paymentInstrument: dict
          ->Dict.get("paymentInstrument")
          ->Option.getExn(~message="paymentInstrument is not found")
          ->decodePaymentInstrument
          ->Utils.getResultExn(~message="paymentInstrument is coming as undefined"),
          paymentType: PaymentType.decodePaymentTypeResult(dict, "paymentType")->Utils.getResultExn(
            ~message="paymentType is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentMethodAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentMethodAPIEntity) => {
  req->asJson
}
