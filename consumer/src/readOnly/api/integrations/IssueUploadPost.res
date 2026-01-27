open IssueMediaUploadRes
open Utils

let issueUploadPostApiCall = async () => {
  let data = await ApiCall.callPostAPI'(~url="/issue/upload")
  IssueMediaUploadRes.decodeIssueMediaUploadRes(data)
}
