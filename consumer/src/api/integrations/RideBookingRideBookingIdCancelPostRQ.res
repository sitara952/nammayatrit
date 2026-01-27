open APISuccess
open CancelReq
open ReactQuery
open RideBookingRideBookingIdCancelPost

module Keys = {
  let all = ["rideBookingRideBookingIdCancelPost"]
}
let useRideBookingRideBookingIdCancelPost = (rideBookingId: string, body: cancelReq) => {
  useMutation({
    mutationKey: Keys.all,
    mutationFn: () =>
      rideBookingRideBookingIdCancelPostApiCall((rideBookingId: string), (body: cancelReq)),
  })
}
