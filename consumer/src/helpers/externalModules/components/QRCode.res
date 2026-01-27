// QRCode.res
open ReactNative

module QRCode = {
  @module("react-native-qrcode-svg") @react.component
  external make: (
    ~value: string,
    ~size: int,
    ~color: string,
    ~backgroundColor: string,
    ~logo: Image.Source.t,
    ~logoSize: int=?,
    ~logoBackgroundColor: string,
    ~logoMargin: int=?,
    ~logoBorderRadius: int=?,
    ~quietZone: int=?,
    ~enableLinearGradient: bool=?,
    ~gradientDirection: array<string>=?,
    ~linearGradient: array<string>=?,
    ~ecl: [
      | #L
      | #M
      | #Q
      | #H
    ],
    ~onError: unit=?,
  ) => React.element = "default"
}
