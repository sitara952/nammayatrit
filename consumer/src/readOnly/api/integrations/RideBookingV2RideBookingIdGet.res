open BookingStatusAPIEntity
open Utils

let rideBookingV2RideBookingIdGetApiCall = async (rideBookingId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/rideBooking/v2" ++ "/" ++ rideBookingId ++ "/" ++ "")
  BookingStatusAPIEntity.decodeBookingStatusAPIEntity(data)
}
