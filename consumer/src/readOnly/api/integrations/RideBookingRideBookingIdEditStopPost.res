open APISuccess
open StopReq
open Utils

let rideBookingRideBookingIdEditStopPostApiCall = async (rideBookingId: string, body: stopReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/rideBooking" ++ "/" ++ rideBookingId ++ "/" ++ "editStop",
    ~body=body->StopReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
