open ServiceabilityReq
open ServiceabilityRes
open Utils

let serviceabilityDestinationPostApiCall = async (body: serviceabilityReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/serviceability/destination",
    ~body=body->ServiceabilityReq.toJson,
  )
  ServiceabilityRes.decodeServiceabilityRes(data)
}
