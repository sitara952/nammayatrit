open FRFSTicketBookingStatusAPIRes
open Utils

let frfsQuoteQuoteIdPaymentRetryPostApiCall = async (quoteId: string) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/frfs/quote" ++ "/" ++ quoteId ++ "/" ++ "payment/retry",
  )
  FRFSTicketBookingStatusAPIRes.decodeFRFSTicketBookingStatusAPIRes(data)
}
