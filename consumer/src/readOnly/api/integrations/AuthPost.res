open AuthReq
open AuthRes
open Utils

let authPostApiCall = async (body: authReq) => {
  let data = await ApiCall.callPostAPI'(~url="/auth", ~body=body->AuthReq.toJson)
  AuthRes.decodeAuthRes(data)
}
