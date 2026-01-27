open JourneyInfoReq
open JourneyInfoResp
open Utils

let multimodalJourneyIdInfoPostApiCall = async (journeyId: string, body: journeyInfoReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "info",
    ~body=body->JourneyInfoReq.toJson,
  )
  JourneyInfoResp.decodeJourneyInfoResp(data)
}
