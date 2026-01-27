open APISuccess
open UpdateEmergencySettingsReq
open Utils

let profileUpdateEmergencySettingsPutApiCall = async (body: updateEmergencySettingsReq) => {
  let data = await ApiCall.callPutAPI'(
    ~url="/profile/updateEmergencySettings",
    ~body=body->UpdateEmergencySettingsReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
