open APISuccess
open AddTipRequest
open Utils

let paymentRideIdAddTipPostApiCall = async (rideId: string, body: addTipRequest) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/payment" ++ "/" ++ rideId ++ "/" ++ "addTip",
    ~body=body->AddTipRequest.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
