open Enums
open Utils

@genType
type personDefaultEmergencyNumber = {
  enableForFollowing: option<bool>,
  mobileCountryCode: string,
  mobileNumber: string,
  name: string,
  priority: option<int>,
  shareTripWithEmergencyContactOption: option<RideShareOptions.rideShareOptions>,
}

let decodePersonDefaultEmergencyNumber = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          enableForFollowing: getOptionBool(dict, "enableForFollowing"),
          mobileCountryCode: getOptionString(dict, "mobileCountryCode")->Option.getExn(
            ~message="mobileCountryCode not found",
          ),
          mobileNumber: getOptionString(dict, "mobileNumber")->Option.getExn(
            ~message="mobileNumber not found",
          ),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          priority: getOptionInt(dict, "priority"),
          shareTripWithEmergencyContactOption: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "shareTripWithEmergencyContactOption",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PersonDefaultEmergencyNumber ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: personDefaultEmergencyNumber) => {
  req->asJson
}
