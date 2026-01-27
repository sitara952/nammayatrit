open GetRoutesReq
open RouteInfoArray
open Utils

let tripRoutePostApiCall = async (body: getRoutesReq) => {
  let data = await ApiCall.callPostAPI'(~url="/trip/route", ~body=body->GetRoutesReq.toJson)
  RouteInfoArray.decodeRouteInfoArray(data)
}
