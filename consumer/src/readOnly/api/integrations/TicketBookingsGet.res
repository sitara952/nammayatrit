open Enums
open TicketBookingAPIEntityArray
open Utils

let ticketBookingsGetApiCall = async (
  limit: option<int>,
  offset: option<int>,
  status: TicketBookingsStatus.ticketBookingsStatus,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/ticket/bookings" ++
    ("?" ++
    Option.mapOr(limit, "", x => "&limit=" ++ x->Js.Int.toString) ++
    Option.mapOr(offset, "", x => "&offset=" ++ x->Js.Int.toString) ++
    "&status=" ++
    status->TicketBookingsStatus.ticketBookingsStatusToString),
  )
  TicketBookingAPIEntityArray.decodeTicketBookingAPIEntityArray(data)
}
