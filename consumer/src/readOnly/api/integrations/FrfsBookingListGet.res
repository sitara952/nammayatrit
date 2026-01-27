open FRFSTicketBookingStatusAPIResArray
open Utils

let frfsBookingListGetApiCall = async () => {
  let data = await ApiCall.callGetAPI'(~url="/frfs/booking/list")
  FRFSTicketBookingStatusAPIResArray.decodeFRFSTicketBookingStatusAPIResArray(data)
}
