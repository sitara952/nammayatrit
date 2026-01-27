open APISuccess
open ExtendLegReq
open Utils

let multimodalExtendJourneyIdLegPostApiCall = async (journeyId: string, body: extendLegReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal/extend" ++ "/" ++ journeyId ++ "/" ++ "leg",
    ~body=body->ExtendLegReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
