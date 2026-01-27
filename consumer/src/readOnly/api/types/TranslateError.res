open Utils

@genType
type translateError = {code: string}

let decodeTranslateError = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TranslateError ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: translateError) => {
  req->asJson
}
