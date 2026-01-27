open APISuccess
open TicketBookingUpdateSeatsReq
open Utils

let ticketBookingsUpdateSeatsPostApiCall = async (body: ticketBookingUpdateSeatsReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/ticket/bookings/update/seats",
    ~body=body->TicketBookingUpdateSeatsReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
