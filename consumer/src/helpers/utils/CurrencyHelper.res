@genType
type currencytype = INR | USD | EUR

let getCurrencyFromString = (currency: string) => {
  switch currency {
  | "INR" => "₹"
  | "USD" => "$"
  | "EUR" => "€"
  | _ => ""
  }
}
let getCurrencyFromType = (currenyType: currencytype): string => {
  switch currenyType {
  | INR => "₹"
  | USD => "$"
  | EUR => "€"
  }
}

let getCurrency = (estimate: SearchResults.estimateAPIEntity): string =>
  getCurrencyFromString(
    switch estimate.estimatedFareWithCurrency {
    | Some(fare) => fare.currency
    | None => ""
    },
  )
