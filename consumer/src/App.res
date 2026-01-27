open TypeScriptModules

ReactNative.LogBox.ignoreAllLogs() // uncomment this line to ignore all warnings and errors

type initialPayloadType = {appId: string}

module Main = {
  let make = (~initialPayload: TypeScriptModules.initialPayloadType) => {
    let _ = initialPayload.appId
    <TypeScriptModules.MobilityApp initialPayload />
  }
}

@react.component
let make = (~props as _, ~rootTag as _) => {
  Main.make
}
