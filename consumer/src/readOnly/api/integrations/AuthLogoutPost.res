open APISuccess
open Utils

let authLogoutPostApiCall = async () => {
  let data = await ApiCall.callPostAPI'(~url="/auth/logout")
  APISuccess.decodeAPISuccess(data)
}
