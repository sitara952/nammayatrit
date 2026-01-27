open APISuccess
open FeedbackReq
open Utils

let feedbackRateRidePostApiCall = async (body: feedbackReq) => {
  let data = await ApiCall.callPostAPI'(~url="/feedback/rateRide", ~body=body->FeedbackReq.toJson)
  APISuccess.decodeAPISuccess(data)
}
