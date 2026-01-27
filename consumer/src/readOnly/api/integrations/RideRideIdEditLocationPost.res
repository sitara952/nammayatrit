open EditLocationReq
open EditLocationResp
open Utils

let rideRideIdEditLocationPostApiCall = async (rideId: string, body: editLocationReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/ride" ++ "/" ++ rideId ++ "/" ++ "edit/location",
    ~body=body->EditLocationReq.toJson,
  )
  EditLocationResp.decodeEditLocationResp(data)
}
