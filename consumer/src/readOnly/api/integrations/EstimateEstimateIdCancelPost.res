open CancelAPIResponse
open Utils

let estimateEstimateIdCancelPostApiCall = async (estimateId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/estimate" ++ "/" ++ estimateId ++ "/" ++ "cancel")
  CancelAPIResponse.decodeCancelAPIResponse(data)
}
