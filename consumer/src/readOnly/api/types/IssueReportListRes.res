open IssueReportListItem
open Utils

@genType
type issueReportListRes = {issues: array<issueReportListItem>}

let decodeIssueReportListRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          issues: dict
          ->Dict.get("issues")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="issues is not of array")
          ->Array.map(x =>
            decodeIssueReportListItem(x)->Utils.getResultExn(
              ~message="issues is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueReportListRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueReportListRes) => {
  req->asJson
}
