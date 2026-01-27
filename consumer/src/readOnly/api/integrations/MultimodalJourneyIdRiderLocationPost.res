open JourneyStatusResp
open RiderLocationReq
open Utils

let multimodalJourneyIdRiderLocationPostApiCall = async (
  journeyId: string,
  body: riderLocationReq,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++ "/" ++ journeyId ++ "/" ++ "rider/location",
    ~body=body->RiderLocationReq.toJson,
  )
  JourneyStatusResp.decodeJourneyStatusResp(data)
}
