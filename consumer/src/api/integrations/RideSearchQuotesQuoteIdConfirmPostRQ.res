open RideSearchQuotesQuoteIdConfirmPost

module Keys = {
  let all = ["rideSearchQuotesQuoteIdConfirmPost"]
}
let useRideSearchQuotesQuoteIdConfirmPost = (~paymentMethodId: option<string>) => {
  ReactQuery.useMutation({
    mutationKey: Keys.all,
    mutationFn: quoteId => rideSearchQuotesQuoteIdConfirmPostApiCall(quoteId, paymentMethodId),
  })
}
