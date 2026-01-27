open Utils
@genType
type config = {
  skipPermissionRequests: bool,
  authorizationLevel?: [#always | #whenInUse | #auto],
  enableBackgroundLocationUpdates?: bool,
  locationProvider?: [#playServices | #android | #auto],
}

@module("@react-native-community/geolocation") @scope("default")
external setRNConfiguration: (~config: config) => unit = "setRNConfiguration"

@genType
type error = {
  code: int,
  message: string,
  \"PERMISSION_DENIED": int,
  \"POSITION_UNAVAILABLE": int,
  \"TIMEOUT": int,
}

@module("@react-native-community/geolocation") @scope("default")
external requestAuthorization: (
  ~success: unit => unit=?,
  ~error: (~error: error) => unit=?,
) => unit = "requestAuthorization"
@genType
type coords = {
  latitude: float,
  longitude: float,
  altitude: float,
  accuracy: float,
  altitudeAccuracy: float,
  heading: float,
  speed: float,
}
@genType
type position = {
  coords: coords,
  timestamp: float,
}
@genType
type getCurrentPositionoptions = {
  timeout?: float,
  maximumAge?: float,
  enableHighAccuracy?: bool,
}

@module("@react-native-community/geolocation") @scope("default")
external getCurrentPosition: (
  ~success: (~position: position) => unit,
  ~error: (~error: error) => unit=?,
  ~options: getCurrentPositionoptions=?,
) => unit = "getCurrentPosition"

@genType
type watchPositionoptions = {
  interval?: float,
  fastestInterval?: float,
  timeout?: float,
  maximumAge?: float,
  enableHighAccuracy?: bool,
  distanceFilter?: float,
  useSignificantChanges?: bool,
}

@module("@react-native-community/geolocation") @scope("default")
external watchPosition: (
  ~success: (~position: position) => unit,
  ~error: (~error: error) => unit=?,
  ~options: watchPositionoptions=?,
) => float = "watchPosition"

@module("@react-native-community/geolocation") @scope("default")
external clearWatch: (~watchID: float) => unit = "clearWatch"

let defaultCoords = {
  latitude: 0.0,
  longitude: 0.0,
  altitude: 0.0,
  accuracy: 0.0,
  altitudeAccuracy: 0.0,
  heading: 0.0,
  speed: 0.0,
}

let getCoords = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeObject)
  ->Belt.Option.map(dict => {
    {
      latitude: getFloat(dict, "latitude", 0.0),
      longitude: getFloat(dict, "longitude", 0.0),
      altitude: getFloat(dict, "altitude", 0.0),
      accuracy: getFloat(dict, "accuracy", 0.0),
      altitudeAccuracy: getFloat(dict, "altitudeAccuracy", 0.0),
      heading: getFloat(dict, "heading", 0.0),
      speed: getFloat(dict, "speed", 0.0),
    }
  })
  ->Belt.Option.getWithDefault(defaultCoords)
}

let itemToObjectMapper = dict => {
  {
    coords: getCoords(dict, "coords"),
    timestamp: getFloat(dict, "timestamp", 0.0),
  }
}
