open Enums
open Utils

@genType
type updateEmergencySettingsReq = {
  autoCallDefaultContact: option<bool>,
  enableOtpLessRide: option<bool>,
  enablePostRideSafetyCheck: option<RideShareOptions.rideShareOptions>,
  enableUnexpectedEventsCheck: option<RideShareOptions.rideShareOptions>,
  hasCompletedMockSafetyDrill: option<bool>,
  hasCompletedSafetySetup: option<bool>,
  informPoliceSos: option<bool>,
  nightSafetyChecks: option<bool>,
  notifySafetyTeamForSafetyCheckFailure: option<bool>,
  notifySosWithEmergencyContacts: option<bool>,
  safetyCenterDisabledOnDate: option<string>,
  shakeToActivate: option<bool>,
  shareEmergencyContacts: option<bool>,
  shareTripWithEmergencyContactOption: option<RideShareOptions.rideShareOptions>,
  shareTripWithEmergencyContacts: option<bool>,
}

let decodeUpdateEmergencySettingsReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          autoCallDefaultContact: getOptionBool(dict, "autoCallDefaultContact"),
          enableOtpLessRide: getOptionBool(dict, "enableOtpLessRide"),
          enablePostRideSafetyCheck: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "enablePostRideSafetyCheck",
          )->Result.mapOr(None, x => Some(x)),
          enableUnexpectedEventsCheck: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "enableUnexpectedEventsCheck",
          )->Result.mapOr(None, x => Some(x)),
          hasCompletedMockSafetyDrill: getOptionBool(dict, "hasCompletedMockSafetyDrill"),
          hasCompletedSafetySetup: getOptionBool(dict, "hasCompletedSafetySetup"),
          informPoliceSos: getOptionBool(dict, "informPoliceSos"),
          nightSafetyChecks: getOptionBool(dict, "nightSafetyChecks"),
          notifySafetyTeamForSafetyCheckFailure: getOptionBool(
            dict,
            "notifySafetyTeamForSafetyCheckFailure",
          ),
          notifySosWithEmergencyContacts: getOptionBool(dict, "notifySosWithEmergencyContacts"),
          safetyCenterDisabledOnDate: getOptionString(dict, "safetyCenterDisabledOnDate"),
          shakeToActivate: getOptionBool(dict, "shakeToActivate"),
          shareEmergencyContacts: getOptionBool(dict, "shareEmergencyContacts"),
          shareTripWithEmergencyContactOption: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "shareTripWithEmergencyContactOption",
          )->Result.mapOr(None, x => Some(x)),
          shareTripWithEmergencyContacts: getOptionBool(dict, "shareTripWithEmergencyContacts"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdateEmergencySettingsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updateEmergencySettingsReq) => {
  req->asJson
}
