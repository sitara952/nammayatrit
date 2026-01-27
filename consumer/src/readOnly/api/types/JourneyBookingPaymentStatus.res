open PaymentFareUpdate
open PaymentOrder
open Utils

@genType
type journeyBookingPaymentStatus = {
  gatewayReferenceId: option<string>,
  journeyId: string,
  paymentFareUpdate: option<array<paymentFareUpdate>>,
  paymentOrder: option<paymentOrder>,
}

let decodeJourneyBookingPaymentStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          gatewayReferenceId: getOptionString(dict, "gatewayReferenceId"),
          journeyId: getOptionString(dict, "journeyId")->Option.getExn(
            ~message="journeyId not found",
          ),
          paymentFareUpdate: dict
          ->Dict.get("paymentFareUpdate")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodePaymentFareUpdate(x)->Utils.getResultExn(
                ~message="paymentFareUpdate is coming as undefined",
              )
            )
          ),
          paymentOrder: dict
          ->Dict.get("paymentOrder")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePaymentOrder(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyBookingPaymentStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyBookingPaymentStatus) => {
  req->asJson
}
