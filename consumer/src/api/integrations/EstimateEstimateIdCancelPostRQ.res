open Enums
open ReactQuery
open EstimateEstimateIdCancelPost

module Keys = {
  let all = ["estimateEstimateIdCancelPost"]
}
let useEstimateEstimateIdCancelPost = (estimateId: string) => {
  useMutation({
    mutationKey: Keys.all,
    mutationFn: () => estimateEstimateIdCancelPostApiCall((estimateId: string)),
  })
}
