open JourneyFeedBackForm
open Utils

let multimodalJourneyIdFeedbackGetApiCall = async (journeyId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "feedback")
  JourneyFeedBackForm.decodeJourneyFeedBackForm(data)
}
