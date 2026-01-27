open SearchReq
open SearchResp
open Utils

let rideSearchPostApiCall = async (
  clientId: option<string>,
  isDashboardRequest: option<bool>,
  body: searchReq,
) => {
  let data = await ApiCall.callPostAPI'(~url="/rideSearch", ~body=body->SearchReq.toJson)
  SearchResp.decodeSearchResp(data)
}
