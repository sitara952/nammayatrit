open PaymentStatusResp
open Utils

let paymentOrderIdStatusGetApiCall = async (orderId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/payment" ++ "/" ++ orderId ++ "/" ++ "status")
  PaymentStatusResp.decodePaymentStatusResp(data)
}
