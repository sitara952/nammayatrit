open Utils

let rideRideIdDeliveryImageGetApiCall = async (rideId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/ride" ++ "/" ++ rideId ++ "/" ++ "deliveryImage")
  String.decodeString(data)
}
