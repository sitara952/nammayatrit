open APISuccess
open SwitchLegReq
open Utils

let multimodalJourneyIdSwitchPostApiCall = async (journeyId: string, body: switchLegReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "switch",
    ~body=body->SwitchLegReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
