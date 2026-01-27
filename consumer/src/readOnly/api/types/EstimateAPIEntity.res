open Enums
open BusinessDiscountInfoAPIEntity
open EstimateBreakupAPIEntity
open FareRangeAPIEntity
open LatLong
open NightShiftInfoAPIEntity
open NightShiftRateAPIEntity
open PriceAPIEntity
open TollChargesInfoAPIEntity
open TripCategory
open WaitingChargesAPIEntity
open Utils

@genType
type estimateAPIEntity = {
  agencyCompletedRidesCount: int,
  agencyName: string,
  agencyNumber: string,
  boostSearchPreSelectionServiceTierConfig: option<array<ServiceTierType.serviceTierType>>,
  businessDiscountInfo: option<businessDiscountInfoAPIEntity>,
  createdAt: string,
  discount: option<int>,
  discountWithCurrency: option<priceAPIEntity>,
  driversLatLong: array<latLong>,
  estimateFareBreakup: array<estimateBreakupAPIEntity>,
  estimatedFare: int,
  estimatedFareWithCurrency: priceAPIEntity,
  estimatedPickupDuration: option<int>,
  estimatedTotalFare: int,
  estimatedTotalFareWithCurrency: priceAPIEntity,
  id: string,
  insuredAmount: option<string>,
  isAirConditioned: option<bool>,
  isBlockedRoute: option<bool>,
  isCustomerPrefferedSearchRoute: option<bool>,
  isInsured: option<bool>,
  isReferredRide: bool,
  isValueAddNP: bool,
  nightShiftInfo: option<nightShiftInfoAPIEntity>,
  nightShiftRate: option<nightShiftRateAPIEntity>,
  providerDescription: option<string>,
  providerId: string,
  providerLogoUrl: option<string>,
  providerName: string,
  serviceTierName: option<string>,
  serviceTierShortDesc: option<string>,
  serviceTierType: ServiceTierType.serviceTierType,
  smartTipReason: option<string>,
  smartTipSuggestion: option<float>,
  specialLocationTag: option<string>,
  tipOptions: option<array<int>>,
  tollChargesInfo: option<tollChargesInfoAPIEntity>,
  totalFareRange: fareRangeAPIEntity,
  tripCategory: option<tripCategory>,
  tripTerms: array<string>,
  validTill: string,
  vehicleIconUrl: option<string>,
  vehicleServiceTierAirConditioned: option<float>,
  vehicleServiceTierSeatingCapacity: option<int>,
  vehicleVariant: VehicleVariant.vehicleVariant,
  waitingCharges: waitingChargesAPIEntity,
}

let decodeEstimateAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          agencyCompletedRidesCount: getOptionInt(dict, "agencyCompletedRidesCount")->Option.getExn(
            ~message="agencyCompletedRidesCount not found",
          ),
          agencyName: getOptionString(dict, "agencyName")->Option.getExn(
            ~message="agencyName not found",
          ),
          agencyNumber: getOptionString(dict, "agencyNumber")->Option.getExn(
            ~message="agencyNumber not found",
          ),
          boostSearchPreSelectionServiceTierConfig: dict
          ->Dict.get("boostSearchPreSelectionServiceTierConfig")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              ServiceTierType.decodeServiceTierType(x)->Utils.getResultExn(
                ~message="boostSearchPreSelectionServiceTierConfig is coming as undefined",
              )
            )
          ),
          businessDiscountInfo: dict
          ->Dict.get("businessDiscountInfo")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeBusinessDiscountInfoAPIEntity(x)->Result.mapOr(None, x => Some(x))
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          discount: getOptionInt(dict, "discount"),
          discountWithCurrency: dict
          ->Dict.get("discountWithCurrency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          driversLatLong: dict
          ->Dict.get("driversLatLong")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="driversLatLong is not of array")
          ->Array.map(x =>
            decodeLatLong(x)->Utils.getResultExn(~message="driversLatLong is coming as undefined")
          ),
          estimateFareBreakup: dict
          ->Dict.get("estimateFareBreakup")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="estimateFareBreakup is not of array")
          ->Array.map(x =>
            decodeEstimateBreakupAPIEntity(x)->Utils.getResultExn(
              ~message="estimateFareBreakup is coming as undefined",
            )
          ),
          estimatedFare: getOptionInt(dict, "estimatedFare")->Option.getExn(
            ~message="estimatedFare not found",
          ),
          estimatedFareWithCurrency: dict
          ->Dict.get("estimatedFareWithCurrency")
          ->Option.getExn(~message="estimatedFareWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="estimatedFareWithCurrency is coming as undefined"),
          estimatedPickupDuration: getOptionInt(dict, "estimatedPickupDuration"),
          estimatedTotalFare: getOptionInt(dict, "estimatedTotalFare")->Option.getExn(
            ~message="estimatedTotalFare not found",
          ),
          estimatedTotalFareWithCurrency: dict
          ->Dict.get("estimatedTotalFareWithCurrency")
          ->Option.getExn(~message="estimatedTotalFareWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="estimatedTotalFareWithCurrency is coming as undefined"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          insuredAmount: getOptionString(dict, "insuredAmount"),
          isAirConditioned: getOptionBool(dict, "isAirConditioned"),
          isBlockedRoute: getOptionBool(dict, "isBlockedRoute"),
          isCustomerPrefferedSearchRoute: getOptionBool(dict, "isCustomerPrefferedSearchRoute"),
          isInsured: getOptionBool(dict, "isInsured"),
          isReferredRide: getOptionBool(dict, "isReferredRide")->Option.getExn(
            ~message="isReferredRide not found",
          ),
          isValueAddNP: getOptionBool(dict, "isValueAddNP")->Option.getExn(
            ~message="isValueAddNP not found",
          ),
          nightShiftInfo: dict
          ->Dict.get("nightShiftInfo")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeNightShiftInfoAPIEntity(x)->Result.mapOr(None, x => Some(x))
          ),
          nightShiftRate: dict
          ->Dict.get("nightShiftRate")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeNightShiftRateAPIEntity(x)->Result.mapOr(None, x => Some(x))
          ),
          providerDescription: getOptionString(dict, "providerDescription"),
          providerId: getOptionString(dict, "providerId")->Option.getExn(
            ~message="providerId not found",
          ),
          providerLogoUrl: getOptionString(dict, "providerLogoUrl"),
          providerName: getOptionString(dict, "providerName")->Option.getExn(
            ~message="providerName not found",
          ),
          serviceTierName: getOptionString(dict, "serviceTierName"),
          serviceTierShortDesc: getOptionString(dict, "serviceTierShortDesc"),
          serviceTierType: ServiceTierType.decodeServiceTierTypeResult(
            dict,
            "serviceTierType",
          )->Utils.getResultExn(~message="serviceTierType is coming as undefined"),
          smartTipReason: getOptionString(dict, "smartTipReason"),
          smartTipSuggestion: getOptionFloat(dict, "smartTipSuggestion"),
          specialLocationTag: getOptionString(dict, "specialLocationTag"),
          tipOptions: getOptionIntArrayFromDict(dict, "tipOptions"),
          tollChargesInfo: dict
          ->Dict.get("tollChargesInfo")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeTollChargesInfoAPIEntity(x)->Result.mapOr(None, x => Some(x))
          ),
          totalFareRange: dict
          ->Dict.get("totalFareRange")
          ->Option.getExn(~message="totalFareRange is not found")
          ->decodeFareRangeAPIEntity
          ->Utils.getResultExn(~message="totalFareRange is coming as undefined"),
          tripCategory: dict
          ->Dict.get("tripCategory")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeTripCategory(x)->Result.mapOr(None, x => Some(x))),
          tripTerms: getOptionStrArrayFromDict(dict, "tripTerms")->Option.getExn(
            ~message="tripTerms not found",
          ),
          validTill: getOptionString(dict, "validTill")->Option.getExn(
            ~message="validTill not found",
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
          vehicleVariant: VehicleVariant.decodeVehicleVariantResult(
            dict,
            "vehicleVariant",
          )->Utils.getResultExn(~message="vehicleVariant is coming as undefined"),
          waitingCharges: dict
          ->Dict.get("waitingCharges")
          ->Option.getExn(~message="waitingCharges is not found")
          ->decodeWaitingChargesAPIEntity
          ->Utils.getResultExn(~message="waitingCharges is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EstimateAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: estimateAPIEntity) => {
  req->asJson
}
