type rideBookingListResponse = {list: array<RideBooking.rideBookingRes>}

let getList = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => RideBooking.itemToObjectMapper(dict))
}

let itemToObjectMapper = dict => {
  {
    list: getList(dict, "list"),
  }
}
