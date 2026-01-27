open ReactNative
@module("@react-native-clipboard/clipboard") @scope("default")
external getString: unit => Js.Promise.t<string> = "getString"

@module("@react-native-clipboard/clipboard") @scope("default")
external setString: string => unit = "setString"

@module("@react-native-clipboard/clipboard") @scope("default")
external getStrings: unit => Js.Promise.t<array<string>> = "getStrings"

@module("@react-native-clipboard/clipboard") @scope("default")
external getImagePNG: unit => Js.Promise.t<string> = "getImagePNG"

@module("@react-native-clipboard/clipboard") @scope("default")
external getImageJPG: unit => Js.Promise.t<string> = "getImageJPG"

@module("@react-native-clipboard/clipboard") @scope("default")
external setImage: string => unit = "setImage"

@module("@react-native-clipboard/clipboard") @scope("default")
external getImage: unit => Js.Promise.t<string> = "getImage"

@module("@react-native-clipboard/clipboard") @scope("default")
external setStrings: array<string> => unit = "setStrings"

@module("@react-native-clipboard/clipboard") @scope("default")
external hasString: unit => Js.Promise.t<bool> = "hasString"

@module("@react-native-clipboard/clipboard") @scope("default")
external hasImage: unit => Js.Promise.t<bool> = "hasImage"

@module("@react-native-clipboard/clipboard") @scope("default")
external hasURL: unit => Js.Promise.t<bool> = "hasURL"

@module("@react-native-clipboard/clipboard") @scope("default")
external hasNumber: unit => Js.Promise.t<bool> = "hasNumber"

@module("@react-native-clipboard/clipboard") @scope("default")
external hasWebURL: unit => Js.Promise.t<bool> = "hasWebURL"

let copyToClipboard = (~text: string) => {
  setString(text)
  if Platform.os == #android {
    ToastAndroid.show("COPIED", ToastAndroid.short)
  } else {
    Alert.alert(~title="COPIED", ())
  }
}
