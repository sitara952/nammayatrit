open APISuccess
open Utils

let issueIgmStatusPostApiCall = async () => {
  let data = await ApiCall.callPostAPI'(~url="/issue/igmStatus")
  APISuccess.decodeAPISuccess(data)
}
