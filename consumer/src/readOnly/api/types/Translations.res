open TranslatedText
open Utils

@genType
type translations = {translations: array<translatedText>}

let decodeTranslations = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          translations: dict
          ->Dict.get("translations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="translations is not of array")
          ->Array.map(x =>
            decodeTranslatedText(x)->Utils.getResultExn(
              ~message="translations is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Translations ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: translations) => {
  req->asJson
}
