open Enums
open Distance
open PriceAPIEntity
open StopInformation
open Utils

@genType
type rideAPIEntity = {
  allowedEditLocationAttempts: int,
  allowedEditPickupLocationAttempts: int,
  bppRideId: string,
  billingCategory: BillingCategory.billingCategory,
  cancellationChargesOnCancel: option<float>,
  cancellationFeeIfCancelled: option<float>,
  chargeableRideDistance: option<float>,
  chargeableRideDistanceWithUnit: option<distance>,
  computedPrice: option<int>,
  computedPriceWithCurrency: option<priceAPIEntity>,
  createdAt: string,
  destinationReachedAt: option<string>,
  driverArrivalTime: option<string>,
  driverImage: option<string>,
  driverName: string,
  driverNumber: option<string>,
  driverRatings: option<float>,
  driverRegisteredAt: option<string>,
  endOdometerReading: option<float>,
  endOtp: option<string>,
  favCount: option<int>,
  feedbackSkipped: bool,
  id: string,
  insuredAmount: option<string>,
  isAlreadyFav: option<bool>,
  isFreeRide: option<bool>,
  isInsured: option<bool>,
  onlinePayment: bool,
  rideEndTime: option<string>,
  rideOtp: string,
  rideRating: option<int>,
  rideStartTime: option<string>,
  shortRideId: string,
  startOdometerReading: option<float>,
  status: RideStatus.rideStatus,
  stopsInfo: array<stopInformation>,
  tollConfidence: option<Confidence.confidence>,
  traveledRideDistance: option<distance>,
  updatedAt: string,
  vehicleAge: option<int>,
  vehicleColor: string,
  vehicleModel: string,
  vehicleNumber: string,
  vehicleServiceTierType: option<ServiceTierType.serviceTierType>,
  vehicleVariant: VehicleVariant.vehicleVariant,
}

let decodeRideAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowedEditLocationAttempts: getOptionInt(
            dict,
            "allowedEditLocationAttempts",
          )->Option.getExn(~message="allowedEditLocationAttempts not found"),
          allowedEditPickupLocationAttempts: getOptionInt(
            dict,
            "allowedEditPickupLocationAttempts",
          )->Option.getExn(~message="allowedEditPickupLocationAttempts not found"),
          billingCategory: BillingCategory.decodeBillingCategoryResult(
            dict,
            "billingCategory",
          )->Utils.getResultExn(~message="billingCategory is coming as undefined"),
          bppRideId: getOptionString(dict, "bppRideId")->Option.getExn(
            ~message="bppRideId not found",
          ),

          cancellationChargesOnCancel: getOptionFloat(dict, "cancellationChargesOnCancel"),
          cancellationFeeIfCancelled: getOptionFloat(dict, "cancellationFeeIfCancelled"),
          chargeableRideDistance: getOptionFloat(dict, "chargeableRideDistance"),
          chargeableRideDistanceWithUnit: dict
          ->Dict.get("chargeableRideDistanceWithUnit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          computedPrice: getOptionInt(dict, "computedPrice"),
          computedPriceWithCurrency: dict
          ->Dict.get("computedPriceWithCurrency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          destinationReachedAt: getOptionString(dict, "destinationReachedAt"),
          driverArrivalTime: getOptionString(dict, "driverArrivalTime"),
          driverImage: getOptionString(dict, "driverImage"),
          driverName: getOptionString(dict, "driverName")->Option.getExn(
            ~message="driverName not found",
          ),
          driverNumber: getOptionString(dict, "driverNumber"),
          driverRatings: getOptionFloat(dict, "driverRatings"),
          driverRegisteredAt: getOptionString(dict, "driverRegisteredAt"),
          endOdometerReading: getOptionFloat(dict, "endOdometerReading"),
          endOtp: getOptionString(dict, "endOtp"),
          favCount: getOptionInt(dict, "favCount"),
          feedbackSkipped: getOptionBool(dict, "feedbackSkipped")->Option.getExn(
            ~message="feedbackSkipped not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          insuredAmount: getOptionString(dict, "insuredAmount"),
          isAlreadyFav: getOptionBool(dict, "isAlreadyFav"),
          isFreeRide: getOptionBool(dict, "isFreeRide"),
          isInsured: getOptionBool(dict, "isInsured"),
          onlinePayment: getOptionBool(dict, "onlinePayment")->Option.getExn(
            ~message="onlinePayment not found",
          ),
          rideEndTime: getOptionString(dict, "rideEndTime"),
          rideOtp: getOptionString(dict, "rideOtp")->Option.getExn(~message="rideOtp not found"),
          rideRating: getOptionInt(dict, "rideRating"),
          rideStartTime: getOptionString(dict, "rideStartTime"),
          shortRideId: getOptionString(dict, "shortRideId")->Option.getExn(
            ~message="shortRideId not found",
          ),
          startOdometerReading: getOptionFloat(dict, "startOdometerReading"),
          status: RideStatus.decodeRideStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          stopsInfo: dict
          ->Dict.get("stopsInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stopsInfo is not of array")
          ->Array.map(x =>
            decodeStopInformation(x)->Utils.getResultExn(
              ~message="stopsInfo is coming as undefined",
            )
          ),
          tollConfidence: Confidence.decodeConfidenceResult(
            dict,
            "tollConfidence",
          )->Result.mapOr(None, x => Some(x)),
          traveledRideDistance: dict
          ->Dict.get("traveledRideDistance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
          vehicleAge: getOptionInt(dict, "vehicleAge"),
          vehicleColor: getOptionString(dict, "vehicleColor")->Option.getExn(
            ~message="vehicleColor not found",
          ),
          vehicleModel: getOptionString(dict, "vehicleModel")->Option.getExn(
            ~message="vehicleModel not found",
          ),
          vehicleNumber: getOptionString(dict, "vehicleNumber")->Option.getExn(
            ~message="vehicleNumber not found",
          ),
          vehicleServiceTierType: ServiceTierType.decodeServiceTierTypeResult(
            dict,
            "vehicleServiceTierType",
          )->Result.mapOr(None, x => Some(x)),
          vehicleVariant: VehicleVariant.decodeVehicleVariantResult(
            dict,
            "vehicleVariant",
          )->Utils.getResultExn(~message="vehicleVariant is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RideAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rideAPIEntity) => {
  req->asJson
}
