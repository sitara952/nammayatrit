open APISuccess
open Utils

let paymentRideIdMethodPaymentMethodIdUpdatePostApiCall = async (
  rideId: string,
  paymentMethodId: string,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/payment" ++
    "/" ++
    rideId ++
    "/" ++
    "method" ++
    "/" ++
    paymentMethodId ++
    "/" ++ "update",
  )
  APISuccess.decodeAPISuccess(data)
}
