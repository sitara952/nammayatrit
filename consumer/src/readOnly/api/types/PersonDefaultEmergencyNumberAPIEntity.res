open Enums
open Utils

@genType
type personDefaultEmergencyNumberAPIEntity = {
  contactPersonId: option<string>,
  enableForFollowing: bool,
  enableForShareRide: bool,
  merchantId: option<string>,
  mobileCountryCode: string,
  mobileNumber: string,
  name: string,
  notifiedViaFCM: option<bool>,
  onRide: bool,
  personId: string,
  priority: int,
  shareTripWithEmergencyContactOption: option<RideShareOptions.rideShareOptions>,
}

let decodePersonDefaultEmergencyNumberAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          contactPersonId: getOptionString(dict, "contactPersonId"),
          enableForFollowing: getOptionBool(dict, "enableForFollowing")->Option.getExn(
            ~message="enableForFollowing not found",
          ),
          enableForShareRide: getOptionBool(dict, "enableForShareRide")->Option.getExn(
            ~message="enableForShareRide not found",
          ),
          merchantId: getOptionString(dict, "merchantId"),
          mobileCountryCode: getOptionString(dict, "mobileCountryCode")->Option.getExn(
            ~message="mobileCountryCode not found",
          ),
          mobileNumber: getOptionString(dict, "mobileNumber")->Option.getExn(
            ~message="mobileNumber not found",
          ),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          notifiedViaFCM: getOptionBool(dict, "notifiedViaFCM"),
          onRide: getOptionBool(dict, "onRide")->Option.getExn(~message="onRide not found"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          priority: getOptionInt(dict, "priority")->Option.getExn(~message="priority not found"),
          shareTripWithEmergencyContactOption: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "shareTripWithEmergencyContactOption",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PersonDefaultEmergencyNumberAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: personDefaultEmergencyNumberAPIEntity) => {
  req->asJson
}
