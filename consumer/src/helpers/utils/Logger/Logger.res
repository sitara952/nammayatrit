open LoggerCore
open ConsoleTransport
open LoggerUtils
open FileTransport

let devLogger = createLogger(
  Some({
    minLevel: Debug,
    isAsync: false,
    transports: [consoleTransport],
    format: defaultFormatFunction,
    getMetaData: getLogMetaData,
    transportOptions: {},
  }),
)

let prodLogger = createLogger(
  Some({
    minLevel: Info,
    isAsync: true,
    transports: [consoleTransport, fileTransport],
    format: prodFormatFunction,
    getMetaData: getLogMetaData,
    transportOptions: {},
  }),
)

let log = switch getEnvironment() {
| _ => devLogger
// | Prod => prodLogger
}

let logEnv = getEnvironment
