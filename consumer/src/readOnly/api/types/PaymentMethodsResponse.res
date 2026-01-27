open CustomerCard
open Utils

@genType
type paymentMethodsResponse = {
  defaultPaymentMethodId: option<string>,
  list: array<customerCard>,
}

let decodePaymentMethodsResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          defaultPaymentMethodId: getOptionString(dict, "defaultPaymentMethodId"),
          list: dict
          ->Dict.get("list")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="list is not of array")
          ->Array.map(x =>
            decodeCustomerCard(x)->Utils.getResultExn(~message="list is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentMethodsResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentMethodsResponse) => {
  req->asJson
}
