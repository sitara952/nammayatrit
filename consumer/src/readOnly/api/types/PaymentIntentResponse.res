open Utils

@genType
type paymentIntentResponse = {
  customerId: string,
  ephemeralKey: string,
  paymentIntentClientSecret: string,
}

let decodePaymentIntentResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          customerId: getOptionString(dict, "customerId")->Option.getExn(
            ~message="customerId not found",
          ),
          ephemeralKey: getOptionString(dict, "ephemeralKey")->Option.getExn(
            ~message="ephemeralKey not found",
          ),
          paymentIntentClientSecret: getOptionString(
            dict,
            "paymentIntentClientSecret",
          )->Option.getExn(~message="paymentIntentClientSecret not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentIntentResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentIntentResponse) => {
  req->asJson
}
