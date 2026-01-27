open FileAttachment
open Utils

@genType
type taggedChatMessageContentFileAttachments = {contents: option<array<fileAttachment>>}

let decodeTaggedChatMessageContentFileAttachments = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          contents: dict
          ->Dict.get("contents")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFileAttachment(x)->Utils.getResultExn(
                ~message="contents is coming as undefined",
              )
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TaggedChatMessageContentFileAttachments ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: taggedChatMessageContentFileAttachments) => {
  req->asJson
}
