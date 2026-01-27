open AuthRes
open Utils

let authSignaturePostApiCall = async () => {
  let data = await ApiCall.callPostAPI'(~url="/auth/signature")
  AuthRes.decodeAuthRes(data)
}
