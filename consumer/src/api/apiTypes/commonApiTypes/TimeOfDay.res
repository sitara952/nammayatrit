@genType
type timeOfDay = string

let decodeTimeOfDay = x =>
  Js.Json.decodeString(x)->Option.mapOr(Error("failed to decode timeOfDay string"), x => Ok(x))
