type netInfoState = {
  _type: string,
  isConnected: Nullable.t<bool>,
  isInternetReachable: option<bool>,
  isWifiEnabled: option<bool>,
}

@module("@react-native-community/netinfo")
external useNetInfo: unit => netInfoState = "useNetInfo"
