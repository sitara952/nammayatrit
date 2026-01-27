open APISuccess
open SocialUpdateProfileReq
open Utils

let socialUpdateProfilePostApiCall = async (body: socialUpdateProfileReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/social/update/profile",
    ~body=body->SocialUpdateProfileReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
