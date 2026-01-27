open Utils

@genType
type fileAttachment = {
  message: option<string>,
  mime: string,
  url: string,
}

let decodeFileAttachment = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          message: getOptionString(dict, "message"),
          mime: getOptionString(dict, "mime")->Option.getExn(~message="mime not found"),
          url: getOptionString(dict, "url")->Option.getExn(~message="url not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FileAttachment ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fileAttachment) => {
  req->asJson
}
