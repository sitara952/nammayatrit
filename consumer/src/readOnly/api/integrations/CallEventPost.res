open APISuccess
open CallEventReq
open Utils

let callEventPostApiCall = async (body: callEventReq) => {
  let data = await ApiCall.callPostAPI'(~url="/callEvent", ~body=body->CallEventReq.toJson)
  APISuccess.decodeAPISuccess(data)
}
