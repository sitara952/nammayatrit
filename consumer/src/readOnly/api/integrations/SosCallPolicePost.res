open APISuccess
open CallPoliceAPI
open Utils

let sosCallPolicePostApiCall = async (body: callPoliceAPI) => {
  let data = await ApiCall.callPostAPI'(~url="/sos/callPolice", ~body=body->CallPoliceAPI.toJson)
  APISuccess.decodeAPISuccess(data)
}
