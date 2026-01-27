open QuotesResultResponse
open Utils

let estimateEstimateIdResultsGetApiCall = async (estimateId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/estimate" ++ "/" ++ estimateId ++ "/" ++ "results")
  QuotesResultResponse.decodeQuotesResultResponse(data)
}
