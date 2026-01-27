external asJson: _ => JSON.t = "%identity"

type fetchStatus =
  | NoFetchYet
  | Success
  | Failure
  | Throttle

type settings = {"minimumFetchIntervalMillis": int, "fetchTimeMillis": int}

type success
type error
type configValue
type configUpdatedCallback = (success, error) => unit
type remoteConfig
type firebase

@send external asString: configValue => string = "asString"
@send external asNumber: configValue => float = "asNumber"
@send external asBoolean: configValue => bool = "asBoolean"
@send external getSource: configValue => string = "getSource"

@module("@react-native-firebase/remote-config")
external firebase: firebase = "firebase"

@send external remoteConfig: (firebase, unit) => remoteConfig = "remoteConfig"

@send external setDefaults: Dict.t<string> => Promise.t<unit> = "setDefaults"
@send external fetchAndActivate: (remoteConfig, unit) => Promise.t<bool> = "fetchAndActivate"
@send external getString: (remoteConfig, string) => string = "getString"
@send external getNumber: (remoteConfig, string) => Promise.t<float> = "getNumber"
@send external getBoolean: (remoteConfig, string) => Promise.t<bool> = "getBoolean"
@send external getAll: (remoteConfig, unit) => Dict.t<configValue> = "getAll"
@send external onConfigUpdated: (remoteConfig, configUpdatedCallback) => unit = "onConfigUpdated"
@send external activate: (remoteConfig, unit) => Promise.t<unit> = "activate"

let getRemoteConfig = () => {
  firebase->remoteConfig()
}

// TODO:: Handle error cases here
let onUpdateActivate: configUpdatedCallback = (event: success, _: error) => {
  Console.log2("ConfigManager event here: ", event)
  getRemoteConfig()->activate()->ignore
}
