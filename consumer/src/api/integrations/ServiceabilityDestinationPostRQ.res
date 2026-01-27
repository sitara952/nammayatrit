open ServiceabilityReq
open ServiceabilityRes
open ReactQuery
open ServiceabilityDestinationPost

module Keys = {
  let all = ["serviceabilityDestinationPost"]
}
let useServiceabilityDestinationPost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: serviceabilityReq) =>
      serviceabilityDestinationPostApiCall((body: serviceabilityReq)),
  })
}
