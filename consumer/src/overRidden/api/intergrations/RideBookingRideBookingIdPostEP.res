open BookingAPIEntity
open ReactQuery

module Keys = {
  let all = ["rideBookingRideBookingIdPost"]
}

let rideBookingRideBookingIdPostApiCall = async (rideBookingId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/rideBooking" ++ "/" ++ rideBookingId ++ "/" ++ "")
  BookingAPIEntity.decodeBookingAPIEntity(data)
}
