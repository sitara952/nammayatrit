open TranslateError
open Translations
open Utils

@genType
type translateResp = {
  _data: translations,
  _error: option<translateError>,
}

let decodeTranslateResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _data: dict
          ->Dict.get("_data")
          ->Option.getExn(~message="_data is not found")
          ->decodeTranslations
          ->Utils.getResultExn(~message="_data is coming as undefined"),
          _error: dict
          ->Dict.get("_error")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeTranslateError(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TranslateResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: translateResp) => {
  req->asJson
}
