open ReactNative
open Constants

@scope(("NativeModules", "AppInfoModule")) @module("react-native")
external getAppName: unit => Promise.t<string> = "getAppName"

@scope(("NativeModules", "AppInfoModule")) @module("react-native")
external isDebug: unit => Promise.t<bool> = "isDebug"

@scope(("NativeModules", "AppInfoModule")) @module("react-native")
external isPackagePresent: string => Promise.t<bool> = "isPackagePresent"

let getName = async (~setAppName) => {
  let name = await getAppName()
  setAppName(_ => name)
}

let setDebug = async (~setDebugMode) => {
  let isDebug = await isDebug()
  setDebugMode(_ => isDebug)
}

let isCugUser = async (~setCugUser) => {
  let isPresent = await isPackagePresent(
    Platform.os == #android ? androidCugPackageName : iosCugPackageName,
  )
  setCugUser(_ => isPresent)
}
