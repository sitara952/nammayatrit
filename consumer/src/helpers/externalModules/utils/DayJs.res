type relativeTime

@module("dayjs/plugin/relativeTime")
external relativeTime: relativeTime = "default"

@module("dayjs/plugin/isToday")
external isToday: relativeTime = "default"

@module("dayjs/plugin/customParseFormat")
external customParseFormat: relativeTime = "default"

@module("dayjs/plugin/advancedFormat")
external advancedFormat: relativeTime = "default"

@module("dayjs/plugin/utc")
external utc: relativeTime = "default"

@module("dayjs/plugin/localizedFormat")
external localizedFormat: relativeTime = "default"

@module("dayjs/plugin/duration")
external duration: relativeTime = "default"

type rec dayJs = {
  isValid: unit => bool,
  toString: unit => string,
  toDate: unit => Date.t,
  add: (int, string) => dayJs,
  isSame: (string, string) => bool,
  subtract: (int, string) => dayJs,
  diff: (dayJs, string) => int,
  year: unit => int,
  date: int => dayJs,
  endOf: string => dayJs,
  startOf: string => dayJs,
  format: string => string,
  fromNow: unit => string,
  month: unit => int,
  isToday: unit => bool,
  utc: unit => dayJs,
  day: unit => int,
  hour: unit => int,
  minute: unit => int,
  second: unit => int,
}

type extendable = {extend: relativeTime => unit}

@module("dayjs")
external dayJs: extendable = "default"

@module("dayjs")
external getDayJs: unit => dayJs = "default"

@module("dayjs")
external getDayJsForString: string => dayJs = "default"

@module("dayjs")
external getDayJsFromCustomFormatString: (string, string, bool) => dayJs = "default"

@module("dayjs")
external dayJsCustomFormat: (string, string) => dayJs = "default"

let getDayJsForJsDate = date => {
  date->Date.toString->getDayJsForString
}
