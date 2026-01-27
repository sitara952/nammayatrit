open Message
open Utils

@genType
type issueStatusUpdateRes = {messages: array<message>}

let decodeIssueStatusUpdateRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          messages: dict
          ->Dict.get("messages")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="messages is not of array")
          ->Array.map(x =>
            decodeMessage(x)->Utils.getResultExn(~message="messages is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueStatusUpdateRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueStatusUpdateRes) => {
  req->asJson
}
