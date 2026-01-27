open Enums
open PersonDefaultEmergencyNumberAPIEntity
open Utils

@genType
type emergencySettingsRes = {
  autoCallDefaultContact: bool,
  defaultEmergencyNumbers: array<personDefaultEmergencyNumberAPIEntity>,
  enableOtpLessRide: option<bool>,
  enablePoliceSupport: bool,
  enablePostRideSafetyCheck: RideShareOptions.rideShareOptions,
  enableUnexpectedEventsCheck: RideShareOptions.rideShareOptions,
  hasCompletedMockSafetyDrill: bool,
  hasCompletedSafetySetup: bool,
  informPoliceSos: bool,
  localPoliceNumber: option<string>,
  nightSafetyChecks: bool,
  notifySafetyTeamForSafetyCheckFailure: bool,
  notifySosWithEmergencyContacts: bool,
  safetyCenterDisabledOnDate: option<string>,
  safetyCheckEndTime: int,
  safetyCheckStartTime: int,
  shakeToActivate: bool,
  shareEmergencyContacts: bool,
  shareTripWithEmergencyContactOption: RideShareOptions.rideShareOptions,
  shareTripWithEmergencyContacts: bool,
}

let decodeEmergencySettingsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          autoCallDefaultContact: getOptionBool(dict, "autoCallDefaultContact")->Option.getExn(
            ~message="autoCallDefaultContact not found",
          ),
          defaultEmergencyNumbers: dict
          ->Dict.get("defaultEmergencyNumbers")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="defaultEmergencyNumbers is not of array")
          ->Array.map(x =>
            decodePersonDefaultEmergencyNumberAPIEntity(x)->Utils.getResultExn(
              ~message="defaultEmergencyNumbers is coming as undefined",
            )
          ),
          enableOtpLessRide: getOptionBool(dict, "enableOtpLessRide"),
          enablePoliceSupport: getOptionBool(dict, "enablePoliceSupport")->Option.getExn(
            ~message="enablePoliceSupport not found",
          ),
          enablePostRideSafetyCheck: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "enablePostRideSafetyCheck",
          )->Utils.getResultExn(~message="enablePostRideSafetyCheck is coming as undefined"),
          enableUnexpectedEventsCheck: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "enableUnexpectedEventsCheck",
          )->Utils.getResultExn(~message="enableUnexpectedEventsCheck is coming as undefined"),
          hasCompletedMockSafetyDrill: getOptionBool(
            dict,
            "hasCompletedMockSafetyDrill",
          )->Option.getExn(~message="hasCompletedMockSafetyDrill not found"),
          hasCompletedSafetySetup: getOptionBool(dict, "hasCompletedSafetySetup")->Option.getExn(
            ~message="hasCompletedSafetySetup not found",
          ),
          informPoliceSos: getOptionBool(dict, "informPoliceSos")->Option.getExn(
            ~message="informPoliceSos not found",
          ),
          localPoliceNumber: getOptionString(dict, "localPoliceNumber"),
          nightSafetyChecks: getOptionBool(dict, "nightSafetyChecks")->Option.getExn(
            ~message="nightSafetyChecks not found",
          ),
          notifySafetyTeamForSafetyCheckFailure: getOptionBool(
            dict,
            "notifySafetyTeamForSafetyCheckFailure",
          )->Option.getExn(~message="notifySafetyTeamForSafetyCheckFailure not found"),
          notifySosWithEmergencyContacts: getOptionBool(
            dict,
            "notifySosWithEmergencyContacts",
          )->Option.getExn(~message="notifySosWithEmergencyContacts not found"),
          safetyCenterDisabledOnDate: getOptionString(dict, "safetyCenterDisabledOnDate"),
          safetyCheckEndTime: getOptionInt(dict, "safetyCheckEndTime")->Option.getExn(
            ~message="safetyCheckEndTime not found",
          ),
          safetyCheckStartTime: getOptionInt(dict, "safetyCheckStartTime")->Option.getExn(
            ~message="safetyCheckStartTime not found",
          ),
          shakeToActivate: getOptionBool(dict, "shakeToActivate")->Option.getExn(
            ~message="shakeToActivate not found",
          ),
          shareEmergencyContacts: getOptionBool(dict, "shareEmergencyContacts")->Option.getExn(
            ~message="shareEmergencyContacts not found",
          ),
          shareTripWithEmergencyContactOption: RideShareOptions.decodeRideShareOptionsResult(
            dict,
            "shareTripWithEmergencyContactOption",
          )->Utils.getResultExn(
            ~message="shareTripWithEmergencyContactOption is coming as undefined",
          ),
          shareTripWithEmergencyContacts: getOptionBool(
            dict,
            "shareTripWithEmergencyContacts",
          )->Option.getExn(~message="shareTripWithEmergencyContacts not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EmergencySettingsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: emergencySettingsRes) => {
  req->asJson
}
