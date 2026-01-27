type level = Debug | Info | Warn | Error | Event

type environment = Dev | Master | Prod

type transportOptions = {
  fileName?: string,
  filePath?: string,
  // new props can be added as per the requiremnts of the transport functions
}
type transport = (level, string, transportOptions) => unit

type deviceInfo = {
  deviceId: string,
  model: string,
  systemName: string,
  systemVersion: string,
}
type logMetadata = {
  sessionId: string,
  personId: string,
  deviceInfo: deviceInfo,
}

type formatFunction = (level, string, option<string>, option<logMetadata>) => string
type logFunc = (level, string) => unit

type loggerConfig = {
  mutable minLevel: level,
  isAsync: bool,
  transports: array<transport>,
  format: formatFunction,
  getMetaData: unit => promise<logMetadata>,
  transportOptions: transportOptions,
}

type loggerInstance = {
  debug: 'a. 'a => unit,
  debug2: 'b 'a. ('a, 'b) => unit,
  debug3: 'c 'b 'a. ('a, 'b, 'c) => unit,
  debug4: 'd 'c 'b 'a. ('a, 'b, 'c, 'd) => unit,
  debug5: 'e 'd 'c 'b 'a. ('a, 'b, 'c, 'd, 'e) => unit,
  debug6: 'f 'e 'd 'c 'b 'a. ('a, 'b, 'c, 'd, 'e, 'f) => unit,
  debugMany: 'a. array<'a> => unit,
  error: 'a. 'a => unit,
  error2: 'b 'a. ('a, 'b) => unit,
  error3: 'c 'b 'a. ('a, 'b, 'c) => unit,
  error4: 'd 'c 'b 'a. ('a, 'b, 'c, 'd) => unit,
  error5: 'e 'd 'c 'b 'a. ('a, 'b, 'c, 'd, 'e) => unit,
  error6: 'f 'e 'd 'c 'b 'a. ('a, 'b, 'c, 'd, 'e, 'f) => unit,
  errorMany: 'a. array<'a> => unit,
  warn: 'a. 'a => unit,
  warn2: 'b 'a. ('a, 'b) => unit,
  warn3: 'c 'b 'a. ('a, 'b, 'c) => unit,
  warn4: 'd 'c 'b 'a. ('a, 'b, 'c, 'd) => unit,
  warn5: 'e 'd 'c 'b 'a. ('a, 'b, 'c, 'd, 'e) => unit,
  warn6: 'f 'e 'd 'c 'b 'a. ('a, 'b, 'c, 'd, 'e, 'f) => unit,
  event: 'a. 'a => unit,
  event2: 'b 'a. ('a, 'b) => unit,
  event3: 'c 'b 'a. ('a, 'b, 'c) => unit,
  warnMany: 'a. array<'a> => unit,
  setSeverity: level => unit,
}
