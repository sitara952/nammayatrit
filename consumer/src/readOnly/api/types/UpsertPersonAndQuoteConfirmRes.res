open Enums
open UpsertPersonAndQuoteConfirmResBody
open Utils

@genType
type upsertPersonAndQuoteConfirmRes = {
  body: option<upsertPersonAndQuoteConfirmResBody>,
  quoteConfirmStatus: QuoteConfirmStatus.quoteConfirmStatus,
}

let decodeUpsertPersonAndQuoteConfirmRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          body: dict
          ->Dict.get("body")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeUpsertPersonAndQuoteConfirmResBody(x)->Result.mapOr(None, x => Some(x))
          ),
          quoteConfirmStatus: QuoteConfirmStatus.decodeQuoteConfirmStatusResult(
            dict,
            "quoteConfirmStatus",
          )->Utils.getResultExn(~message="quoteConfirmStatus is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpsertPersonAndQuoteConfirmRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upsertPersonAndQuoteConfirmRes) => {
  req->asJson
}
