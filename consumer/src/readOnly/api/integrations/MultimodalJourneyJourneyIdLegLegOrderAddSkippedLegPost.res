open APISuccess
open Utils

let multimodalJourneyJourneyIdLegLegOrderAddSkippedLegPostApiCall = async (
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
    "/" ++ "addSkippedLeg",
  )
  APISuccess.decodeAPISuccess(data)
}
