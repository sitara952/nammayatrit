open TicketBookingDetails
open Utils

let ticketBookingsTicketBookingShortIdDetailsGetApiCall = async (ticketBookingShortId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/ticket/bookings" ++ "/" ++ ticketBookingShortId ++ "/" ++ "details",
  )
  TicketBookingDetails.decodeTicketBookingDetails(data)
}
