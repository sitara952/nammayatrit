type crashlytics

@module("@react-native-firebase/crashlytics")
external crashlytics: unit => crashlytics = "default"

@send
external crash: crashlytics => unit = "crash"
