open BatchConfig
open SelectListRes
open Utils

@genType
type quotesResultResponse = {
  batchConfig: option<batchConfig>,
  bookingId: option<string>,
  bookingIdV2: option<string>,
  selectedQuotes: option<selectListRes>,
}

let decodeQuotesResultResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          batchConfig: dict
          ->Dict.get("batchConfig")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeBatchConfig(x)->Result.mapOr(None, x => Some(x))),
          bookingId: getOptionString(dict, "bookingId"),
          bookingIdV2: getOptionString(dict, "bookingIdV2"),
          selectedQuotes: dict
          ->Dict.get("selectedQuotes")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeSelectListRes(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("QuotesResultResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: quotesResultResponse) => {
  req->asJson
}
