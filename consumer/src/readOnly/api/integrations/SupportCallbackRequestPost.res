open APISuccess
open Utils

let supportCallbackRequestPostApiCall = async () => {
  let data = await ApiCall.callPostAPI'(~url="/support/callbackRequest")
  APISuccess.decodeAPISuccess(data)
}
