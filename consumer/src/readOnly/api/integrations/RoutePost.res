open GetRoutesReq
open RouteInfoArray
open Utils

let routePostApiCall = async (body: getRoutesReq) => {
  let data = await ApiCall.callPostAPI'(~url="/route", ~body=body->GetRoutesReq.toJson)
  RouteInfoArray.decodeRouteInfoArray(data)
}
