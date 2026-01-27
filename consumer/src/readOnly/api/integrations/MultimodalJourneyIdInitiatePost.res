open JourneyInfoResp
open Utils

let multimodalJourneyIdInitiatePostApiCall = async (journeyId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "initiate")
  JourneyInfoResp.decodeJourneyInfoResp(data)
}
