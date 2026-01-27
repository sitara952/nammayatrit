@scope(("NativeModules", "MainAppUtils")) @module("react-native")
external migrateLocalStore: unit => Promise.t<string> = "migrateLocalStore"
