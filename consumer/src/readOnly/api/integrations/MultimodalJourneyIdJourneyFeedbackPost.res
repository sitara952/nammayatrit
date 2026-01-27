open APISuccess
open JourneyFeedBackForm
open Utils

let multimodalJourneyIdJourneyFeedbackPostApiCall = async (
  journeyId: string,
  body: journeyFeedBackForm,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "journeyFeedback",
    ~body=body->JourneyFeedBackForm.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
