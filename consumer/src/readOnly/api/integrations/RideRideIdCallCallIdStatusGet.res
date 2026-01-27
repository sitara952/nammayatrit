open CallStatusAPIEntity
open Utils

let rideRideIdCallCallIdStatusGetApiCall = async (rideId: string, callId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/ride" ++ "/" ++ rideId ++ "/" ++ "call" ++ "/" ++ callId ++ "/" ++ "status",
  )
  CallStatusAPIEntity.decodeCallStatusAPIEntity(data)
}
