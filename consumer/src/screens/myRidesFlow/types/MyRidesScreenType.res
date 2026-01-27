type locationInfo = {
  address: string,
  area: string,
  building: string,
  lat: option<float>,
  lon: option<float>,
  street: string,
  ward: string,
}

type rideDetail = {
  bookingId: string,
  bookingStatus: RideBooking.BookingStatus.bookingStatus,
  chargeableRideDistance: option<int>,
  computedPrice: option<int>,
  createdAt: string,
  currency: string,
  destinationLocationInfo: locationInfo,
  distanceWithUnit: RideBooking.distance,
  driverName: string,
  estimatedDistance: option<int>,
  estimatedDuration: option<int>,
  estimatedFareWithCurrency: RideBooking.priceApiEntity,
  estimatedTotalFare: int,
  fareBreakup: array<RideBooking.fareBreakupAPIEntity>,
  rideEndTime: option<string>,
  rideId: string,
  rideRating: option<int>,
  rideStartTime: option<string>,
  rideStatus: RideBooking.RideStatus.rideStatus,
  shortRideId: string,
  sourceLocationInfo: locationInfo,
  vehicleModel: string,
  vehicleNumber: string,
  vehicleVariant: string,
}

let fetchLocationInfo = (location: RideBooking.locationApiEntity): locationInfo => {
  let getTrimmedValue = (opt: option<string>): string => {
    opt->Option.getOr("")->String.trim
  }
  let addressComponents =
    [
      location.area,
      location.building,
      location.city,
      location.country,
      location.door,
      location.state,
      location.street,
    ]
    ->Array.map(getTrimmedValue)
    ->Array.filter(component => component != "")

  let address = addressComponents->Array.join(", ")
  let area = getTrimmedValue(location.street)
  let building = getTrimmedValue(location.building)
  let street = getTrimmedValue(location.street)
  let ward = getTrimmedValue(location.ward)

  {address, area, building, lat: location.lat, lon: location.lon, street, ward}
}

let transformRideBooking = (bookingDetail: RideBooking.rideBookingRes): option<rideDetail> => {
  let rideDetail' = bookingDetail.rideList->Array.get(0)
  switch rideDetail' {
  | Some(rideDetail) =>
    Some({
      bookingId: bookingDetail.id,
      bookingStatus: bookingDetail.status,
      chargeableRideDistance: rideDetail.chargeableRideDistance,
      computedPrice: rideDetail.computedPrice,
      createdAt: bookingDetail.createdAt,
      currency: CurrencyHelper.getCurrencyFromType(
        bookingDetail.estimatedTotalFareWithCurrency.currency,
      ),
      destinationLocationInfo: fetchLocationInfo(bookingDetail.bookingDetails.contents.toLocation),
      distanceWithUnit: bookingDetail.estimatedDistanceWithUnit,
      driverName: rideDetail.driverName,
      estimatedDistance: bookingDetail.estimatedDistance,
      estimatedDuration: bookingDetail.estimatedDuration,
      estimatedFareWithCurrency: bookingDetail.estimatedFareWithCurrency,
      estimatedTotalFare: bookingDetail.estimatedTotalFareWithCurrency.amount,
      fareBreakup: bookingDetail.fareBreakup,
      rideEndTime: rideDetail.rideEndTime,
      rideId: rideDetail.id,
      rideRating: rideDetail.rideRating,
      rideStartTime: rideDetail.rideStartTime,
      rideStatus: rideDetail.status,
      shortRideId: rideDetail.shortRideId,
      sourceLocationInfo: fetchLocationInfo(bookingDetail.fromLocation),
      vehicleModel: rideDetail.vehicleModel,
      vehicleNumber: rideDetail.vehicleNumber,
      vehicleVariant: Option.getOr(bookingDetail.serviceTierName, rideDetail.vehicleVariant),
    })
  | None => None
  }
}

let getFareDescription = (fareType: string) => {
  switch fareType {
  | "BASE_FARE" => LocaleStringType.BASE_FARE
  | "EXTRA_DISTANCE_FARE" => LocaleStringType.OPTIONAL_DRIVER_REQUEST
  | "DRIVER_SELECTED_FARE" => LocaleStringType.DRIVER_ADDITIONS
  | "TOTAL_FARE" => LocaleStringType.TOTAL_FARE
  | "DEAD_KILOMETER_FARE" => LocaleStringType.PICKUP_CHARGES
  | "PICKUP_CHARGES" => LocaleStringType.PICKUP_CHARGES
  | "WAITING_CHARGES" => LocaleStringType.WAITING_CHARGES("*")
  | "EARLY_END_RIDE_PENALTY" => LocaleStringType.EARLY_RIDE_END_CHARGES
  | "Post Ride Tip" => LocaleStringType.CUSTOMER_TIP
  | "SERVICE_CHARGE" => LocaleStringType.SERVICE_CHARGES
  | "FIXED_GOVERNMENT_RATE" => LocaleStringType.RIDE_GST
  | "WAITING_OR_PICKUP_CHARGES" => LocaleStringType.WAITING_CHARGES("*")
  | "PLATFORM_FEE" => LocaleStringType.PLATFORM_FEE
  | "SGST" => LocaleStringType.TAXES
  | "CUSTOMER_CANCELLATION_DUES" => LocaleStringType.CANCELLATION_DUES
  | "TOLL_CHARGES" => LocaleStringType.TOLL_CHARGES
  | "DIST_BASED_FARE" => LocaleStringType.DISTANCE_BASED_CHARGES
  | "TIME_BASED_FARE" => LocaleStringType.TIME_BASED_CHARGES
  | "EXTRA_TIME_FARE" => LocaleStringType.EXTRA_TIME_CHARGES
  | "CONGESTION_CHARGE" => LocaleStringType.CONGESTION_CHARGE
  | a => LocaleStringType.CUSTOM_TEXT({text: a})
  }
}

let tranformFareIntoHTML = (fareInfo: RideBooking.fareBreakupAPIEntity) => {
  let currency = CurrencyHelper.getCurrencyFromType(fareInfo.amountWithCurrency.currency)
  let text = GetLocale.getLocale(getFareDescription(fareInfo.description)).text
  let roundedAmount = fareInfo.amount->Int.toFloat->Js.Math.round->Float.toString

  `<div style="display: flex; flex-direction: row; ">
      <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280; flex-grow:1;">${text}</div>
      <div style="font-weight: 700; font-size: 16px; line-height: 22px; color:#6D7280;">${currency}${roundedAmount}</div>
   </div>`
}

let getHTMLFares = (fareBreakup: array<RideBooking.fareBreakupAPIEntity>) => {
  let listOfHTMLFares = fareBreakup->Array.map(tranformFareIntoHTML)
  String.concatMany("", listOfHTMLFares)
}
