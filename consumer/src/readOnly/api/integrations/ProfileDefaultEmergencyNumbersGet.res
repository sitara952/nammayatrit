open GetProfileDefaultEmergencyNumbersResp
open Utils

let profileDefaultEmergencyNumbersGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/profile/defaultEmergencyNumbers")
  GetProfileDefaultEmergencyNumbersResp.decodeGetProfileDefaultEmergencyNumbersResp(data)
}
