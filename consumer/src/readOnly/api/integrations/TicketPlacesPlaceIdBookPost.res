open CreateOrderResp
open TicketBookingReq
open Utils

let ticketPlacesPlaceIdBookPostApiCall = async (placeId: string, body: ticketBookingReq) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/ticket/places" ++ "/" ++ placeId ++ "/" ++ "book",
    ~body=body->TicketBookingReq.toJson,
  )
  CreateOrderResp.decodeCreateOrderResp(data)
}
