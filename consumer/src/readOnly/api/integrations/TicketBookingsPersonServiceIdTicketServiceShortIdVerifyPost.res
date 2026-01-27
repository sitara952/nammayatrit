open TicketServiceVerificationResp
open Utils

let ticketBookingsPersonServiceIdTicketServiceShortIdVerifyPostApiCall = async (
  personServiceId: string,
  ticketServiceShortId: string,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/ticket/bookings" ++
    "/" ++
    personServiceId ++
    "/" ++
    "" ++
    "/" ++
    ticketServiceShortId ++
    "/" ++ "verify",
  )
  TicketServiceVerificationResp.decodeTicketServiceVerificationResp(data)
}
