open PaymentIntentResponse
open Utils

let paymentIntentPaymentGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/payment/intent/payment")
  PaymentIntentResponse.decodePaymentIntentResponse(data)
}
