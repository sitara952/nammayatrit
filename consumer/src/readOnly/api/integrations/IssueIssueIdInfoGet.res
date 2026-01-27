open Enums
open IssueInfoRes
open Utils

let issueIssueIdInfoGetApiCall = async (
  issueId: string,
  language: option<IssueIssueIdInfoLanguage.issueIssueIdInfoLanguage>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/issue" ++
    "/" ++
    issueId ++
    "/" ++
    "info" ++
    ("?" ++
    Option.mapOr(language, "", x =>
      "&language=" ++ x->IssueIssueIdInfoLanguage.issueIssueIdInfoLanguageToString
    )),
  )
  IssueInfoRes.decodeIssueInfoRes(data)
}
