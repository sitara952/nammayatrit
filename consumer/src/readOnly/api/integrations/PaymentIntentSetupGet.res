open SetupIntentResponse
open Utils

let paymentIntentSetupGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/payment/intent/setup")
  SetupIntentResponse.decodeSetupIntentResponse(data)
}
