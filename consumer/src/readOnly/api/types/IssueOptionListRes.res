open IssueOptionRes
open Message
open Utils

@genType
type issueOptionListRes = {
  messages: array<message>,
  options: array<issueOptionRes>,
}

let decodeIssueOptionListRes = data => {
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
          options: dict
          ->Dict.get("options")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="options is not of array")
          ->Array.map(x =>
            decodeIssueOptionRes(x)->Utils.getResultExn(~message="options is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueOptionListRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueOptionListRes) => {
  req->asJson
}
