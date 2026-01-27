open GetPlaceDetailsReq
open GetPlaceDetailsResp
open Utils

let mapsGetPlaceDetailsPostApiCall = async (body: getPlaceDetailsReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/maps/getPlaceDetails",
    ~body=body->GetPlaceDetailsReq.toJson,
  )
  GetPlaceDetailsResp.decodeGetPlaceDetailsResp(data)
}
