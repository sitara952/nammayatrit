open PriceAPIEntity
open Utils

@genType
type cancellationDuesDetailsRes = {
  canBlockCustomer: option<bool>,
  cancellationDues: option<priceAPIEntity>,
  disputeChancesUsed: option<int>,
}

let decodeCancellationDuesDetailsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          canBlockCustomer: getOptionBool(dict, "canBlockCustomer"),
          cancellationDues: dict
          ->Dict.get("cancellationDues")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          disputeChancesUsed: getOptionInt(dict, "disputeChancesUsed"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CancellationDuesDetailsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cancellationDuesDetailsRes) => {
  req->asJson
}
