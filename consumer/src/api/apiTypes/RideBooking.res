open Utils

@genType
type sostype = Resolved | NotResolved | Pending | MockPending | MockResolved
let defaultCurrencytype = CurrencyHelper.USD

module BookingStatus = {
  @genType
  type bookingStatus =
    NEW | CONFIRMED | AWAITING_REASSIGNMENT | REALLOCATED | COMPLETED | CANCELLED | TRIP_ASSIGNED
}

module RideStatus = {
  @genType
  type rideStatus = NEW | INPROGRESS | COMPLETED | CANCELLED
}

@genType
type vechicleType =
  | SEDAN
  | SUV
  | HATCHBACK
  | AUTO_RICKSHAW
  | TAXI
  | TAXI_PLUS
  | ECO
  | COMFY
  | PREMIUM
  | BIKE
  | BIKE_PLUS
  | AC_PRIORITY
  | E_RICKSHAW

@genType
type priceApiEntity = {
  amount: int,
  currency: CurrencyHelper.currencytype,
}
@genType
type fareBreakupAPIEntity = {
  amount: int,
  amountWithCurrency: priceApiEntity,
  description: string,
}

@genType
type paymentDetails = {
  cardId: string,
  cardBrand: string,
  last4: int,
}

@genType
type rideAPIEntity = {
  computedPrice: option<int>,
  status: RideStatus.rideStatus,
  vehicleModel: string,
  createdAt: string,
  driverNumber: option<string>,
  shortRideId: string,
  driverRegisteredAt: option<string>,
  vehicleNumber: string,
  rideOtp: string,
  driverName: string,
  chargeableRideDistance: option<int>,
  vehicleVariant: string,
  driverRatings: option<float>,
  vehicleColor: string,
  id: string,
  updatedAt: string,
  rideStartTime: option<string>,
  rideEndTime: option<string>,
  rideRating: option<int>,
  driverArrivalTime: option<string>,
  bppRideId: string,
  endOtp: option<string>,
  startOdometerReading: option<float>,
  endOdometerReading: option<float>,
  paymentDetails: option<paymentDetails>,
  driverImage: option<string>,
}

@genType
type locationApiEntity = {
  area: option<string>,
  state: option<string>,
  country: option<string>,
  building: option<string>,
  door: option<string>,
  street: option<string>,
  lat: option<float>,
  city: option<string>,
  areaCode: option<string>,
  lon: option<float>,
  ward: option<string>,
  placeId: option<string>,
}
@genType
type distanceUnit = Meter | Mile | Yard | Kilometer
@genType
type distance = {
  unit: distanceUnit,
  value: float,
}
@genType
type rideBookingDetails = {
  otpCode: option<string>,
  toLocation: locationApiEntity,
  estimatedDistance: option<int>,
  estimateDistanceWithUnit: distance,
}

@genType
type rideBookingAPIDetails = {
  contents: rideBookingDetails,
  fareProductType: string,
}

@genType
type rideBookingRes = {
  agencyName: string,
  agencyNumber: option<string>,
  bookingDetails: rideBookingAPIDetails,
  createdAt: string,
  discountWithCurrency: priceApiEntity,
  discount: option<int>,
  duration: option<int>,
  editPickupAttemptsLeft: option<int>,
  estimatedDistance: option<int>,
  estimatedDistanceWithUnit: distance,
  estimatedDuration: option<int>,
  estimatedFare: int,
  estimatedFareWithCurrency: priceApiEntity,
  estimatedTotalFare: int,
  estimatedTotalFareWithCurrency: priceApiEntity,
  fareBreakup: array<fareBreakupAPIEntity>,
  fromLocation: locationApiEntity,
  hasDisability: option<bool>,
  hasNightIssue: option<bool>,
  initialPickupLocation: locationApiEntity,
  sosStatus: sostype,
  serviceTierName: option<string>,
  airConditioned: option<bool>,
  isValueAddNP: option<bool>,
  providerName: option<string>,
  id: string,
  merchantExoPhone: string,
  rideEndTime: option<string>,
  rideList: array<rideAPIEntity>,
  rideScheduledTime: option<string>,
  rideStartTime: option<string>,
  specialLocationTag: option<string>,
  status: BookingStatus.bookingStatus,
  tripTerms: array<string>,
  updatedAt: string,
  vehicleServiceTierType: vechicleType,
  vehicleServiceTierSeatingCapacity: option<int>,
}

let defaultVechicleType = SUV

let getVehicleServiceTierType = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "SEDAN" => SEDAN
    | "SUV" => SUV
    | "HATCHBACK" => HATCHBACK
    | "AUTO_RICKSHAW" => AUTO_RICKSHAW
    | "TAXI" => TAXI
    | "TAXI_PLUS" => TAXI_PLUS
    | "ECO" => ECO
    | "COMFY" => COMFY
    | "PREMIUM" => PREMIUM
    | "BIKE" => BIKE
    | "BIKE_PLUS" => BIKE_PLUS
    | "AC_PRIORITY" => AC_PRIORITY
    | "E_RICKSHAW" => E_RICKSHAW
    | _ => SEDAN
    }
  })
  ->Option.getOr(defaultVechicleType)
}

// let defaultBookingStatus = CONFIRMED

let getBookingStatus = (dict, key): BookingStatus.bookingStatus => {
  open BookingStatus
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "NEW" => NEW
    | "CONFIRMED" => CONFIRMED
    | "AWAITING_REASSIGNMENT" => AWAITING_REASSIGNMENT
    | "REALLOCATED" => REALLOCATED
    | "COMPLETED" => COMPLETED
    | "CANCELLED" => CANCELLED
    | "TRIP_ASSIGNED" => TRIP_ASSIGNED
    | _ => NEW
    }
  })
  ->Option.getOr(NEW)
}

let getRideStatus = (dict, key): RideStatus.rideStatus => {
  open RideStatus
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "NEW" => NEW
    | "INPROGRESS" => INPROGRESS
    | "COMPLETED" => COMPLETED
    | "CANCELLED" => CANCELLED
    | _ => NEW
    }
  })
  ->Option.getOr(NEW)
}

let getPaymentDetails = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      cardId: getOptionString(dict, "cardId")->Option.getExn,
      cardBrand: getOptionString(dict, "cardBrand")->Option.getExn,
      last4: getOptionInt(dict, "last4")->Option.getExn,
    }
  })
}

let getRideList = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      computedPrice: getOptionInt(dict, "computedPrice"),
      status: getRideStatus(dict, "status"),
      vehicleModel: getString(dict, "vehicleModel", ""),
      createdAt: getString(dict, "createdAt", ""),
      driverNumber: getOptionString(dict, "driverNumber"),
      shortRideId: getString(dict, "shortRideId", ""),
      driverRegisteredAt: getOptionString(dict, "driverRegisteredAt"),
      vehicleNumber: getString(dict, "vehicleNumber", ""),
      rideOtp: getString(dict, "rideOtp", ""),
      driverName: getString(dict, "driverName", ""),
      chargeableRideDistance: getOptionInt(dict, "chargeableRideDistance"),
      vehicleVariant: getString(dict, "vehicleVariant", ""),
      driverRatings: getOptionFloat(dict, "driverRatings"),
      vehicleColor: getString(dict, "vehicleColor", ""),
      id: getString(dict, "id", ""),
      updatedAt: getString(dict, "updatedAt", ""),
      rideStartTime: getOptionString(dict, "rideStartTime"),
      rideEndTime: getOptionString(dict, "rideEndTime"),
      rideRating: getOptionInt(dict, "rideRating"),
      driverArrivalTime: getOptionString(dict, "driverArrivalTime"),
      bppRideId: getString(dict, "bppRideId", ""),
      endOtp: getOptionString(dict, "endOtp"),
      startOdometerReading: getOptionFloat(dict, "startOdometerReading"),
      endOdometerReading: getOptionFloat(dict, "endOdometerReading"),
      paymentDetails: getPaymentDetails(dict, "paymentDetails"),
      driverImage: getOptionString(dict, "driverImage"),
    }
  })
}

let defaultSostype = NotResolved

let getSosStatus = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "Resolved" => Resolved
    | "NotResolved" => NotResolved
    | "Pending" => Pending
    | "MockPending" => MockPending
    | "MockResolved" => MockResolved

    | _ => Resolved
    }
  })
  ->Option.getOr(defaultSostype)
}

let defaultBookingLocationAPIEntity = {
  area: None,
  state: None,
  country: None,
  building: None,
  door: None,
  street: None,
  lat: None,
  city: None,
  areaCode: None,
  lon: None,
  ward: None,
  placeId: None,
}

let getLocation = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      area: getOptionString(dict, "area"),
      state: getOptionString(dict, "state"),
      country: getOptionString(dict, "country"),
      building: getOptionString(dict, "building"),
      door: getOptionString(dict, "door"),
      street: getOptionString(dict, "street"),
      lat: getOptionFloat(dict, "lat"),
      city: getOptionString(dict, "city"),
      areaCode: getOptionString(dict, "areaCode"),
      lon: getOptionFloat(dict, "lon"),
      ward: getOptionString(dict, "ward"),
      placeId: getOptionString(dict, "placeId"),
    }
  })
  ->Option.getOr(defaultBookingLocationAPIEntity)
}

let defaultPriceApiEntity = {
  amount: 0,
  currency: defaultCurrencytype,
}
let getCurrency = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "INR" => CurrencyHelper.INR
    | "USD" => CurrencyHelper.USD
    | "EUR" => CurrencyHelper.EUR

    | _ => INR
    }
  })
  ->Option.getOr(defaultCurrencytype)
}

let getAmountWithCurrency = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      amount: getInt(dict, "amount", 0),
      currency: getCurrency(dict, "currency"),
    }
  })
  ->Option.getOr(defaultPriceApiEntity)
}

let defaultFareBreakupAPIEntity = {
  amount: 0,
  amountWithCurrency: defaultPriceApiEntity,
  description: "",
}

let getFareBreakup = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      amount: getInt(dict, "amount", 0),
      amountWithCurrency: getAmountWithCurrency(dict, "amountWithCurrency"),
      description: getString(dict, "description", ""),
    }
  })
}

let defaultPriceApiEntity = {
  amount: 0,
  currency: defaultCurrencytype,
}

let getEstimatedTotalFareWithCurrency = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      amount: getInt(dict, "amount", 0),
      currency: getCurrency(dict, "currency"),
    }
  })
  ->Option.getOr(defaultPriceApiEntity)
}

let defaultPriceApiEntity = {
  amount: 0,
  currency: defaultCurrencytype,
}

let getEstimatedFareWithCurrency = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      amount: getInt(dict, "amount", 0),
      currency: getCurrency(dict, "currency"),
    }
  })
  ->Option.getOr(defaultPriceApiEntity)
}

let defaultDistanceUnit = Mile

let getUnit = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "Meter" => Meter
    | "Mile" => Mile
    | "Yard" => Yard
    | "Kilometer" => Kilometer

    | _ => Meter
    }
  })
  ->Option.getOr(defaultDistanceUnit)
}

let defaultDistance = {
  unit: defaultDistanceUnit,
  value: 0.0,
}

let getEstimatedDistanceWithUnit = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      unit: getUnit(dict, "unit"),
      value: getFloat(dict, "value", 0.0),
    }
  })
  ->Option.getOr(defaultDistance)
}

let defaultCurrencytype = CurrencyHelper.USD

let defaultPriceApiEntity = {
  amount: 0,
  currency: defaultCurrencytype,
}

let getDiscountWithCurrency = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      amount: getInt(dict, "amount", 0),
      currency: getCurrency(dict, "currency"),
    }
  })
  ->Option.getOr(defaultPriceApiEntity)
}

let defaultDistanceUnit = Mile

let defaultDistance = {
  unit: defaultDistanceUnit,
  value: 0.0,
}

let getEstimateDistanceWithUnit = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      unit: getUnit(dict, "unit"),
      value: getFloat(dict, "value", 0.0),
    }
  })
  ->Option.getOr(defaultDistance)
}

let defaultRideBookingDetails = {
  otpCode: None,
  toLocation: defaultBookingLocationAPIEntity,
  estimatedDistance: None,
  estimateDistanceWithUnit: defaultDistance,
}

let getContents = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      otpCode: getOptionString(dict, "otpCode"),
      toLocation: getLocation(dict, "toLocation"),
      estimatedDistance: getOptionInt(dict, "estimatedDistance"),
      estimateDistanceWithUnit: getEstimateDistanceWithUnit(dict, "estimateDistanceWithUnit"),
    }
  })
  ->Option.getOr(defaultRideBookingDetails)
}

let defaultRideBookingAPIDetails = {
  contents: defaultRideBookingDetails,
  fareProductType: "",
}

let getBookingDetails = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      contents: getContents(dict, "contents"),
      fareProductType: getString(dict, "fareProductType", ""),
    }
  })
  ->Option.getOr(defaultRideBookingAPIDetails)
}

let itemToObjectMapper = dict => {
  {
    agencyName: getString(dict, "agencyName", ""),
    agencyNumber: getOptionString(dict, "agencyNumber"),
    bookingDetails: getBookingDetails(dict, "bookingDetails"),
    createdAt: getString(dict, "createdAt", ""),
    discountWithCurrency: getDiscountWithCurrency(dict, "discountWithCurrency"),
    discount: getOptionInt(dict, "discount"),
    duration: getOptionInt(dict, "duration"),
    editPickupAttemptsLeft: getOptionInt(dict, "editPickupAttemptsLeft"),
    estimatedDistance: getOptionInt(dict, "estimatedDistance"),
    estimatedDistanceWithUnit: getEstimatedDistanceWithUnit(dict, "estimatedDistanceWithUnit"),
    estimatedDuration: getOptionInt(dict, "estimatedDuration"),
    estimatedFare: getInt(dict, "estimatedFare", 0),
    estimatedFareWithCurrency: getEstimatedFareWithCurrency(dict, "estimatedFareWithCurrency"),
    estimatedTotalFare: getInt(dict, "estimatedTotalFare", 0),
    estimatedTotalFareWithCurrency: getEstimatedTotalFareWithCurrency(
      dict,
      "estimatedTotalFareWithCurrency",
    ),
    fareBreakup: getFareBreakup(dict, "fareBreakup"),
    fromLocation: getLocation(dict, "fromLocation"),
    hasDisability: getOptionBool(dict, "hasDisability"),
    hasNightIssue: getOptionBool(dict, "hasNightIssue"),
    initialPickupLocation: getLocation(dict, "initialPickupLocation"),
    sosStatus: getSosStatus(dict, "sosStatus"),
    serviceTierName: getOptionString(dict, "serviceTierName"),
    airConditioned: getOptionBool(dict, "airConditioned"),
    isValueAddNP: getOptionBool(dict, "isValueAddNP"),
    providerName: getOptionString(dict, "providerName"),
    id: getString(dict, "id", ""),
    merchantExoPhone: getString(dict, "merchantExoPhone", ""),
    rideEndTime: getOptionString(dict, "rideEndTime"),
    rideList: getRideList(dict, "rideList"),
    rideScheduledTime: getOptionString(dict, "rideScheduledTime"),
    rideStartTime: getOptionString(dict, "rideStartTime"),
    specialLocationTag: getOptionString(dict, "specialLocationTag"),
    status: getBookingStatus(dict, "status"),
    tripTerms: getStrArrayFromDict(dict, "tripTerms", []),
    updatedAt: getString(dict, "updatedAt", ""),
    vehicleServiceTierType: getVehicleServiceTierType(dict, "vehicleServiceTierType"),
    vehicleServiceTierSeatingCapacity: getOptionInt(dict, "vehicleServiceTierSeatingCapacity"),
  }
}
