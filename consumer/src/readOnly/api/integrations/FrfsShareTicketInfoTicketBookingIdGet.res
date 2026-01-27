open ShareTicketInfoResp
open Utils

let frfsShareTicketInfoTicketBookingIdGetApiCall = async (ticketBookingId: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/shareTicketInfo" ++ "/" ++ ticketBookingId ++ "/" ++ "",
  )
  ShareTicketInfoResp.decodeShareTicketInfoResp(data)
}
