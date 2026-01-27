open TaggedChatMessageContent
open Utils

@genType
type taggedChatMessage = {
  chatMessage: taggedChatMessageContent,
  receiverName: string,
  senderName: string,
  sentDate: string,
}

let decodeTaggedChatMessage = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          chatMessage: dict
          ->Dict.get("chatMessage")
          ->Option.getExn(~message="chatMessage is not found")
          ->decodeTaggedChatMessageContent
          ->Utils.getResultExn(~message="chatMessage is coming as undefined"),
          receiverName: getOptionString(dict, "receiverName")->Option.getExn(
            ~message="receiverName not found",
          ),
          senderName: getOptionString(dict, "senderName")->Option.getExn(
            ~message="senderName not found",
          ),
          sentDate: getOptionString(dict, "sentDate")->Option.getExn(~message="sentDate not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TaggedChatMessage ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: taggedChatMessage) => {
  req->asJson
}
