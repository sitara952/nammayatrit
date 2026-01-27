open LoggerTypes
open ReactNativeFs
open ReactnativeDeviceInfo

let asyncFunc = (cb: unit => 'a): unit => {
  setTimeout(() => {
    cb()->ignore
  }, 0)->ignore
}

let levelOrder = [Debug, Info, Warn, Error]

let levelToString = (level: level): string => {
  switch level {
  | Debug => "DEBUG"
  | Info => "INFO"
  | Warn => "WARN"
  | Error => "ERROR"
  | Event => "EVENT"
  }
}

let stringToLevel = (str: string): option<level> => {
  switch Js.String.toUpperCase(str) {
  | "DEBUG" => Some(Debug)
  | "INFO" => Some(Info)
  | "WARN" => Some(Warn)
  | "ERROR" => Some(Error)
  | _ => None
  }
}

let shouldLog = (currentLevel: level, minLevel: level): bool => {
  let currentIndex = Js.Array.indexOf(currentLevel, levelOrder)
  let minIndex = Js.Array.indexOf(minLevel, levelOrder)
  currentIndex >= minIndex
}

let getTimestamp = (): string => {
  let date = Js.Date.make()
  Js.Date.toLocaleTimeString(date)
}

let stringifyAny = (value: 'a): string => {
  switch Js.Json.stringifyAny(value) {
  | Some(str) => str
  | None => "[Unable to stringify]"
  }
}

// ------------------ DATA FUNCTIONS ------------------

let getEnvironment = (): environment => {
  switch %external(__DEV__) {
  | Some(_) => Dev
  | None => Prod
  }
}

let getStoredSessionId = async () => {
  let result = await EncryptedStorage.getItem(SESSION_ID)
  switch result {
  | Some(id) => id
  | None => ""
  }
}

let getPersonId = async () => {
  let result = await EncryptedStorage.getItem(KeyStore.PERSON_ID)
  switch result {
  | Some(id) => id
  | None => ""
  }
}
let getLogMetaData = async () => {
  let deviceInfo = {
    deviceId: getDeviceId(),
    model: getModel(),
    systemName: getSystemName(),
    systemVersion: getSystemVersion(),
  }
  let sessionId = await getStoredSessionId()
  let personId = await getPersonId()
  {sessionId, personId, deviceInfo}
}

// ------------------ FORMAT FUNCTIONS ------------------

let defaultFormatFunction: formatFunction = (level, message, namespace, _) => {
  let levelStr = levelToString(level)
  let timestamp = getTimestamp()
  let namespaceStr = switch namespace {
  | Some(ns) => `[${ns}] `
  | None => ""
  }
  `${timestamp} ${namespaceStr}${levelStr}: ${message}`
}

let prodFormatFunction: formatFunction = (level, message, namespace, metadata) => {
  let levelStr = levelToString(level)
  let timestamp = Js.Date.toISOString(Js.Date.make())
  let namespaceStr = switch namespace {
  | Some(ns) => `[${ns}] `
  | None => ""
  }
  let metadataStr = switch metadata {
  | Some(data) =>
    `[SessionID: ${data.sessionId}] [PersonID: ${data.personId}] [DeviceID: ${data.deviceInfo.deviceId}] [Model: ${data.deviceInfo.model}] [OS: ${data.deviceInfo.systemName} ${data.deviceInfo.systemVersion}]`
  | None => ""
  }
  `${timestamp} ${metadataStr} ${namespaceStr}${levelStr}: ${message}`
}

// ------------------ LOG FILE UTILS {For Debugging}------------------

let readAndLogFile = (fileName: string, filePath: option<string>) => {
  let path = switch filePath {
  | Some(dir) => `${dir}/${fileName}`
  | None => `${documentDirectoryPath}/${fileName}`
  }

  readFile(path, None)
  ->Promise.then(content => {
    Console.log2(`zxc Contents of ${path}:`, content)
    Promise.resolve()
  })
  ->Promise.catch(error => {
    Console.error2(`Error reading file ${path}:`, error)
    Promise.resolve()
  })
}
let listLogFiles = () => {
  readDir(documentDirectoryPath)
  ->Promise.then(files => {
    let logFiles = files->Js.Array2.filter(file => Js.String2.includes(file.name, "app-log-"))
    Console.log("`Available log files`:")
    logFiles->Js.Array2.forEach(file => Console.log(file.name))
    Promise.resolve()
  })
  ->Promise.catch(error => {
    Console.error2("Error listing log files:", error)
    Promise.resolve()
  })
}
