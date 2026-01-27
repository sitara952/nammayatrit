open AuthRes
open Utils

let authOtpAuthIdResendPostApiCall = async (authId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/auth/otp" ++ "/" ++ authId ++ "/" ++ "resend")
  AuthRes.decodeAuthRes(data)
}
