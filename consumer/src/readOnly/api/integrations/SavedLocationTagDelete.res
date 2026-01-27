open APISuccess
open Utils

let savedLocationTagDeleteApiCall = async (tag: string) => {
  let data = await ApiCall.callDeleteAPI'(~url="/savedLocation" ++ "/" ++ tag ++ "/" ++ "")
  APISuccess.decodeAPISuccess(data)
}
