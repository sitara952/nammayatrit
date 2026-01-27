open Enums
open Utils

let ticketBookingsTicketBookingShortIdStatusGetApiCall = async (ticketBookingShortId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/ticket/bookings" ++ "/" ++ ticketBookingShortId ++ "/" ++ "status",
  )
  TicketBookingStatus.decodeTicketBookingStatus(data)
}
