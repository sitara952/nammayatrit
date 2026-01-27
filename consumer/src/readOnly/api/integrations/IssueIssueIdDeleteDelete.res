open APISuccess
open Utils

let issueIssueIdDeleteDeleteApiCall = async (issueId: string) => {
  let data = await ApiCall.callDeleteAPI'(~url="/issue" ++ "/" ++ issueId ++ "/" ++ "delete")
  APISuccess.decodeAPISuccess(data)
}
