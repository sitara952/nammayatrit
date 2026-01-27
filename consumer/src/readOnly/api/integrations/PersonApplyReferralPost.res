open ApplyCodeReq
open ReferrerInfo
open Utils

let personApplyReferralPostApiCall = async (body: applyCodeReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/person/applyReferral",
    ~body=body->ApplyCodeReq.toJson,
  )
  ReferrerInfo.decodeReferrerInfo(data)
}
