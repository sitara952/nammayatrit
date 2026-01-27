open AckResponse
open ExotelCallCallbackReq_CallAttachments
open Utils

let rideCallStatusCallbackPostApiCall = async (body: exotelCallCallbackReq_CallAttachments) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/ride/call/statusCallback",
    ~body=body->ExotelCallCallbackReq_CallAttachments.toJson,
  )
  AckResponse.decodeAckResponse(data)
}
