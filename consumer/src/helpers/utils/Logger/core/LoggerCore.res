open ConsoleTransport
open FileTransport
open LoggerTypes
open LoggerUtils

let defaultConfig = {
  minLevel: Debug,
  isAsync: false,
  transports: [consoleTransport],
  format: defaultFormatFunction,
  getMetaData: getLogMetaData,
  transportOptions: {},
}

let sendToTransports = (config: loggerConfig, level: level, message: string) => {
  if shouldLog(level, config.minLevel) {
    let logFunction = () => {
      config.transports->Array.forEach(transport =>
        transport(level, message, config.transportOptions)
      )
    }

    if config.isAsync {
      asyncFunc(logFunction)
    } else {
      logFunction()
    }
  }
}

let createLogFunction = (config: loggerConfig, namespace: option<string>): logFunc => {
  let logFunc = (level: level, message: string) => {
    if shouldLog(level, config.minLevel) {
      let handleFormattedMessage = metadataOption => {
        let formattedMessage = config.format(level, message, namespace, metadataOption)
        sendToTransports(config, level, formattedMessage)
        Promise.resolve()
      }

      config.getMetaData()
      ->Promise.then(metadata => handleFormattedMessage(Some(metadata)))
      ->Promise.catch(_ => handleFormattedMessage(None))
      ->ignore
    }
  }
  logFunc
}

let createLogger = (customConfig: option<loggerConfig>): loggerInstance => {
  let env = getEnvironment()

  let config = switch customConfig {
  | Some(c) => c
  | None =>
    switch env {
    | Dev => defaultConfig
    | Master => defaultConfig
    | Prod => {
        ...defaultConfig,
        isAsync: true,
        transports: [consoleTransport, fileTransport],
      }
    }
  }

  let logFunc = createLogFunction(config, None)

  let logger = {
    debug: a => logFunc(Debug, stringifyAny(a)),
    debug2: (a, b) => logFunc(Debug, `${stringifyAny(a)} ${stringifyAny(b)}`),
    debug3: (a, b, c) => logFunc(Debug, `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)}`),
    debug4: (a, b, c, d) =>
      logFunc(Debug, `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)}`),
    debug5: (a, b, c, d, e) =>
      logFunc(
        Debug,
        `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)} ${stringifyAny(
            e,
          )}`,
      ),
    debug6: (a, b, c, d, e, f) =>
      logFunc(
        Debug,
        `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)} ${stringifyAny(
            e,
          )} ${stringifyAny(f)}`,
      ),
    debugMany: a => logFunc(Debug, stringifyAny(a)),
    error: a => logFunc(Error, stringifyAny(a)),
    error2: (a, b) => logFunc(Error, `${stringifyAny(a)} ${stringifyAny(b)}`),
    error3: (a, b, c) => logFunc(Error, `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)}`),
    error4: (a, b, c, d) =>
      logFunc(Error, `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)}`),
    error5: (a, b, c, d, e) =>
      logFunc(
        Error,
        `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)} ${stringifyAny(
            e,
          )}`,
      ),
    error6: (a, b, c, d, e, f) =>
      logFunc(
        Error,
        `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)} ${stringifyAny(
            e,
          )} ${stringifyAny(f)}`,
      ),
    errorMany: a => logFunc(Error, stringifyAny(a)),
    warn: a => logFunc(Warn, stringifyAny(a)),
    warn2: (a, b) => logFunc(Warn, `${stringifyAny(a)} ${stringifyAny(b)}`),
    warn3: (a, b, c) => logFunc(Warn, `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)}`),
    warn4: (a, b, c, d) =>
      logFunc(Warn, `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)}`),
    warn5: (a, b, c, d, e) =>
      logFunc(
        Warn,
        `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)} ${stringifyAny(
            e,
          )}`,
      ),
    warn6: (a, b, c, d, e, f) =>
      logFunc(
        Warn,
        `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)} ${stringifyAny(d)} ${stringifyAny(
            e,
          )} ${stringifyAny(f)}`,
      ),
    warnMany: a => logFunc(Warn, stringifyAny(a)),
    event: a => logFunc(Event, stringifyAny(a)),
    event2: (a, b) => logFunc(Event, `${stringifyAny(a)} ${stringifyAny(b)}`),
    event3: (a, b, c) => logFunc(Event, `${stringifyAny(a)} ${stringifyAny(b)} ${stringifyAny(c)}`),
    setSeverity: newLevel => {
      config.minLevel = newLevel
    },
  }

  logger
}

// -------- TO VIEW LOG FILES --------
// listLogFiles()->ignore
// readAndLogFile(staticLogFileName, None)->ignore
