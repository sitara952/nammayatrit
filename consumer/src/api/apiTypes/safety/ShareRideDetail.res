open Utils

type shareRideReq = {emergencyContactNumbers: array<string>}

type shareRideRes = {result: string}

let makeShareRideDetailReq = (phoneNumbers: array<string>): shareRideReq => {
  emergencyContactNumbers: phoneNumbers,
}

let decodeShareRideRes = (res): shareRideRes => {
  let dict = res->getDictFromJson
  {result: getString(dict, "result", "")}
}
