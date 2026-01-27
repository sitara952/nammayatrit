open QuoteBreakupRes
open Utils

let priceBreakupGetApiCall = async (bookingId: string) => {
  let data = await ApiCall.callGetAPI'(~url="/priceBreakup" ++ ("?" ++ "&bookingId=" ++ bookingId))
  QuoteBreakupRes.decodeQuoteBreakupRes(data)
}
