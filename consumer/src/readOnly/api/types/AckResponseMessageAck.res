open Enums
open Utils

@genType
type ackResponseMessageAck = {status: AckResponseMessageAckStatus.ackResponseMessageAckStatus}

let decodeAckResponseMessageAck = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          status: AckResponseMessageAckStatus.decodeAckResponseMessageAckStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AckResponseMessageAck ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ackResponseMessageAck) => {
  req->asJson
}
