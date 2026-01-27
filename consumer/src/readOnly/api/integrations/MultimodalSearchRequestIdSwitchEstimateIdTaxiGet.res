open APISuccess
open Utils

let multimodalSearchRequestIdSwitchEstimateIdTaxiGetApiCall = async (
  searchRequestId: string,
  estimateId: string,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/multimodal" ++
    "/" ++
    searchRequestId ++
    "/" ++
    "switch" ++
    "/" ++
    estimateId ++
    "/" ++ "taxi",
  )
  APISuccess.decodeAPISuccess(data)
}
