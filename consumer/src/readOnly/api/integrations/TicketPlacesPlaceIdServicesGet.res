open TicketServiceRespArray
open Utils

let ticketPlacesPlaceIdServicesGetApiCall = async (placeId: string, date: option<string>) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/ticket/places" ++
    "/" ++
    placeId ++
    "/" ++
    "services" ++
    ("?" ++
    Option.mapOr(date, "", x => "&date=" ++ x)),
  )
  TicketServiceRespArray.decodeTicketServiceRespArray(data)
}
