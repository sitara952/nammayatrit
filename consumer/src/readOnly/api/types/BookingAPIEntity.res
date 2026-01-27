open Enums
open BookingAPIDetails
open BookingCancellationReasonAPIEntity
open Distance
open EstimatedEndTimeRange
open FareBreakupAPIEntity
open LocationAPIEntity
open PriceAPIEntity
open RideAPIEntity
open TripCategory
open Utils

@genType
type bookingAPIEntity = {
  agencyName: string,
  agencyNumber: option<string>,
  billingCategory: BillingCategory.billingCategory,
  bookingDetails: bookingAPIDetails,
  cancellationReason: option<bookingCancellationReasonAPIEntity>,
  createdAt: string,
  discount: option<int>,
  discountWithCurrency: option<priceAPIEntity>,
  driversPreviousRideDropLocLat: option<float>,
  driversPreviousRideDropLocLon: option<float>,
  duration: option<int>,
  estimatedDistance: option<float>,
  estimatedDistanceWithUnit: option<distance>,
  estimatedDuration: option<int>,
  estimatedEndTimeRange: option<estimatedEndTimeRange>,
  estimatedFare: int,
  estimatedFareBreakup: array<fareBreakupAPIEntity>,
  estimatedFareWithCurrency: priceAPIEntity,
  estimatedTotalFare: int,
  estimatedTotalFareWithCurrency: priceAPIEntity,
  fareBreakup: array<fareBreakupAPIEntity>,
  favCount: option<int>,
  fromLocation: locationAPIEntity,
  hasDisability: option<bool>,
  hasNightIssue: bool,
  id: string,
  initialPickupLocation: locationAPIEntity,
  insuredAmount: option<string>,
  isAirConditioned: option<bool>,
  isAlreadyFav: option<bool>,
  isBookingUpdated: bool,
  isInsured: option<bool>,
  isPetRide: bool,
  isSafetyPlus: bool,
  isScheduled: bool,
  isValueAddNP: bool,
  mbJourneyId: option<string>,
  merchantExoPhone: string,
  paymentMethodId: option<string>,
  paymentUrl: option<string>,
  returnTime: option<string>,
  rideEndTime: option<string>,
  rideList: array<rideAPIEntity>,
  rideScheduledTime: string,
  rideStartTime: option<string>,
  serviceTierName: option<string>,
  serviceTierShortDesc: option<string>,
  sosStatus: option<SosStatus.sosStatus>,
  specialLocationName: option<string>,
  specialLocationTag: option<string>,
  status: BookingStatus.bookingStatus,
  tripCategory: option<tripCategory>,
  tripTerms: array<string>,
  updatedAt: string,
  vehicleIconUrl: option<string>,
  vehicleServiceTierAirConditioned: option<float>,
  vehicleServiceTierSeatingCapacity: option<int>,
  vehicleServiceTierType: ServiceTierType.serviceTierType,
}

let decodeBookingAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          agencyName: getOptionString(dict, "agencyName")->Option.getExn(
            ~message="agencyName not found",
          ),
          agencyNumber: getOptionString(dict, "agencyNumber"),
          billingCategory: BillingCategory.decodeBillingCategoryResult(
            dict,
            "billingCategory",
          )->Utils.getResultExn(~message="billingCategory is coming as undefined"),
          bookingDetails: dict
          ->Dict.get("bookingDetails")
          ->Option.getExn(~message="bookingDetails is not found")
          ->decodeBookingAPIDetails
          ->Utils.getResultExn(~message="bookingDetails is coming as undefined"),
          cancellationReason: dict
          ->Dict.get("cancellationReason")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeBookingCancellationReasonAPIEntity(x)->Result.mapOr(None, x => Some(x))
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          discount: getOptionInt(dict, "discount"),
          discountWithCurrency: dict
          ->Dict.get("discountWithCurrency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          driversPreviousRideDropLocLat: getOptionFloat(dict, "driversPreviousRideDropLocLat"),
          driversPreviousRideDropLocLon: getOptionFloat(dict, "driversPreviousRideDropLocLon"),
          duration: getOptionInt(dict, "duration"),
          estimatedDistance: getOptionFloat(dict, "estimatedDistance"),
          estimatedDistanceWithUnit: dict
          ->Dict.get("estimatedDistanceWithUnit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          estimatedDuration: getOptionInt(dict, "estimatedDuration"),
          estimatedEndTimeRange: dict
          ->Dict.get("estimatedEndTimeRange")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeEstimatedEndTimeRange(x)->Result.mapOr(None, x => Some(x))
          ),
          estimatedFare: getOptionInt(dict, "estimatedFare")->Option.getExn(
            ~message="estimatedFare not found",
          ),
          estimatedFareBreakup: dict
          ->Dict.get("estimatedFareBreakup")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="estimatedFareBreakup is not of array")
          ->Array.map(x =>
            decodeFareBreakupAPIEntity(x)->Utils.getResultExn(
              ~message="estimatedFareBreakup is coming as undefined",
            )
          ),
          estimatedFareWithCurrency: dict
          ->Dict.get("estimatedFareWithCurrency")
          ->Option.getExn(~message="estimatedFareWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="estimatedFareWithCurrency is coming as undefined"),
          estimatedTotalFare: getOptionInt(dict, "estimatedTotalFare")->Option.getExn(
            ~message="estimatedTotalFare not found",
          ),
          estimatedTotalFareWithCurrency: dict
          ->Dict.get("estimatedTotalFareWithCurrency")
          ->Option.getExn(~message="estimatedTotalFareWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="estimatedTotalFareWithCurrency is coming as undefined"),
          fareBreakup: dict
          ->Dict.get("fareBreakup")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="fareBreakup is not of array")
          ->Array.map(x =>
            decodeFareBreakupAPIEntity(x)->Utils.getResultExn(
              ~message="fareBreakup is coming as undefined",
            )
          ),
          favCount: getOptionInt(dict, "favCount"),
          fromLocation: dict
          ->Dict.get("fromLocation")
          ->Option.getExn(~message="fromLocation is not found")
          ->decodeLocationAPIEntity
          ->Utils.getResultExn(~message="fromLocation is coming as undefined"),
          hasDisability: getOptionBool(dict, "hasDisability"),
          hasNightIssue: getOptionBool(dict, "hasNightIssue")->Option.getExn(
            ~message="hasNightIssue not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          initialPickupLocation: dict
          ->Dict.get("initialPickupLocation")
          ->Option.getExn(~message="initialPickupLocation is not found")
          ->decodeLocationAPIEntity
          ->Utils.getResultExn(~message="initialPickupLocation is coming as undefined"),
          insuredAmount: getOptionString(dict, "insuredAmount"),
          isAirConditioned: getOptionBool(dict, "isAirConditioned"),
          isAlreadyFav: getOptionBool(dict, "isAlreadyFav"),
          isBookingUpdated: getOptionBool(dict, "isBookingUpdated")->Option.getExn(
            ~message="isBookingUpdated not found",
          ),
          isInsured: getOptionBool(dict, "isInsured"),
          isPetRide: getOptionBool(dict, "isPetRide")->Option.getExn(
            ~message="isPetRide not found",
          ),
          isSafetyPlus: getOptionBool(dict, "isSafetyPlus")->Option.getExn(
            ~message="isSafetyPlus not found",
          ),
          isScheduled: getOptionBool(dict, "isScheduled")->Option.getExn(
            ~message="isScheduled not found",
          ),
          isValueAddNP: getOptionBool(dict, "isValueAddNP")->Option.getExn(
            ~message="isValueAddNP not found",
          ),
          mbJourneyId: getOptionString(dict, "mbJourneyId"),
          merchantExoPhone: getOptionString(dict, "merchantExoPhone")->Option.getExn(
            ~message="merchantExoPhone not found",
          ),
          paymentMethodId: getOptionString(dict, "paymentMethodId"),
          paymentUrl: getOptionString(dict, "paymentUrl"),
          returnTime: getOptionString(dict, "returnTime"),
          rideEndTime: getOptionString(dict, "rideEndTime"),
          rideList: dict
          ->Dict.get("rideList")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="rideList is not of array")
          ->Array.map(x =>
            decodeRideAPIEntity(x)->Utils.getResultExn(~message="rideList is coming as undefined")
          ),
          rideScheduledTime: getOptionString(dict, "rideScheduledTime")->Option.getExn(
            ~message="rideScheduledTime not found",
          ),
          rideStartTime: getOptionString(dict, "rideStartTime"),
          serviceTierName: getOptionString(dict, "serviceTierName"),
          serviceTierShortDesc: getOptionString(dict, "serviceTierShortDesc"),
          sosStatus: SosStatus.decodeSosStatusResult(dict, "sosStatus")->Result.mapOr(
            None,
            x => Some(x),
          ),
          specialLocationName: getOptionString(dict, "specialLocationName"),
          specialLocationTag: getOptionString(dict, "specialLocationTag"),
          status: BookingStatus.decodeBookingStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          tripCategory: dict
          ->Dict.get("tripCategory")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeTripCategory(x)->Result.mapOr(None, x => Some(x))),
          tripTerms: getOptionStrArrayFromDict(dict, "tripTerms")->Option.getExn(
            ~message="tripTerms not found",
          ),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
          vehicleIconUrl: getOptionString(dict, "vehicleIconUrl"),
          vehicleServiceTierAirConditioned: getOptionFloat(
            dict,
            "vehicleServiceTierAirConditioned",
          ),
          vehicleServiceTierSeatingCapacity: getOptionInt(
            dict,
            "vehicleServiceTierSeatingCapacity",
          ),
          vehicleServiceTierType: ServiceTierType.decodeServiceTierTypeResult(
            dict,
            "vehicleServiceTierType",
          )->Utils.getResultExn(~message="vehicleServiceTierType is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingAPIEntity) => {
  req->asJson
}
