open APISuccess
open OptAPIRequest
open Utils

let whatsappOptPostApiCall = async (body: optAPIRequest) => {
  let data = await ApiCall.callPostAPI'(~url="/whatsapp/opt", ~body=body->OptAPIRequest.toJson)
  APISuccess.decodeAPISuccess(data)
}
