open CancelAPIResponse
open Utils

let estimateEstimateIdRejectUpgradePostApiCall = async (estimateId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/estimate" ++ "/" ++ estimateId ++ "/" ++ "rejectUpgrade",
  )
  CancelAPIResponse.decodeCancelAPIResponse(data)
}
