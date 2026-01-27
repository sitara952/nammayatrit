open SocialLoginReq
open SocialLoginRes
open Utils

let socialLoginPostApiCall = async (body: socialLoginReq) => {
  let data = await ApiCall.callPostAPI'(~url="/social/login", ~body=body->SocialLoginReq.toJson)
  SocialLoginRes.decodeSocialLoginRes(data)
}
