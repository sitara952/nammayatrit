open JourneyDetails
open Utils

let multimodalJourneyJourneyIdDetailsPostApiCall = async (journeyId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal/journey" ++ "/" ++ journeyId ++ "/" ++ "details",
  )
  JourneyDetails.decodeJourneyDetails(data)
}
