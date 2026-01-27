open GetRideStatusResp
open Utils

let rideRideIdStatusGetApiCall = async (rideId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/ride" ++ "/" ++ rideId ++ "/" ++ "status")
  GetRideStatusResp.decodeGetRideStatusResp(data)
}
