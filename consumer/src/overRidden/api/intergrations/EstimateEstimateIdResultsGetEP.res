open APISuccess
open Select2Req
open ReactQuery

module Keys = {
  let all = ["estimateEstimateIdSelect2Post"]
}

let estimateEstimateIdSelect2PostApiCall = async (estimateId: string, body: dSelectReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/estimate" ++ "/" ++ estimateId ++ "/" ++ "select2",
    ~body=body->Select2Req.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
