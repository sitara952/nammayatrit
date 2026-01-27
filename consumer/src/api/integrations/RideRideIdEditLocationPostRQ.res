open EditLocationReq
open EditLocationResp
open ReactQuery
open RideRideIdEditLocationPost

module Keys = {
  let all = ["rideRideIdEditLocationPost"]
}
let useRideRideIdEditLocationPost = (~mutationKey, rideId: string) => {
  useMutation({
    mutationKey,
    mutationFn: (body: editLocationReq) =>
      rideRideIdEditLocationPostApiCall((rideId: string), (body: editLocationReq)),
  })
}
