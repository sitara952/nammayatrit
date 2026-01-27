open APISuccess
open ShareRideReq
open Utils

let shareRidePostApiCall = async (body: shareRideReq) => {
  let data = await ApiCall.callPostAPI'(~url="/share/ride", ~body=body->ShareRideReq.toJson)
  APISuccess.decodeAPISuccess(data)
}
