open SosDetailsRes
open Utils

let sosGetDetailsRideIdGetApiCall = async (rideId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/sos/getDetails" ++ "/" ++ rideId ++ "/" ++ "")
  SosDetailsRes.decodeSosDetailsRes(data)
}
