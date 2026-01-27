open Enums
open ChatDetail
open IssueOptionRes
open MediaFile_
open Utils

@genType
type issueInfoRes = {
  assignee: option<string>,
  categoryId: option<string>,
  categoryLabel: option<string>,
  chats: array<chatDetail>,
  createdAt: string,
  description: string,
  issueReportId: string,
  issueReportShortId: option<string>,
  mediaFiles: array<mediaFile_>,
  option: option<string>,
  options: array<issueOptionRes>,
  status: IssueStatus.issueStatus,
}

let decodeIssueInfoRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          assignee: getOptionString(dict, "assignee"),
          categoryId: getOptionString(dict, "categoryId"),
          categoryLabel: getOptionString(dict, "categoryLabel"),
          chats: dict
          ->Dict.get("chats")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="chats is not of array")
          ->Array.map(x =>
            decodeChatDetail(x)->Utils.getResultExn(~message="chats is coming as undefined")
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          issueReportId: getOptionString(dict, "issueReportId")->Option.getExn(
            ~message="issueReportId not found",
          ),
          issueReportShortId: getOptionString(dict, "issueReportShortId"),
          mediaFiles: dict
          ->Dict.get("mediaFiles")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="mediaFiles is not of array")
          ->Array.map(x =>
            decodeMediaFile_(x)->Utils.getResultExn(~message="mediaFiles is coming as undefined")
          ),
          option: getOptionString(dict, "option"),
          options: dict
          ->Dict.get("options")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="options is not of array")
          ->Array.map(x =>
            decodeIssueOptionRes(x)->Utils.getResultExn(~message="options is coming as undefined")
          ),
          status: IssueStatus.decodeIssueStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueInfoRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueInfoRes) => {
  req->asJson
}
