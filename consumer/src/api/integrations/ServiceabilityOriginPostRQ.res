open ServiceabilityReq
open ServiceabilityRes
open ReactQuery
open ServiceabilityOriginPost

module Keys = {
  let all = ["serviceabilityOriginPost"]
}
let useServiceabilityOriginPost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: serviceabilityReq) =>
      serviceabilityOriginPostApiCall((body: serviceabilityReq)),
  })
}
