open APISuccess
open MarkAsSafeReq
open Utils

let sosMarkRideAsSafeSosIdPostApiCall = async (sosId: string, body: markAsSafeReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/sos/markRideAsSafe" ++ "/" ++ sosId ++ "/" ++ "",
    ~body=body->MarkAsSafeReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
