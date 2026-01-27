open BookingStatusAPIEntity
open Enums
open ReactQuery
open RideBookingV2RideBookingIdGet

let refetchIntervalCondition = (
  data: option<result<BookingStatusAPIEntity.bookingStatusAPIEntity, exn>>,
) => {
  switch data {
  | Some(Ok(res)) => res.bookingStatus !== BookingStatus.TRIP_ASSIGNED
  | Some(Error(_)) => true
  | None => true
  }
}

module Keys = {
  let all = ["rideBookingRideBookingIdGet"]
}
let useRideBookingRideBookingIdGet = (
  ~rideBookingId: string,
  ~refetchIntervalTime: int,
  ~enabled: bool,
) => {
  useQuery({
    queryKey: Keys.all,
    enabled,
    queryFn: _ => rideBookingV2RideBookingIdGetApiCall(rideBookingId),
    refetchInterval: data =>
      refetchInterval(
        refetchIntervalCondition(data.state.data) ? #number(refetchIntervalTime) : #bool(false),
      ),
  })
}
