open Enums
open IssueCategoryListRes
open Utils

let issueCategoryGetApiCall = async (
  language: option<IssueCategoryLanguage.issueCategoryLanguage>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/issue/category" ++
    ("?" ++
    Option.mapOr(language, "", x =>
      "&language=" ++ x->IssueCategoryLanguage.issueCategoryLanguageToString
    )),
  )
  IssueCategoryListRes.decodeIssueCategoryListRes(data)
}
