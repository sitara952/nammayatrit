open AckResponseMessageAck
open Utils

@genType
type ackResponseMessage = {ack: ackResponseMessageAck}

let decodeAckResponseMessage = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          ack: dict
          ->Dict.get("ack")
          ->Option.getExn(~message="ack is not found")
          ->decodeAckResponseMessageAck
          ->Utils.getResultExn(~message="ack is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AckResponseMessage ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ackResponseMessage) => {
  req->asJson
}
