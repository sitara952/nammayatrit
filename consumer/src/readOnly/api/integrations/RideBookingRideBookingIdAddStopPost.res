open APISuccess
open StopReq
open Utils

let rideBookingRideBookingIdAddStopPostApiCall = async (rideBookingId: string, body: stopReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/rideBooking" ++ "/" ++ rideBookingId ++ "/" ++ "addStop",
    ~body=body->StopReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
