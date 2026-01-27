open SosReq
open SosRes
open Utils

let sosCreatePostApiCall = async (body: sosReq) => {
  let data = await ApiCall.callPostAPI'(~url="/sos/create", ~body=body->SosReq.toJson)
  SosRes.decodeSosRes(data)
}
