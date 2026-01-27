open Utils

@genType
type paymentLinks = {
  deep_link: option<string>,
  iframe: option<string>,
  mobile: option<string>,
  web: option<string>,
}

let decodePaymentLinks = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          deep_link: getOptionString(dict, "deep_link"),
          iframe: getOptionString(dict, "iframe"),
          mobile: getOptionString(dict, "mobile"),
          web: getOptionString(dict, "web"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentLinks ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentLinks) => {
  req->asJson
}
