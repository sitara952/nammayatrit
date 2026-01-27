open Enums
open TranslateResp
open Utils

let languageTranslateGetApiCall = async (
  source: LanguageTranslateSource.languageTranslateSource,
  target: LanguageTranslateSource.languageTranslateSource,
  q: string,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/language/translate" ++
    ("?" ++
    "&source=" ++
    source->LanguageTranslateSource.languageTranslateSourceToString ++
    "&target=" ++
    target->LanguageTranslateSource.languageTranslateSourceToString ++
    "&q=" ++
    q),
  )
  TranslateResp.decodeTranslateResp(data)
}
