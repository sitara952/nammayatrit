open ReactQuery
open RideBookingRideBookingIdPost

@genType
type mutateParams = {rideBookingId: string}

module Keys = {
  let all = ["rideBookingRideBookingIdPost"]
}
let useRideBookingRideBookingIdPost = () => {
  useMutation({
    mutationKey: Keys.all,
    mutationFn: ({rideBookingId}: mutateParams) =>
      rideBookingRideBookingIdPostApiCall(rideBookingId),
  })
}
