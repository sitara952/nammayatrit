open APISuccess
open IssueUpdateReq
open Utils

let issueIssueIdOptionPutApiCall = async (issueId: string, body: issueUpdateReq) => {
  let data = await ApiCall.callPutAPI'(
    ~url="/issue" ++ "/" ++ issueId ++ "/" ++ "option",
    ~body=body->IssueUpdateReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
