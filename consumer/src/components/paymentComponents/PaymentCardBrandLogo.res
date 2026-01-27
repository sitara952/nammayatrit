open ReactNative
open Style

module PaymentCardBrandLogo = {
  @react.component
  let make = (~cardBrand: string, ~height=48.->dp, ~width=48.->dp, ~aspectRatio=1.66) => {
    let source = switch cardBrand {
    | "amex" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/amex.png"),
      )
    | "diners" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/diners.png"),
      )
    | "discover" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/discover.png"),
      )
    | "eftpos_au" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/eftpos_au.png"),
      )
    | "jcb" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/jcb.png"),
      )
    | "mastercard" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/mastercard.png"),
      )
    | "unionpay" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/unionpay.png"),
      )
    | "visa" =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/visa.png"),
      )
    | _ =>
      ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/payment-icons/default.png"),
      )
    }
    <Image source style={viewStyle(~width, ~height, ~aspectRatio, ())} />
  }
}
