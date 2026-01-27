open Utils

let getApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="")
  String.decodeString(data)
}
