open APISuccess
open DSelectReq
open Utils

let estimateEstimateIdSelect2PostApiCall = async (estimateId: string, body: dSelectReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/estimate" ++ "/" ++ estimateId ++ "/" ++ "select2",
    ~body=body->DSelectReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
