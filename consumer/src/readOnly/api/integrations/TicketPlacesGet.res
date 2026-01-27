open TicketPlaceArray
open Utils

let ticketPlacesGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/ticket/places")
  TicketPlaceArray.decodeTicketPlaceArray(data)
}
