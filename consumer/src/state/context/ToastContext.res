open Toast
type contextType = {
  updateProperties: (
    ~overrideDarkMode: bool=?,
    ~extraInsets: extraInsets=?,
    ~onToastHide: toastOption=?,
    ~onToastPress: toastOption=?,
    ~onToastShow: toastOption=?,
    ~providerKey: string=?,
    ~defaultStyle: toastStyle=?,
  ) => unit,
}
let defaultToastProps: contextType = {
  updateProperties: (
    ~overrideDarkMode as _: option<bool>=?,
    ~extraInsets as _: option<extraInsets>=?,
    ~onToastHide as _: option<toastOption>=?,
    ~onToastPress as _: option<toastOption>=?,
    ~onToastShow as _: option<toastOption>=?,
    ~providerKey as _: option<string>=?,
    ~defaultStyle as _: option<toastStyle>=?,
  ) => (),
}

let context = React.createContext(defaultToastProps)
module Provider = {
  let make = React.Context.provider(context)
}
