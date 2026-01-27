open APISuccess
open Utils

let multimodalJourneyJourneyIdCancelPostApiCall = async (journeyId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal/journey" ++ "/" ++ journeyId ++ "/" ++ "cancel",
  )
  APISuccess.decodeAPISuccess(data)
}
