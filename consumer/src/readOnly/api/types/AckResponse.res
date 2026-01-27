open AckResponseMessage
open Utils

@genType
type ackResponse = {message: ackResponseMessage}

let decodeAckResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          message: dict
          ->Dict.get("message")
          ->Option.getExn(~message="message is not found")
          ->decodeAckResponseMessage
          ->Utils.getResultExn(~message="message is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AckResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ackResponse) => {
  req->asJson
}
