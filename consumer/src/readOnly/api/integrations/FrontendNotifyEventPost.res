open APISuccess
open NotifyEventReq
open Utils

let frontendNotifyEventPostApiCall = async (body: notifyEventReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/frontend/notifyEvent",
    ~body=body->NotifyEventReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
