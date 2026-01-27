open GetDriverLocResp
open Utils

let rideRideIdDriverLocationPostApiCall = async (rideId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/ride" ++ "/" ++ rideId ++ "/" ++ "driver/location")
  GetDriverLocResp.decodeGetDriverLocResp(data)
}
