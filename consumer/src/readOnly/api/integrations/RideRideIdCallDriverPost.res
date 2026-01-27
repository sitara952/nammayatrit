open CallRes
open Utils

let rideRideIdCallDriverPostApiCall = async (rideId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/ride" ++ "/" ++ rideId ++ "/" ++ "call/driver")
  CallRes.decodeCallRes(data)
}
