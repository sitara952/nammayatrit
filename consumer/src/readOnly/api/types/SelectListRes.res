open QuoteAPIEntity
open Utils

@genType
type selectListRes = {selectedQuotes: array<quoteAPIEntity>}

let decodeSelectListRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          selectedQuotes: dict
          ->Dict.get("selectedQuotes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="selectedQuotes is not of array")
          ->Array.map(x =>
            decodeQuoteAPIEntity(x)->Utils.getResultExn(
              ~message="selectedQuotes is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SelectListRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: selectListRes) => {
  req->asJson
}
