open Enums
open Utils

@genType
type chatDetail = {
  actionText: option<string>,
  chatType: MessageType.messageType,
  content: option<string>,
  id: string,
  label: option<string>,
  sender: Sender.sender,
  timestamp: string,
  title: option<string>,
}

let decodeChatDetail = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          actionText: getOptionString(dict, "actionText"),
          chatType: MessageType.decodeMessageTypeResult(dict, "chatType")->Utils.getResultExn(
            ~message="chatType is coming as undefined",
          ),
          content: getOptionString(dict, "content"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          label: getOptionString(dict, "label"),
          sender: Sender.decodeSenderResult(dict, "sender")->Utils.getResultExn(
            ~message="sender is coming as undefined",
          ),
          timestamp: getOptionString(dict, "timestamp")->Option.getExn(
            ~message="timestamp not found",
          ),
          title: getOptionString(dict, "title"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ChatDetail ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: chatDetail) => {
  req->asJson
}
