open APISuccess
open Utils

let multimodalSearchRequestIdSwitchVariantEstimateIdPostApiCall = async (
  searchRequestId: string,
  estimateId: string,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++
    "/" ++
    searchRequestId ++
    "/" ++
    "switchVariant" ++
    "/" ++
    estimateId ++
    "/" ++ "",
  )
  APISuccess.decodeAPISuccess(data)
}
