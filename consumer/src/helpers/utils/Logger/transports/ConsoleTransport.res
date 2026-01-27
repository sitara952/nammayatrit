open LoggerTypes

let consoleTransport: transport = (level, logMessage, _) => {
  switch level {
  | Debug => Console.log(logMessage)
  | Info => Console.log(logMessage)
  | Warn => Console.warn(logMessage)
  | Error => Console.error(logMessage)
  | Event => ()
  }
}
