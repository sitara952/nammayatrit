open SelectListRes
open Utils

let estimateEstimateIdQuotesGetApiCall = async (estimateId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/estimate" ++ "/" ++ estimateId ++ "/" ++ "quotes")
  SelectListRes.decodeSelectListRes(data)
}
