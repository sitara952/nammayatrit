open DriverProfileResponse
open Utils

let knowYourFavDriverDriverIdGetApiCall = async (driverId: string, isImages: option<bool>) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/knowYourFavDriver" ++
    "/" ++
    driverId ++
    "/" ++
    "" ++
    ("?" ++
    Option.mapOr(isImages, "", x => "&isImages=" ++ x->boolToString)),
  )
  DriverProfileResponse.decodeDriverProfileResponse(data)
}
