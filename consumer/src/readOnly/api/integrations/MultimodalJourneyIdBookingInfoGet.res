open JourneyInfoResp
open Utils

let multimodalJourneyIdBookingInfoGetApiCall = async (journeyId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "booking/info",
  )
  JourneyInfoResp.decodeJourneyInfoResp(data)
}
