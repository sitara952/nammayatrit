open ConfirmRes
open Utils

let rideSearchQuotesQuoteIdConfirmPostApiCall = async (
  quoteId: string,
  paymentMethodId: option<string>,
) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/rideSearch/quotes" ++
    "/" ++
    quoteId ++
    "/" ++
    "confirm" ++
    ("?" ++
    Option.mapOr(paymentMethodId, "", x => "&paymentMethodId=" ++ x)),
  )
  ConfirmRes.decodeConfirmRes(data)
}
