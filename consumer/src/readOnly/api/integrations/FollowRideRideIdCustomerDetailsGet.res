open FollowRideCustomerDetailsRes
open Utils

let followRideRideIdCustomerDetailsGetApiCall = async (rideId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/followRide" ++ "/" ++ rideId ++ "/" ++ "customerDetails",
  )
  FollowRideCustomerDetailsRes.decodeFollowRideCustomerDetailsRes(data)
}
