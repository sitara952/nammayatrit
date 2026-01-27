open JourneyStatusResp
open Utils

let multimodalJourneyJourneyIdStatusGetApiCall = async (journeyId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/multimodal/journey" ++ "/" ++ journeyId ++ "/" ++ "status",
  )
  JourneyStatusResp.decodeJourneyStatusResp(data)
}
