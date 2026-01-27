open BookingAPIEntity
open Utils

let rideBookingRideBookingIdPostApiCall = async (rideBookingId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/rideBooking" ++ "/" ++ rideBookingId ++ "/" ++ "")
  BookingAPIEntity.decodeBookingAPIEntity(data)
}
