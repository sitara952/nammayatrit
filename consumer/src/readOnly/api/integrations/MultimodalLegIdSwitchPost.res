open APISuccess
open SwitchLegReq
open Utils

let multimodalLegIdSwitchPostApiCall = async (legId: string, body: switchLegReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/multimodal" ++ "/" ++ legId ++ "/" ++ "switch",
    ~body=body->SwitchLegReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
