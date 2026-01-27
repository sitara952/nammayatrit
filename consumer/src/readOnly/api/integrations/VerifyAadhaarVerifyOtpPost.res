open AadhaarOtpVerifyRes
open VerifyAadhaarOtpReq
open Utils

let verifyAadhaarVerifyOtpPostApiCall = async (body: verifyAadhaarOtpReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/verifyAadhaar/verifyOtp",
    ~body=body->VerifyAadhaarOtpReq.toJson,
  )
  AadhaarOtpVerifyRes.decodeAadhaarOtpVerifyRes(data)
}
