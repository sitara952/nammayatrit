open HotSpotResponse
open LatLong
open Utils

let getHotSpotGetApiCall = async (body: latLong) => {
  let data = await ApiCall.callGetAPI'(~url="/getHotSpot", ~body=body->LatLong.toJson)
  HotSpotResponse.decodeHotSpotResponse(data)
}
