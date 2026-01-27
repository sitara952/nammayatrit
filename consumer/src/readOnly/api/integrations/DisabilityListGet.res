open DisabilityArray
open Utils

let disabilityListGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/disability/list")
  DisabilityArray.decodeDisabilityArray(data)
}
