open GetPickupRoutesReq
open RouteInfoArray
open Utils

let pickupRoutePostApiCall = async (body: getPickupRoutesReq) => {
  let data = await ApiCall.callPostAPI'(~url="/pickup/route", ~body=body->GetPickupRoutesReq.toJson)
  RouteInfoArray.decodeRouteInfoArray(data)
}
