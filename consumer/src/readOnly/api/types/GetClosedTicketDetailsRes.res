open TaggedChatMessage
open Utils

@genType
type getClosedTicketDetailsRes = {chatMessages: array<taggedChatMessage>}

let decodeGetClosedTicketDetailsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          chatMessages: dict
          ->Dict.get("chatMessages")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="chatMessages is not of array")
          ->Array.map(x =>
            decodeTaggedChatMessage(x)->Utils.getResultExn(
              ~message="chatMessages is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetClosedTicketDetailsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getClosedTicketDetailsRes) => {
  req->asJson
}
