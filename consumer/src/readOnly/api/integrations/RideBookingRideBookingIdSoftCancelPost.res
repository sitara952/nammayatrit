open APISuccess
open Utils

let rideBookingRideBookingIdSoftCancelPostApiCall = async (rideBookingId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/rideBooking" ++ "/" ++ rideBookingId ++ "/" ++ "softCancel",
  )
  APISuccess.decodeAPISuccess(data)
}
