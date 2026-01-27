open APISuccess
open MockSosReq
open Utils

let sosCreateMockSosPostApiCall = async (body: mockSosReq) => {
  let data = await ApiCall.callPostAPI'(~url="/sos/createMockSos", ~body=body->MockSosReq.toJson)
  APISuccess.decodeAPISuccess(data)
}
