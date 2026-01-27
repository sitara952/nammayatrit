open QuoteBreakupAPIEntity
open Utils

@genType
type quoteBreakupRes = {quoteBreakup: array<quoteBreakupAPIEntity>}

let decodeQuoteBreakupRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          quoteBreakup: dict
          ->Dict.get("quoteBreakup")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="quoteBreakup is not of array")
          ->Array.map(x =>
            decodeQuoteBreakupAPIEntity(x)->Utils.getResultExn(
              ~message="quoteBreakup is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("QuoteBreakupRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: quoteBreakupRes) => {
  req->asJson
}
