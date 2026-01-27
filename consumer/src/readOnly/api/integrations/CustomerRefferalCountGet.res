open ReferredCustomers
open Utils

let customerRefferalCountGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/CustomerRefferal/count")
  ReferredCustomers.decodeReferredCustomers(data)
}
