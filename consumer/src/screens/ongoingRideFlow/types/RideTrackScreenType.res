@genType
type vehicleDetail = {
  vehColor: string,
  variant: string,
  vehicleNumber: string,
}
@genType
type driverDetail = {
  firstName: string,
  lastName: string,
  phoneNumber: option<string>,
  estimatePrice: int,
  rating: option<float>,
}
@genType
type locationInfo = {
  ward: string,
  address: string,
  lat: option<float>,
  lon: option<float>,
}

@genType
type rideDetail = {
  bookingStatus: RideBooking.BookingStatus.bookingStatus,
  rideStatus: RideBooking.RideStatus.rideStatus,
  bookingId: string,
  rideId: string,
  rideOtp: string,
  estimatedTotalFare: int,
  currency: string,
  sourceLocationInfo: locationInfo,
  destinationLocationInfo: locationInfo,
  arrivingInSeconds: int,
  driverDetail: driverDetail,
  vehicleDetail: vehicleDetail,
  rideEndTime: option<string>,
  rideStartTime: option<string>,
  computedPrice: option<int>,
  rideRating: option<int>,
  driverArrivalTime: option<string>,
  bppRideId: string,
  paymentDetails: option<RideBooking.paymentDetails>,
  merchantExoPhone: string,
  estimatedDistance: option<int>,
  estimatedDuration: option<int>,
  rideScheduledTime: option<string>,
}

let fetchLocationInfo = (location: RideBooking.locationApiEntity): locationInfo => {
  let getTrimmedValue = (opt: option<string>): string => {
    opt->Option.getOr("")->String.trim
  }
  let addressComponents =
    [
      location.door,
      location.building,
      location.street,
      location.area,
      location.city,
      location.state,
      location.country,
    ]
    ->Array.map(getTrimmedValue)
    ->Array.filter(component => component != "")

  let address = addressComponents->Array.join(", ")
  let ward = getTrimmedValue(location.ward)

  {ward, address, lat: location.lat, lon: location.lon}
}

let transformRideBooking = (bookingDetail: RideBooking.rideBookingRes): option<rideDetail> => {
  let rideDetail' = bookingDetail.rideList->Array.get(0)
  switch rideDetail' {
  | Some(rideDetail) =>
    Some({
      rideScheduledTime: bookingDetail.rideScheduledTime,
      bookingStatus: bookingDetail.status,
      rideStatus: rideDetail.status,
      bookingId: bookingDetail.id,
      rideId: rideDetail.id,
      rideOtp: rideDetail.rideOtp,
      estimatedTotalFare: bookingDetail.estimatedTotalFareWithCurrency.amount,
      estimatedDuration: bookingDetail.estimatedDuration,
      estimatedDistance: bookingDetail.estimatedDistance,
      currency: CurrencyHelper.getCurrencyFromType(
        bookingDetail.estimatedTotalFareWithCurrency.currency,
      ),
      sourceLocationInfo: fetchLocationInfo(bookingDetail.fromLocation),
      destinationLocationInfo: fetchLocationInfo(bookingDetail.bookingDetails.contents.toLocation),
      arrivingInSeconds: 0,
      driverDetail: {
        firstName: rideDetail.driverName,
        lastName: "",
        phoneNumber: rideDetail.driverNumber,
        estimatePrice: bookingDetail.estimatedTotalFareWithCurrency.amount,
        rating: rideDetail.driverRatings,
      },
      vehicleDetail: {
        vehColor: rideDetail.vehicleColor,
        variant: Option.getOr(bookingDetail.serviceTierName, rideDetail.vehicleVariant),
        vehicleNumber: rideDetail.vehicleNumber,
      },
      computedPrice: rideDetail.computedPrice,
      rideEndTime: rideDetail.rideEndTime,
      rideStartTime: rideDetail.rideStartTime,
      rideRating: rideDetail.rideRating,
      driverArrivalTime: rideDetail.driverArrivalTime,
      bppRideId: rideDetail.bppRideId,
      paymentDetails: rideDetail.paymentDetails,
      merchantExoPhone: bookingDetail.merchantExoPhone,
    })
  | None =>
    // TODO: HACKY FIX, FIX IT PROPERLY WITH FLOW STATUS API
    Some({
      rideScheduledTime: bookingDetail.rideScheduledTime,
      bookingStatus: bookingDetail.status,
      rideStatus: RideBooking.RideStatus.NEW,
      bookingId: bookingDetail.id,
      rideId: "",
      rideOtp: "",
      estimatedTotalFare: bookingDetail.estimatedTotalFareWithCurrency.amount,
      estimatedDuration: bookingDetail.estimatedDuration,
      estimatedDistance: bookingDetail.estimatedDistance,
      currency: CurrencyHelper.getCurrencyFromType(
        bookingDetail.estimatedTotalFareWithCurrency.currency,
      ),
      sourceLocationInfo: fetchLocationInfo(bookingDetail.fromLocation),
      destinationLocationInfo: fetchLocationInfo(bookingDetail.bookingDetails.contents.toLocation),
      arrivingInSeconds: 0,
      driverDetail: {
        firstName: "Driver",
        lastName: "",
        phoneNumber: None,
        estimatePrice: bookingDetail.estimatedTotalFareWithCurrency.amount,
        rating: None,
      },
      vehicleDetail: {
        vehColor: "",
        variant: Option.getOr(bookingDetail.serviceTierName, ""),
        vehicleNumber: "",
      },
      computedPrice: None,
      rideEndTime: None,
      rideStartTime: None,
      rideRating: None,
      driverArrivalTime: None,
      bppRideId: "",
      paymentDetails: None,
      merchantExoPhone: bookingDetail.merchantExoPhone,
    })
  }
}

let transformRideBookingList = (rideBookingList: RideBookingList.rideBookingListResponse): option<
  rideDetail,
> => {
  let bookingDetail' = rideBookingList.list->Array.get(0)
  switch bookingDetail' {
  | Some(bookingDetail) => transformRideBooking(bookingDetail)
  | None => None
  }
}
