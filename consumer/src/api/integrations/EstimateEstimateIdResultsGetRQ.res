open ReactQuery
open EstimateEstimateIdResultsGet

module Keys = {
  let all = "estimateEstimateIdResultsGet"
}

let refetchIntervalCondition = (
  ~data: option<result<QuotesResultResponse.quotesResultResponse, exn>>,
) => {
  switch data {
  | Some(Ok(res)) => res.bookingId->Option.isNone
  | Some(Error(err)) => {
      Console.log2("Error while fetching estimate results: ", err)
      true
    }
  | None => true
  }
}

let useEstimateEstimateIdResultsGet = (
  ~estimateId: string,
  ~refetchIntervalTime: int,
  ~enabled: bool,
) => {
  let key = [Keys.all, estimateId]
  useQuery({
    queryKey: key,
    enabled,
    queryFn: _ => estimateEstimateIdResultsGetApiCall(estimateId),
    refetchInterval: data =>
      refetchInterval(
        refetchIntervalCondition(~data=data.state.data)
          ? #number(refetchIntervalTime)
          : #bool(false),
      ),
  })
}
