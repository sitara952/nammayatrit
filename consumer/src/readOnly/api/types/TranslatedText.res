open Utils

@genType
type translatedText = {translatedText: string}

let decodeTranslatedText = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          translatedText: getOptionString(dict, "translatedText")->Option.getExn(
            ~message="translatedText not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TranslatedText ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: translatedText) => {
  req->asJson
}
