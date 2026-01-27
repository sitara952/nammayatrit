open ReactNative

type t
type a

@module("react-native-background-timer")
external backgroundTimer: t = "default"

@module("react-native")
external platform: {..} = "Platform"

let getPlatform = () => {
  let os = switch Platform.os {
  | #ios => "iOS"
  | #android => "Android"
  | _ => "Unknown"
  }
  os
}

@send external runBackgroundTimer: (t, unit => unit, int) => unit = "runBackgroundTimer"
@send external stopBackgroundTimer: (t, int) => unit = "stopBackgroundTimer"
@send external setInterval: (t, unit => unit, int) => int = "setInterval"
@send external clearInterval: (t, int) => unit = "clearInterval"
@send external setTimeout: (t, unit => unit, int) => int = "setTimeout"
@send external clearTimeout: (t, int) => unit = "clearTimeout"
@send external start: (t, unit) => unit = "start"
@send external stop: (t, unit) => unit = "stop"

// Call runBackgroundTask with the task to be run in background and the interval
let runBackgroundInterval = (~task: unit => unit, ~interval: int) => {
  // For ios, the setInterval must be enclosed inside start() and stop() functions
  if getPlatform() == "iOS" {
    backgroundTimer->start()
  }
  backgroundTimer->setInterval(task, interval)
}

// Call stopBackGroundTask with the bgId returned by runBackgroundTask
let stopBackgroundInterval = (~bgId: int) => {
  backgroundTimer->clearInterval(bgId)
  if getPlatform() == "iOS" {
    backgroundTimer->stop()
  }
}

let runBackgroundTimeout = (~task: unit => unit, ~delay: int) => {
  // For ios, the setTimeout must be enclosed inside start() and stop() functions
  if getPlatform() == "iOS" {
    backgroundTimer->start()
  }
  backgroundTimer->setTimeout(task, delay)
}

let stopBackgroundTimeout = (~bgId: int) => {
  backgroundTimer->clearTimeout(bgId)
  if getPlatform() == "iOS" {
    backgroundTimer->stop()
  }
}
