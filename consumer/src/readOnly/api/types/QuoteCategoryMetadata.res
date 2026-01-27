open Utils

@genType
type quoteCategoryMetadata = {
  code: string,
  description: string,
  title: string,
  tnc: string,
}

let decodeQuoteCategoryMetadata = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          title: getOptionString(dict, "title")->Option.getExn(~message="title not found"),
          tnc: getOptionString(dict, "tnc")->Option.getExn(~message="tnc not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("QuoteCategoryMetadata ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: quoteCategoryMetadata) => {
  req->asJson
}
