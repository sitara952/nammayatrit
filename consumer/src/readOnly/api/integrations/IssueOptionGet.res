open Enums
open IssueOptionListRes
open Utils

let issueOptionGetApiCall = async (
  categoryId: string,
  optionId: option<string>,
  issueReportId: option<string>,
  rideId: option<string>,
  language: option<IssueOptionLanguage.issueOptionLanguage>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/issue/option" ++
    ("?" ++
    "&categoryId=" ++
    categoryId ++
    Option.mapOr(optionId, "", x => "&optionId=" ++ x) ++
    Option.mapOr(issueReportId, "", x => "&issueReportId=" ++ x) ++
    Option.mapOr(rideId, "", x => "&rideId=" ++ x) ++
    Option.mapOr(language, "", x =>
      "&language=" ++ x->IssueOptionLanguage.issueOptionLanguageToString
    )),
  )
  IssueOptionListRes.decodeIssueOptionListRes(data)
}
