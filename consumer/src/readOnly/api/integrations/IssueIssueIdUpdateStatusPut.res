open Enums
open IssueStatusUpdateReq
open IssueStatusUpdateRes
open Utils

let issueIssueIdUpdateStatusPutApiCall = async (
  issueId: string,
  language: option<IssueIssueIdUpdateStatusLanguage.issueIssueIdUpdateStatusLanguage>,
  body: issueStatusUpdateReq,
) => {
  let data = await ApiCall.callPutAPI'(
    ~url="/issue" ++
    "/" ++
    issueId ++
    "/" ++
    "updateStatus" ++
    ("?" ++
    Option.mapOr(language, "", x =>
      "&language=" ++ x->IssueIssueIdUpdateStatusLanguage.issueIssueIdUpdateStatusLanguageToString
    )),
    ~body=body->IssueStatusUpdateReq.toJson,
  )
  IssueStatusUpdateRes.decodeIssueStatusUpdateRes(data)
}
