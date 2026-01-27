open DSelectReq
open DSelectResultRes
open Utils

let estimateEstimateIdSelectPostApiCall = async (estimateId: string, body: dSelectReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/estimate" ++ "/" ++ estimateId ++ "/" ++ "select",
    ~body=body->DSelectReq.toJson,
  )
  DSelectResultRes.decodeDSelectResultRes(data)
}
