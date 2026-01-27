open DriverProfileResponse
open Utils

let knowYourDriverRideIdGetApiCall = async (rideId: string, isImages: option<bool>) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/knowYourDriver" ++
    "/" ++
    rideId ++
    "/" ++
    "" ++
    ("?" ++
    Option.mapOr(isImages, "", x => "&isImages=" ++ x->boolToString)),
  )
  DriverProfileResponse.decodeDriverProfileResponse(data)
}
