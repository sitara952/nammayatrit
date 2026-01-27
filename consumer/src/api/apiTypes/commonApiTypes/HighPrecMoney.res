@genType
type highPrecMoney = float

let decodeHighPrecMoney = x =>
  Js.Json.decodeNumber(x)->Option.mapOr(Error("failed to decode highPrecMoney float"), x => Ok(x))
