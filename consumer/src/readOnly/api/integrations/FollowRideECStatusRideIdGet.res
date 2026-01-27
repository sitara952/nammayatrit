open EmergencyContactsStatusRes
open Utils

let followRideECStatusRideIdGetApiCall = async (rideId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/followRide/ECStatus" ++ "/" ++ rideId ++ "/" ++ "")
  EmergencyContactsStatusRes.decodeEmergencyContactsStatusRes(data)
}
