open EstimateDetailsRes
open Utils

let rideRideIdEstimateBreakupGetApiCall = async (rideId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/ride" ++ "/" ++ rideId ++ "/" ++ "estimateBreakup")
  EstimateDetailsRes.decodeEstimateDetailsRes(data)
}
