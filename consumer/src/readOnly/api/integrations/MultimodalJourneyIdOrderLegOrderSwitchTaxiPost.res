open JourneyInfoResp
open SwitchTaxiReq
open Utils

let multimodalJourneyIdOrderLegOrderSwitchTaxiPostApiCall = async (
  journeyId: string,
  legOrder: string,
  body: switchTaxiReq,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++
    "/" ++
    journeyId ++
    "/" ++
    "order" ++
    "/" ++
    legOrder ++
    "/" ++ "switchTaxi",
    ~body=body->SwitchTaxiReq.toJson,
  )
  JourneyInfoResp.decodeJourneyInfoResp(data)
}
