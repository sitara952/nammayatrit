open APISuccess
open CancelReq
open Utils

let rideBookingRideBookingIdCancelPostApiCall = async (rideBookingId: string, body: cancelReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/rideBooking" ++ "/" ++ rideBookingId ++ "/" ++ "cancel",
    ~body=body->CancelReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
