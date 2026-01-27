open ServiceabilityReq
open ServiceabilityRes
open Utils

let serviceabilityOriginPostApiCall = async (body: serviceabilityReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/serviceability/origin",
    ~body=body->ServiceabilityReq.toJson,
  )
  ServiceabilityRes.decodeServiceabilityRes(data)
}
