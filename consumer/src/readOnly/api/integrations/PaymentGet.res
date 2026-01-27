open PaymentOrderAPIEntity
open Utils

let paymentGetApiCall = async (orderId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/payment" ++ ("?" ++ "&orderId=" ++ orderId))
  PaymentOrderAPIEntity.decodePaymentOrderAPIEntity(data)
}
