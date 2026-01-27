open APISuccess
open SafetyCheckSupportReq
open Utils

let supportSafetyCheckSupportPostApiCall = async (body: safetyCheckSupportReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/support/safetyCheckSupport",
    ~body=body->SafetyCheckSupportReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
