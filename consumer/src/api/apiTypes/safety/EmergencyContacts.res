open Utils

type shareTripOption = ALWAYS_SHARE | SHARE_WITH_TIME_CONSTRAINTS | NEVER_SHARE

let encodeShareTripOption = (shareTripType: option<shareTripOption>): option<string> => {
  switch shareTripType {
  | Some(shareTripType') =>
    switch shareTripType' {
    | ALWAYS_SHARE => Some("ALWAYS_SHARE")
    | SHARE_WITH_TIME_CONSTRAINTS => Some("SHARE_WITH_TIME_CONSTRAINTS")
    | NEVER_SHARE => Some("NEVER_SHARE")
    }
  | None => None
  }
}

let decodeShareTripOption = (shareTripType: option<string>): option<shareTripOption> => {
  switch shareTripType {
  | Some(shareTripType') =>
    switch shareTripType' {
    | "ALWAYS_SHARE" => Some(ALWAYS_SHARE)
    | "SHARE_WITH_TIME_CONSTRAINTS" => Some(SHARE_WITH_TIME_CONSTRAINTS)
    | "NEVER_SHARE" => Some(NEVER_SHARE)
    | _ => None
    }
  | None => None
  }
}

type contactDetails = {
  mobileNumber: string,
  name: string,
  mobileCountryCode: string,
  priority: option<int>,
  enableForFollowing: option<bool>,
  enableForShareRide: option<bool>,
  onRide: option<bool>,
  shareTripWithEmergencyContactOption: option<shareTripOption>,
}

let getContactDetails = dict => {
  {
    mobileNumber: getString(dict, "mobileNumber", ""),
    name: getString(dict, "name", ""),
    mobileCountryCode: getString(dict, "mobileCountryCode", ""),
    priority: getOptionInt(dict, "priority"),
    enableForFollowing: getOptionBool(dict, "enableForFollowing"),
    enableForShareRide: getOptionBool(dict, "enableForShareRide"),
    onRide: getOptionBool(dict, "onRide"),
    shareTripWithEmergencyContactOption: decodeShareTripOption(
      getOptionString(dict, "shareTripWithEmergencyContactOption"),
    ),
  }
}

let getDefaultEmergencyNumbers = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    getContactDetails(dict)
  })
}

type getEmergencyContactsResp = {defaultEmergencyNumbers: array<contactDetails>}

type setEmergencyContactsResp = {result: string}

let getEmergencyContactsMapper = (dict): getEmergencyContactsResp => {
  {defaultEmergencyNumbers: getDefaultEmergencyNumbers(dict, "defaultEmergencyNumbers")}
}

let encodeContactDetails = (req: contactDetails) =>
  Js.Dict.fromArray([
    ("mobileNumber", req.mobileNumber->encodeString),
    ("name", req.name->encodeString),
    ("mobileCountryCode", req.mobileCountryCode->encodeString),
    ("priority", req.priority->encodeOptionInt),
    ("enableForFollowing", req.enableForFollowing->encodeOptionBool),
    ("enableForShareRide", req.enableForShareRide->encodeOptionBool),
    ("onRide", req.onRide->encodeOptionBool),
    (
      "shareTripWithEmergencyContactOption",
      encodeShareTripOption(req.shareTripWithEmergencyContactOption)->encodeOptionString,
    ),
  ])->Js.Json.object_

let decodeContactDetails = (req: array<contactDetails>) => {
  let jsonArray = req->Array.map(encodeContactDetails)
  Js.Json.object_(Js.Dict.fromArray([("defaultEmergencyNumbers", Js.Json.array(jsonArray))]))
}
