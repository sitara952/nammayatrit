open ReactQuery
open FrontendFlowStatusGet
open Utils

module Keys = {
  let all = "frontendFlowStatusGet"
}
let useFrontendFlowStatusGet = (~isPolling: option<bool>, ~checkForActiveBooking: option<bool>) => {
  let key = [Keys.all, boolToString(Option.getOr(isPolling, false))]
  useQuery({
    queryKey: key,
    queryFn: _ =>
      frontendFlowStatusGetApiCall(
        (isPolling: option<bool>),
        (checkForActiveBooking: option<bool>),
      ),
  })
}
