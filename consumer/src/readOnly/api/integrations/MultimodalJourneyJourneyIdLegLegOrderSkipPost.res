open APISuccess
open Utils

let multimodalJourneyJourneyIdLegLegOrderSkipPostApiCall = async (
  journeyId: string,
  legOrder: string,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal/journey" ++
    "/" ++
    journeyId ++
    "/" ++
    "leg" ++
    "/" ++
    legOrder ++
    "/" ++ "skip",
  )
  APISuccess.decodeAPISuccess(data)
}
