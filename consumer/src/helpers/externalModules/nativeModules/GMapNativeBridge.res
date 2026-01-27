@module("react-native") @scope(("NativeModules", "MapUtils"))
external isCoordinateOnPath: (array<ReactMap.latLng>, ReactMap.latLng) => Promise.t<int> =
  "isCoordinateOnPath"
