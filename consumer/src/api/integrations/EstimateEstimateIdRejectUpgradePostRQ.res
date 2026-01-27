open Enums
open ReactQuery
open EstimateEstimateIdRejectUpgradePost

module Keys = {
  let all = ["estimateEstimateIdRejectUpgradePost"]
}
let useEstimateEstimateIdRejectUpgradePost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (estimateId: string) =>
      estimateEstimateIdRejectUpgradePostApiCall((estimateId: string)),
  })
}
