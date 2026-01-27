open APISuccess
open TicketServiceCancelReq
open Utils

let ticketServiceCancelPostApiCall = async (body: ticketServiceCancelReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/ticket/service/cancel",
    ~body=body->TicketServiceCancelReq.toJson,
  )
  APISuccess.decodeAPISuccess(data)
}
