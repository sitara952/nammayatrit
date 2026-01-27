open EmergencySettingsRes
open Utils

let profileGetEmergencySettingsGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/profile/getEmergencySettings")
  EmergencySettingsRes.decodeEmergencySettingsRes(data)
}
