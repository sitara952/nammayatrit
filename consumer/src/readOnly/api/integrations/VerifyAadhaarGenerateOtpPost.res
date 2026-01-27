open AadhaarOtpReq
open AadhaarVerificationResp
open Utils

let verifyAadhaarGenerateOtpPostApiCall = async (body: aadhaarOtpReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/verifyAadhaar/generateOtp",
    ~body=body->AadhaarOtpReq.toJson,
  )
  AadhaarVerificationResp.decodeAadhaarVerificationResp(data)
}
