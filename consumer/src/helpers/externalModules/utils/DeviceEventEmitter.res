// @module("deviceEventEmitter")
@scope("DeviceEventEmitter") @module("react-native")
external addListener: (string, _ => _) => unit = "addListener"

// external addListener: (t, string, 'a => unit) => EventSubscription.t = "addListener"
