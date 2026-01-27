open APISuccess
open FeedbackFormReq
open Utils

let feedbackSubmitPostApiCall = async (body: feedbackFormReq) => {
  let data = await ApiCall.callPostAPI'(~url="/feedback/submit", ~body=body->FeedbackFormReq.toJson)
  APISuccess.decodeAPISuccess(data)
}
