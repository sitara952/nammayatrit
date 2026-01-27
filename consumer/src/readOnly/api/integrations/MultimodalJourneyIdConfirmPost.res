open APISuccess
open JourneyConfirmReq
open Utils

let multimodalJourneyIdConfirmPostApiCall = async (
  journeyId: string,
  forceBookLegOrder: option<int>,
  body: journeyConfirmReq,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++
    "/" ++
    journeyId ++
    "/" ++
    "confirm" ++
    ("?" ++
    Option.mapOr(forceBookLegOrder, "", x => "&forceBookLegOrder=" ++ x->Js.Int.toString)),
    ~body=body->JourneyConfirmReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
