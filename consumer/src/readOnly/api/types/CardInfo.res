open Utils

@genType
type cardInfo = {
  cardType: option<string>,
  lastFourDigits: option<string>,
}

let decodeCardInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cardType: getOptionString(dict, "cardType"),
          lastFourDigits: getOptionString(dict, "lastFourDigits"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CardInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: cardInfo) => {
  req->asJson
}
