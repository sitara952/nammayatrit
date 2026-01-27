open Enums
open Utils

@genType
type issueReportListItem = {
  assignee: option<string>,
  category: string,
  createdAt: string,
  deleted: option<bool>,
  issueReportId: string,
  issueReportShortId: option<string>,
  personId: option<string>,
  rideId: option<string>,
  status: IssueStatus.issueStatus,
  ticketBookingId: option<string>,
  optionLabel: option<string>,
}

let decodeIssueReportListItem = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          assignee: getOptionString(dict, "assignee"),
          category: getOptionString(dict, "category")->Option.getExn(~message="category not found"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          deleted: getOptionBool(dict, "deleted"),
          issueReportId: getOptionString(dict, "issueReportId")->Option.getExn(
            ~message="issueReportId not found",
          ),
          issueReportShortId: getOptionString(dict, "issueReportShortId"),
          personId: getOptionString(dict, "personId"),
          rideId: getOptionString(dict, "rideId"),
          status: IssueStatus.decodeIssueStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          ticketBookingId: getOptionString(dict, "ticketBookingId"),
          optionLabel: getOptionString(dict, "optionLabel"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueReportListItem ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueReportListItem) => {
  req->asJson
}
