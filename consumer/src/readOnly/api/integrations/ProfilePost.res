open APISuccess
open UpdateProfileReq
open Utils

let profilePostApiCall = async (body: updateProfileReq) => {
  let data = await ApiCall.callPostAPI'(~url="/profile", ~body=body->UpdateProfileReq.toJson)
  APISuccess.decodeAPISuccess(data)
}
