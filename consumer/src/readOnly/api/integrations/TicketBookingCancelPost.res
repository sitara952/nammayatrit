open APISuccess
open TicketBookingCancelReq
open Utils

let ticketBookingCancelPostApiCall = async (body: ticketBookingCancelReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/ticket/booking/cancel",
    ~body=body->TicketBookingCancelReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
