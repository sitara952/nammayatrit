open Enums
open IssueReportReq
open IssueReportRes
open Utils

let issuePostApiCall = async (
  language: option<IssueLanguage.issueLanguage>,
  body: issueReportReq,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/issue" ++
    ("?" ++
    Option.mapOr(language, "", x => "&language=" ++ x->IssueLanguage.issueLanguageToString)),
    ~body=body->IssueReportReq.toJson,
  )
  IssueReportRes.decodeIssueReportRes(data)
}
