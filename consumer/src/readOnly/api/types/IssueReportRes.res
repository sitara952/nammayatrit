open Message
open Utils

@genType
type issueReportRes = {
  issueReportId: string,
  issueReportShortId: option<string>,
  messages: array<message>,
}

let decodeIssueReportRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          issueReportId: getOptionString(dict, "issueReportId")->Option.getExn(
            ~message="issueReportId not found",
          ),
          issueReportShortId: getOptionString(dict, "issueReportShortId"),
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
      Console.log2("IssueReportRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueReportRes) => {
  req->asJson
}
