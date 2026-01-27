open FRFSTicketBookingStatusAPIRes
open Utils

let frfsBookingBookingIdStatusGetApiCall = async (bookingId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/frfs/booking" ++ "/" ++ bookingId ++ "/" ++ "status")
  FRFSTicketBookingStatusAPIRes.decodeFRFSTicketBookingStatusAPIRes(data)
}
