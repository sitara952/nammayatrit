open APISuccess
open CreateSavedReqLocationReq
open Utils

let savedLocationPostApiCall = async (body: createSavedReqLocationReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/savedLocation",
    ~body=body->CreateSavedReqLocationReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
