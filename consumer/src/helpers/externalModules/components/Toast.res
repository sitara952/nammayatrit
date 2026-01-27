open ReactNative

type extraInsets = {
  top?: int,
  bottom?: int,
  right?: int,
  left?: int,
}

type toastType = [#success | #error | #loading | #blank]

type toastPosition =
  | TOP
  | BOTTOM

let toInt = (position: toastPosition): int =>
  switch position {
  | TOP => 1
  | BOTTOM => 2
  }

type animationConfig = {
  flingPositionReturnDuration?: int,
  animationStiffness?: int,
  animationDuration?: int,
}
type rec toastOption = {
  \"type": toastType,
  id?: string,
  message?: string,
  icon?: string,
  duration?: int,
  pauseDuration?: int,
  disableShadow?: bool,
  createdAt?: int,
  visible?: bool,
  height?: int,
  width?: int,
  position?: int,
  customToast?: toastOption => Jsx.element,
  providerKey?: string,
  isSwipeable?: bool,
  animationConfig?: animationConfig,
}

type toastStyle = {
  pressable?: Style.t,
  view: Style.t,
  text?: Style.t,
  indicator?: Style.t,
}

module Toasts = {
  @react.component @module("@backpackapp-io/react-native-toast")
  external make: (
    ~overrideDarkMode: bool=?,
    ~extraInsets: extraInsets=?,
    ~onToastHide: option<toastOption => unit>=?,
    ~onToastPress: option<toastOption => unit>=?,
    ~onToastShow: option<toastOption => unit>=?,
    ~providerKey: string=?,
    ~defaultStyle: toastStyle=?,
  ) => React.element = "Toasts"
}

@module("@backpackapp-io/react-native-toast")
external toast: (~message: string, ~opts: toastOption=?) => string = "toast"

@module("@backpackapp-io/react-native-toast") @scope("toast")
external dismiss: option<string> => unit = "dismiss"
