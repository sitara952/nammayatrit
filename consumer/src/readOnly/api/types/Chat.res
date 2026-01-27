open Enums
open Utils

@genType
type chat = {
  chatId: string,
  chatType: ChatType.chatType,
  timestamp: string,
}

let decodeChat = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          chatId: getOptionString(dict, "chatId")->Option.getExn(~message="chatId not found"),
          chatType: ChatType.decodeChatTypeResult(dict, "chatType")->Utils.getResultExn(
            ~message="chatType is coming as undefined",
          ),
          timestamp: getOptionString(dict, "timestamp")->Option.getExn(
            ~message="timestamp not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Chat ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: chat) => {
  req->asJson
}
