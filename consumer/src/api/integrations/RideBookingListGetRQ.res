open Enums
open ReactQuery
open RideBookingListGet

module Keys = {
  let all = "rideBookingListGet"
}

let useRideBookingListGet = (
  ~limit: option<int>,
  ~offset: option<int>,
  ~onlyActive: option<bool>,
  ~status: option<RideBookingListStatus.rideBookingListStatus>,
  ~clientId: option<string>,
) => {
  let keys = [
    Keys.all,
    Option.mapOr(limit, "", x => x->Js.Int.toString),
    Option.mapOr(offset, "", x => x->Js.Int.toString),
    Option.mapOr(onlyActive, "", x => x->Utils.boolToString),
    Option.mapOr(status, "", x => x->RideBookingListStatus.rideBookingListStatusToString) ++
    Option.mapOr(clientId, "", x => x),
  ]
  useQuery({
    queryKey: keys,
    queryFn: _ => rideBookingListGetApiCall(limit, offset, onlyActive, status, clientId),
  })
}
