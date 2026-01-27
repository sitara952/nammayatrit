open Utils

type issue = {
  reason: string,
  description: string,
}

type sendIssueReq = {
  contactEmail: option<string>,
  rideBookingId: option<string>,
  issue: issue,
  nightSafety: option<bool>,
}

let encodeIssue = req =>
  Js.Dict.fromArray([
    ("reason", req.reason->encodeString),
    ("description", req.description->encodeString),
  ])->Js.Json.object_

let encodeSendIssueReq = req =>
  Js.Dict.fromArray([
    ("contactEmail", req.contactEmail->encodeOptionString),
    ("rideBookingId", req.rideBookingId->encodeOptionString),
    ("issue", req.issue->encodeIssue),
    ("nightSafety", req.nightSafety->encodeOptionBool),
  ])->Js.Json.object_

type sendIssueRes = {result: string}

let decodeToSendIssueRes = dict => {
  try {
    Some({result: getOptionString(dict, "result")->Belt.Option.getExn})
  } catch {
  | _ => None
  }
}
