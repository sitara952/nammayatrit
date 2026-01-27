open Enums
open BookingListRes
open Utils

let rideBookingListGetApiCall = async (
  limit: option<int>,
  offset: option<int>,
  onlyActive: option<bool>,
  status: option<RideBookingListStatus.rideBookingListStatus>,
  clientId: option<string>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/rideBooking/list" ++
    ("?" ++
    Option.mapOr(limit, "", x => "&limit=" ++ x->Js.Int.toString) ++
    Option.mapOr(offset, "", x => "&offset=" ++ x->Js.Int.toString) ++
    Option.mapOr(onlyActive, "", x => "&onlyActive=" ++ x->boolToString) ++
    Option.mapOr(status, "", x =>
      "&status=" ++ x->RideBookingListStatus.rideBookingListStatusToString
    ) ++
    Option.mapOr(clientId, "", x => "&clientId=" ++ x)),
  )
  BookingListRes.decodeBookingListRes(data)
}
