open DayJs

dayJs.extend(relativeTime)
dayJs.extend(customParseFormat)
dayJs.extend(advancedFormat)
dayJs.extend(utc)

// Gives current date in the specified format
let getCurrentDate = (format: string): string => {
  let now = getDayJs()
  now.format(format)
}
// Gives the next date by adding days
let getNextDate = (date: string, format: string, daysToAdd: int): string => {
  let dayJsDate = getDayJsFromCustomFormatString(date, format, true)
  dayJsDate.add(daysToAdd, "day").format(format)
}

// Gives the current time in specified format
let getCurrentTime = (format: string): string => {
  let now = getDayJs()
  now.format(format)
}

// Gives UTC in specified format
let getUTC = (format: string): string => {
  let now = getDayJs().utc()
  now.format(format)
}

let getISTWithFormat = (utcTime: string, format: string): string => {
  let utcDateTime = getDayJsForString(utcTime)
  let istDateTime = utcDateTime.utc().add(5, "hour").add(30, "minute")
  istDateTime.format(format)
}

// Checks if given date is weekend or not
let isWeekend = (): bool => {
  let today = getDayJs()
  let dayOfWeek = today.day()
  dayOfWeek == 0 || dayOfWeek == 6
}

// Both dates should be in format YYYY MM DD
let getDifferenceBetweenDates = (date1: string, date2: string, unit: string): int => {
  let dayJsDate1 = getDayJsForString(date1)
  let dayJsDate2 = getDayJsForString(date2)
  dayJsDate1.diff(dayJsDate2, unit)
}

// Converts the seconds into "HH:mm:ss"
let secondsToHms = (totalSeconds: int): string => {
  let hours = Js.Math.floor(Int.toFloat(totalSeconds / 3600))
  let remainingSeconds = totalSeconds - hours * 3600
  let minutes = Js.Math.floor(Int.toFloat(remainingSeconds / 60))
  let seconds = remainingSeconds - minutes * 60

  let hoursStr = if hours < 10 {
    "0" ++ string_of_int(hours)
  } else {
    string_of_int(hours)
  }
  let minutesStr = if minutes < 10 {
    "0" ++ string_of_int(minutes)
  } else {
    string_of_int(minutes)
  }
  let secondsStr = if seconds < 10 {
    "0" ++ string_of_int(seconds)
  } else {
    string_of_int(seconds)
  }

  hoursStr ++ ":" ++ minutesStr ++ ":" ++ secondsStr
}

// Converts the given ust time to 12hr format
let convertUTCToISTAnd12HourFormat = (utcTime: string): string => {
  let utcDateTime = getDayJsForString(utcTime)
  let istDateTime = utcDateTime.utc().add(5, "hour").add(30, "minute") // Adding 5 hours 30 minutes to convert UTC to IST
  let hour = istDateTime.hour()
  let minute = istDateTime.minute()
  let period = if hour < 12 {
    "AM"
  } else {
    "PM"
  }
  let hour12 = if hour == 0 {
    12
  } else if hour > 12 {
    hour - 12
  } else {
    hour
  }
  let hourStr = if hour12 < 10 {
    "0" ++ string_of_int(hour12)
  } else {
    string_of_int(hour12)
  }
  let minuteStr = if minute < 10 {
    "0" ++ string_of_int(minute)
  } else {
    string_of_int(minute)
  }
  hourStr ++ ":" ++ minuteStr ++ " " ++ period
}

// Converts given time to 12hr format
let convertTo12HourFormat = (time: string): string => {
  let timeObj = getDayJsForString(time)
  let hour = timeObj.hour()
  let period = if hour < 12 {
    "AM"
  } else {
    "PM"
  }
  let hour12 = if hour == 0 {
    12
  } else if hour > 12 {
    hour - 12
  } else {
    hour
  }
  let hourStr = if hour12 < 10 {
    "0" ++ string_of_int(hour12)
  } else {
    string_of_int(hour12)
  }
  let minute = timeObj.minute()
  let minuteStr = if minute < 10 {
    "0" ++ string_of_int(minute)
  } else {
    string_of_int(minute)
  }
  let secondStr = timeObj.format("ss")
  hourStr ++ ":" ++ minuteStr ++ ":" ++ secondStr ++ " " ++ period
}
