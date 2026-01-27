open DSelectReq
open ReactQuery
open EstimateEstimateIdSelect2Post
open Enums

type mutateParams = {estimateId: string}

module Keys = {
  let all = ["estimateEstimateIdSelect2Post"]
}

let mkSearchReq = (~autoAssignEnabled) => {
  let selectReq: DSelectReq.dSelectReq = {
    autoAssignEnabled,
    autoAssignEnabledV2: Some(true),
    billingCategory: Some(BillingCategory.PERSONAL),
    customerExtraFee: None,
    customerExtraFeeWithCurrency: None,
    deliveryDetails: None,
    isAdvancedBookingEnabled: None,
    otherSelectedEstimates: None,
    paymentMethodId: Some(""),
    isPetRide: Some(false),
  }
  selectReq
}

let useEstimateEstimateIdSelect2Post = () => {
  let selectReq = mkSearchReq(~autoAssignEnabled=true)
  useMutation({
    mutationKey: Keys.all,
    mutationFn: ({estimateId}: mutateParams) =>
      estimateEstimateIdSelect2PostApiCall(estimateId, selectReq),
  })
}
