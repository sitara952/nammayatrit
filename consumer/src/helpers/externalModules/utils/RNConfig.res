/* Import Js.Dict for handling key-value pairs */
type config = Js.Dict.t<string>

/* Bind to the react-native-config module */
@module("react-native-config")
external config: config = "default"

/* Helper function to access environment variables safely */
let getVar = (key: string): option<string> => Js.Dict.get(config, key)
