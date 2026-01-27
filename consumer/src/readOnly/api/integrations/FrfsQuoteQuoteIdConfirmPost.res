open FRFSTicketBookingStatusAPIRes
open Utils

let frfsQuoteQuoteIdConfirmPostApiCall = async (quoteId: string) => {
  let data = await ApiCall.callPostAPI'(~url="/frfs/quote" ++ "/" ++ quoteId ++ "/" ++ "confirm")
  FRFSTicketBookingStatusAPIRes.decodeFRFSTicketBookingStatusAPIRes(data)
}
