open Enums
open BookingListResV2
open Utils

let rideBookingListV2GetApiCall = async (
  limit: option<int>,
  offset: option<int>,
  fromDate: option<int>,
  toDate: option<int>,
  rideStatus: option<array<RideBookingListV2RideStatus.rideBookingListV2RideStatus>>,
  journeyStatus: option<array<RideBookingListV2JourneyStatus.rideBookingListV2JourneyStatus>>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/rideBooking/listV2" ++
    ("?" ++
    Option.mapOr(limit, "", x => "&limit=" ++ x->Js.Int.toString) ++
    Option.mapOr(offset, "", x => "&offset=" ++ x->Js.Int.toString) ++
    Option.mapOr(fromDate, "", x => "&fromDate=" ++ x->Js.Int.toString) ++
    Option.mapOr(toDate, "", x => "&toDate=" ++ x->Js.Int.toString) ++
    Option.mapOr(rideStatus, "", x =>
      Array.map(x, x =>
        x->RideBookingListV2RideStatus.rideBookingListV2RideStatusToString
      )->Array.join("&rideStatus=")
    ) ++
    Option.mapOr(journeyStatus, "", x =>
      Array.map(x, x =>
        x->RideBookingListV2JourneyStatus.rideBookingListV2JourneyStatusToString
      )->Array.join("&journeyStatus=")
    )),
  )
  BookingListResV2.decodeBookingListResV2(data)
}
