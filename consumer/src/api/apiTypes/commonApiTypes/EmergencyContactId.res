@genType
type emergencyContactId = string

let decodeEmergencyContactId = x =>
  Js.Json.decodeString(x)->Option.mapOr(
    Error("failed to decode EmergencyContactId string"),
    x => Ok(x),
  )
