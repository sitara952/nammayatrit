open APISuccess
open UpdateProfileDefaultEmergencyNumbersReq
open Utils

let profileDefaultEmergencyNumbersPostApiCall = async (
  body: updateProfileDefaultEmergencyNumbersReq,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/profile/defaultEmergencyNumbers",
    ~body=body->UpdateProfileDefaultEmergencyNumbersReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
