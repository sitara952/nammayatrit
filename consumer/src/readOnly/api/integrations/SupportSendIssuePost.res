open APISuccess
open SendIssueReq
open Utils

let supportSendIssuePostApiCall = async (body: sendIssueReq) => {
  let data = await ApiCall.callPostAPI'(~url="/support/sendIssue", ~body=body->SendIssueReq.toJson)
  APISuccess.decodeAPISuccess(data)
}
