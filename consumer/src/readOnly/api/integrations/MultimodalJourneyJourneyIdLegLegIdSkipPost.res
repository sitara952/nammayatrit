open APISuccess
open Utils

let multimodalJourneyJourneyIdLegLegIdSkipPostApiCall = async (
  journeyId: string,
  legId: string,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal/journey" ++ "/" ++ journeyId ++ "/" ++ "leg" ++ "/" ++ legId ++ "/" ++ "skip",
  )
  APISuccess.decodeAPISuccess(data)
}
