open Utils

let getBody = (~number: string) =>
  {
    "mobileNumber": number,
    "mobileCountryCode": "+91",
    "merchantId": "NAMMA_YATRI",
    "otpChannel": "SMS",
  }

let toJSON = req => {
  req->asJson
}

type authApiResponseType = {
  attempts: float,
  authId: string,
  authType: string,
  isPersonBlocked: bool,
  person: string,
  token: string,
}

let jsonToAuthType = data => {
  switch data->JSON.Decode.object {
  | Some(obj) =>
    Some({
      attempts: getFloat(obj, "attempts", 0.),
      authId: getString(obj, "authId", ""),
      authType: getString(obj, "authType", ""),
      isPersonBlocked: getBool(obj, "authType", false),
      person: getString(obj, "person", ""),
      token: getString(obj, "token", ""),
    })
  | None => None
  }
}

let _ = jsonToAuthType
