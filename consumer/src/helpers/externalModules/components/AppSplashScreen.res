type t

@module("react-native-splash-screen")
external splashScreen: t = "default"

@send external hide: (t, unit) => unit = "hide"
@send external show: (t, unit) => unit = "show"

let hide = () => {
  splashScreen->hide()
}
