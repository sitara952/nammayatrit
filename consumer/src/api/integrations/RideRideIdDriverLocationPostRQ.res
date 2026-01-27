open GetDriverLocResp
open ReactQuery
open RideRideIdDriverLocationPost

module Keys = {
  let all = ["rideRideIdDriverLocationPost"]
}
let useRideRideIdDriverLocationPost = (~mutationKey, ~rideId: string) => {
  useMutation({
    mutationKey,
    mutationFn: _ => rideRideIdDriverLocationPostApiCall((rideId: string)),
  })
}
