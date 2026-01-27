type local = English | Hindi | None

let getLocale = (localeString: LocaleStringType.localeString): LocaleStringType.textAndAccObj => {
  //fetch from apicall
  //  let (nativeProp, _) = React.useContext(NativePropContext.nativePropContext)
  let locale = English
  switch locale {
  | English => EnglishLocal.englishLocal(localeString)
  | Hindi => HindiLocal.hindiLocal(localeString)
  | None => EnglishLocal.englishLocal(localeString)
  }
}
