let eventTransport: LoggerTypes.transport = (
  level: LoggerTypes.level,
  logMessage,
  transportOptions,
) => {
  switch level {
  | Event => Console.log2(transportOptions, logMessage) // Logic to handle and push events
  | _ => ()
  }
}
