type cor = {
  x: float,
  y: float,
}
module LinearGradient = {
  @module("react-native-linear-gradient") @react.component
  external make: (
    ~start: cor=?,
    ~end: cor=?,
    ~locations: array<float>=?,
    ~colors: array<string>=?,
    ~style: ReactNative.Style.t=?,
    ~children: React.element=?,
  ) => React.element = "default"
}
