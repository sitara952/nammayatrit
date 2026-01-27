open APISuccess
open SosUpdateReq
open Utils

let sosSosIdStatusPostApiCall = async (sosId: string, body: sosUpdateReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/sos" ++ "/" ++ sosId ++ "/" ++ "status",
    ~body=body->SosUpdateReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
