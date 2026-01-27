open ExtendLegGetFareReq
open ExtendLegGetFareResp
open Utils

let multimodalExtendJourneyIdLegGetfarePostApiCall = async (
  journeyId: string,
  body: extendLegGetFareReq,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal/extend" ++ "/" ++ journeyId ++ "/" ++ "leg/getfare",
    ~body=body->ExtendLegGetFareReq.toJson,
  )
  ExtendLegGetFareResp.decodeExtendLegGetFareResp(data)
}
