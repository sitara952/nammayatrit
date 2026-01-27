open ReactNative
open Style

type fontType = [
  | #"font-regular-16"
  | #"font-regular-17"
  | #"font-regular-18"
  | #"font-regular-19"
  | #"font-bold-16"
  | #"font-bold-17"
  | #"font-bold-18"
  | #"font-bold-19"
]

let renderStyle = textType => {
  switch textType {
  | #"font-regular-16" =>
    array([textStyle(~fontSize=16., ~fontWeight=#400, ~fontFamily="AreaNormal-Regular", ())])
  | #"font-regular-17" =>
    array([textStyle(~fontSize=17., ~fontWeight=#400, ~fontFamily="AreaNormal-Regular", ())])
  | #"font-regular-18" =>
    array([textStyle(~fontSize=18., ~fontWeight=#400, ~fontFamily="AreaNormal-Regular", ())])
  | #"font-regular-19" =>
    array([textStyle(~fontSize=19., ~fontWeight=#400, ~fontFamily="AreaNormal-Regular", ())])
  }
}
