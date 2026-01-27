open ReactQuery
open RideSearchPostCustom

module Keys = {
  let all = ["rideSearchPost"]
}

type mutateParams = {
  clientId: option<string>,
  isDashboardRequest: option<bool>,
  source: option<LocationTypes.location>,
  destination: option<LocationTypes.location>,
}

let useRideSearchPost = () => {
  useMutation({
    mutationKey: Keys.all,
    mutationFn: ({source, destination, clientId, isDashboardRequest}: mutateParams) => {
      let searchReq = RideSearch.mkRideSearchReq(
        source,
        destination,
        [],
        true,
        None,
        None,
        false,
        None,
        None,
        None,
        None,
        false,
      )
      let req = switch searchReq {
      | Some(req) => req
      | None => Js.Exn.raiseError("RideSearch body not defined")
      }

      rideSearchPostApiCall(clientId, isDashboardRequest, req)
    },
  })
}
