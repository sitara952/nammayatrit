open AuthVerifyReq
open AuthVerifyRes
open Utils

let authAuthIdVerifyPostApiCall = async (authId: string, body: authVerifyReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/auth" ++ "/" ++ authId ++ "/" ++ "verify",
    ~body=body->AuthVerifyReq.toJson,
  )
  AuthVerifyRes.decodeAuthVerifyRes(data)
}
