open ReactQuery
open RideSearchSearchIdResultsGet

module Keys = {
  let all = "rideSearchSearchIdResultsGet"
}

let refetchIntervalCondition = (data: option<result<GetQuotesRes.getQuotesRes, exn>>) => {
  switch data {
  | Some(Ok(res)) => res.quotes->Array.length == 0 && res.estimates->Array.length == 0
  | Some(Error(err)) => {
      Console.log2("API ERRROR", err)
      true
    }
  | None => {
      Console.log("Not able to fetch data")
      true
    }
  }
}
