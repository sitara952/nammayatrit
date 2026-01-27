open CancellationDuesDetailsRes
open Utils

let rideBookingCancellationDuesGetApiCall = async (rideBookingId: option<string>) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/rideBooking/cancellationDues" ++
    ("?" ++
    Option.mapOr(rideBookingId, "", x => "&rideBookingId=" ++ x)),
  )
  CancellationDuesDetailsRes.decodeCancellationDuesDetailsRes(data)
}
