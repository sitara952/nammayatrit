open PaymentMethodsResponse
open Utils

let paymentMethodsGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/payment/methods")
  PaymentMethodsResponse.decodePaymentMethodsResponse(data)
}
