open Utils

@genType
type customerCard = {
  brand: string,
  cardId: string,
  country: option<string>,
  expMonth: int,
  expYear: int,
  last4: string,
}

let decodeCustomerCard = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          brand: getOptionString(dict, "brand")->Option.getExn(~message="brand not found"),
          cardId: getOptionString(dict, "cardId")->Option.getExn(~message="cardId not found"),
          country: getOptionString(dict, "country"),
          expMonth: getOptionInt(dict, "expMonth")->Option.getExn(~message="expMonth not found"),
          expYear: getOptionInt(dict, "expYear")->Option.getExn(~message="expYear not found"),
          last4: getOptionString(dict, "last4")->Option.getExn(~message="last4 not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CustomerCard ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: customerCard) => {
  req->asJson
}
