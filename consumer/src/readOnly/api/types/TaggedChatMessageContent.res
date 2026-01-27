open TaggedChatMessageContentFileAttachments
open TaggedChatMessageContentTextMessage
open Utils

@genType
type taggedChatMessageContent =
  | TextMessage(taggedChatMessageContentTextMessage)
  | FileAttachments(taggedChatMessageContentFileAttachments)

let decodeTaggedChatMessageContent = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("TextMessage") =>
            data
            ->decodeTaggedChatMessageContentTextMessage
            ->Result.map(x => TextMessage(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("FileAttachments") =>
            data
            ->decodeTaggedChatMessageContentFileAttachments
            ->Result.map(x => FileAttachments(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TaggedChatMessageContent ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: taggedChatMessageContent) => {
  req->asJson
}
