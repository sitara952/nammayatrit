open Utils
open EmergencyContacts

type emergencySettingsReq = {
  autoCallDefaultContact: bool,
  defaultEmergencyNumbers: array<EmergencyContacts.contactDetails>,
  enablePoliceSupport: bool,
  enablePostRideSafetyCheck: bool,
  enableUnexpectedEventsCheck: bool,
  hasCompletedMockSafetyDrill: bool,
  hasCompletedSafetySetup: bool,
  informPoliceSos: bool,
  localPoliceNumber: string,
  nightSafetyChecks: bool,
  notifySafetyTeamForSafetyCheckFailure: bool,
  notifySosWithEmergencyContacts: bool,
  safetyCenterDisabledOnDate: option<string>,
  shakeToActivate: bool,
  shareEmergencyContacts: bool,
  shareTripWithEmergencyContactOption: option<EmergencyContacts.shareTripOption>,
  shareTripWithEmergencyContacts: bool,
}

let decodeEmergencySettingsReq = dict => {
  try {
    Some({
      autoCallDefaultContact: getOptionBool(dict, "autoCallDefaultContact")->Belt.Option.getExn,
      defaultEmergencyNumbers: getDefaultEmergencyNumbers(dict, "defaultEmergencyNumbers"),
      enablePoliceSupport: getOptionBool(dict, "enablePoliceSupport")->Belt.Option.getExn,
      enablePostRideSafetyCheck: getOptionBool(
        dict,
        "enablePostRideSafetyCheck",
      )->Belt.Option.getExn,
      enableUnexpectedEventsCheck: getOptionBool(
        dict,
        "enableUnexpectedEventsCheck",
      )->Belt.Option.getExn,
      hasCompletedMockSafetyDrill: getOptionBool(
        dict,
        "hasCompletedMockSafetyDrill",
      )->Belt.Option.getExn,
      hasCompletedSafetySetup: getOptionBool(dict, "hasCompletedSafetySetup")->Belt.Option.getExn,
      informPoliceSos: getOptionBool(dict, "informPoliceSos")->Belt.Option.getExn,
      localPoliceNumber: getOptionString(dict, "localPoliceNumber")->Belt.Option.getExn,
      nightSafetyChecks: getOptionBool(dict, "nightSafetyChecks")->Belt.Option.getExn,
      notifySafetyTeamForSafetyCheckFailure: getOptionBool(
        dict,
        "notifySafetyTeamForSafetyCheckFailure",
      )->Belt.Option.getExn,
      notifySosWithEmergencyContacts: getOptionBool(
        dict,
        "notifySosWithEmergencyContacts",
      )->Belt.Option.getExn,
      safetyCenterDisabledOnDate: getOptionString(dict, "safetyCenterDisabledOnDate"),
      shakeToActivate: getOptionBool(dict, "shakeToActivate")->Belt.Option.getExn,
      shareEmergencyContacts: getOptionBool(dict, "shareEmergencyContacts")->Belt.Option.getExn,
      shareTripWithEmergencyContactOption: decodeShareTripOption(
        getOptionString(dict, "shareTripWithEmergencyContactOption"),
      ),
      shareTripWithEmergencyContacts: getOptionBool(
        dict,
        "shareTripWithEmergencyContacts",
      )->Belt.Option.getExn,
    })
  } catch {
  | _ => None
  }
}

let encodeEmergencySettingsReq = req =>
  Js.Dict.fromArray([
    ("autoCallDefaultContact", req.autoCallDefaultContact->encodeBool),
    (
      "defaultEmergencyNumbers",
      req.defaultEmergencyNumbers->Array.map(encodeContactDetails)->Js.Json.array,
    ),
    ("enablePoliceSupport", req.enablePoliceSupport->encodeBool),
    ("enablePostRideSafetyCheck", req.enablePostRideSafetyCheck->encodeBool),
    ("enableUnexpectedEventsCheck", req.enableUnexpectedEventsCheck->encodeBool),
    ("hasCompletedMockSafetyDrill", req.hasCompletedMockSafetyDrill->encodeBool),
    ("hasCompletedSafetySetup", req.hasCompletedSafetySetup->encodeBool),
    ("informPoliceSos", req.informPoliceSos->encodeBool),
    ("localPoliceNumber", req.localPoliceNumber->encodeString),
    ("nightSafetyChecks", req.nightSafetyChecks->encodeBool),
    (
      "notifySafetyTeamForSafetyCheckFailure",
      req.notifySafetyTeamForSafetyCheckFailure->encodeBool,
    ),
    ("notifySosWithEmergencyContacts", req.notifySosWithEmergencyContacts->encodeBool),
    ("safetyCenterDisabledOnDate", req.safetyCenterDisabledOnDate->encodeOptionString),
    ("shakeToActivate", req.shakeToActivate->encodeBool),
    ("shareEmergencyContacts", req.shareEmergencyContacts->encodeBool),
    (
      "shareTripWithEmergencyContactOption",
      encodeShareTripOption(req.shareTripWithEmergencyContactOption)->encodeOptionString,
    ),
    ("shareTripWithEmergencyContacts", req.shareTripWithEmergencyContacts->encodeBool),
  ])->Js.Json.object_
