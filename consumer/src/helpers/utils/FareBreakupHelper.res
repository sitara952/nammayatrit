open LocaleStringType
type fareBreakupType =
  BASE_DISTANCE_FARE | WAITING_CHARGE_RATE_PER_MIN | PER_MINUTE_FARE | OTHER_CHARGES

let getFareBreakupFromString = (fareBreakup: string) => {
  switch fareBreakup {
  | "BASE_DISTANCE_FARE" => PER_MILE_FARE
  | "PER_MINUTE_FARE" => PER_MINUTE_FARE
  | "WAITING_CHARGE_RATE_PER_MIN" => WAITING_CHARGES("")
  | "OTHER_CHARGES" => OTHER_CHARGES
  | _ => CUSTOM_TEXT({text: "-"})
  }
}
let getFareBreakupFromType = (fareBreakupType: fareBreakupType) => {
  switch fareBreakupType {
  | BASE_DISTANCE_FARE => PER_MILE_FARE
  | PER_MINUTE_FARE => PER_MINUTE_FARE
  | WAITING_CHARGE_RATE_PER_MIN => WAITING_CHARGES("")
  | OTHER_CHARGES => OTHER_CHARGES
  }
}

let isDesiredFareBreakup = (fareBreakup: string): bool => {
  switch fareBreakup {
  | "BASE_DISTANCE_FARE"
  | "WAITING_CHARGE_RATE_PER_MIN" => true
  | _ => false
  }
}

@genType
type amount = {
  currency: string,
  amount: float,
  end: localeString,
}

@genType
type estimateFareBreakupItem = {
  key: LocaleStringType.localeString,
  value: amount,
}

type estimateType = {estimateFareBreakup: option<array<SearchResults.estimateFares>>}

let constructFareBreakup = (estimate: SearchResults.estimateAPIEntity, getCurrency: string): array<
  estimateFareBreakupItem,
> => {
  let fareBreakup: array<SearchResults.estimateFares> = switch estimate.estimateFareBreakup {
  | Some(data) => data
  | None => []
  }

  let fetchSpecificFare = (fareBreakup: array<SearchResults.estimateFares>, key: string): option<
    SearchResults.estimateFares,
  > => Belt.Array.getBy(fareBreakup, fare => fare.title === key)

  let calculatePerMileFare = (
    fareBreakup: array<SearchResults.estimateFares>,
    key: string,
    baseFare: float,
  ): float => {
    switch fetchSpecificFare(fareBreakup, key) {
    | Some(fareData) =>
      let baseDistanceInMeters = fareData.priceWithCurrency.amount->Option.getOr(0.0)

      let baseDistanceInMiles = baseDistanceInMeters /. 1609.34

      if baseDistanceInMiles == 0.0 {
        0.0
      } else {
        // Avoid division by zero
        baseFare /. baseDistanceInMiles // Calculate per-mile fare
      }
    | None => 0.0 // Return 0.0 if the key is not found
    }
  }

  let getAmount = (key: string, end: localeString): amount => {
    let specificFare = switch fetchSpecificFare(fareBreakup, key) {
    | Some(fareData) =>
      switch fareData.priceWithCurrency.amount {
      | Some(data) => data
      | None => 0.0
      }
    | None => 0.0
    }

    if key == "BASE_DISTANCE_FARE" {
      let perMileFare = calculatePerMileFare(fareBreakup, "BASE_DISTANCE", specificFare)
      {currency: getCurrency, amount: perMileFare, end}
    } else {
      {currency: getCurrency, amount: specificFare, end}
    }
  }

  Array.concat(
    [
      {
        key: getFareBreakupFromString("BASE_DISTANCE_FARE"),
        value: getAmount("BASE_DISTANCE_FARE", PER_MILE),
      },
      {
        key: getFareBreakupFromString("PER_MINUTE_FARE"),
        value: getAmount("PER_MINUTE_FARE", PER_MIN),
      },
      {
        key: getFareBreakupFromString("WAITING_CHARGE_RATE_PER_MIN"),
        value: getAmount("WAITING_CHARGE_RATE_PER_MIN", PER_MIN),
      },
    ],
    [
      {
        key: getFareBreakupFromString("OTHER_CHARGES"),
        value: {
          currency: getCurrency,
          amount: 0.0,
          end: CUSTOM_TEXT({text: ""}),
        },
      },
    ],
  )
}
