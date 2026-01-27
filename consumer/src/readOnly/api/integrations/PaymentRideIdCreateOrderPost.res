open CreateOrderResp
open Utils

let paymentRideIdCreateOrderPostApiCall = async (rideId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/payment" ++ "/" ++ rideId ++ "/" ++ "createOrder")
  CreateOrderResp.decodeCreateOrderResp(data)
}
