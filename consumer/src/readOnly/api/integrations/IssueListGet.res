open Enums
open IssueReportListRes
open Utils

let issueListGetApiCall = async (language: option<IssueListLanguage.issueListLanguage>) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/issue/list" ++
    ("?" ++
    Option.mapOr(language, "", x =>
      "&language=" ++ x->IssueListLanguage.issueListLanguageToString
    )),
  )
  IssueReportListRes.decodeIssueReportListRes(data)
}
