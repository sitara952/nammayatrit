open AuthorDetail
open Utils

@genType
type issueReportCommentItem = {
  authorDetail: authorDetail,
  comment: string,
  timestamp: string,
}

let decodeIssueReportCommentItem = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          authorDetail: dict
          ->Dict.get("authorDetail")
          ->Option.getExn(~message="authorDetail is not found")
          ->decodeAuthorDetail
          ->Utils.getResultExn(~message="authorDetail is coming as undefined"),
          comment: getOptionString(dict, "comment")->Option.getExn(~message="comment not found"),
          timestamp: getOptionString(dict, "timestamp")->Option.getExn(
            ~message="timestamp not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueReportCommentItem ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueReportCommentItem) => {
  req->asJson
}
