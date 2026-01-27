open APISuccess
open TriggerFcmReq
open Utils

let triggerFCMMessagePostApiCall = async (body: triggerFcmReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/triggerFCM/message",
    ~body=body->TriggerFcmReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
