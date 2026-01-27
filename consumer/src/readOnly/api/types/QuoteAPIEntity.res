open Enums
open PriceAPIEntity
open QuoteAPIDetails
open QuoteBreakupAPIEntity
open Utils
open TripCategory

@genType
type quoteAPIEntity = {
  agencyCompletedRidesCount: option<int>,
  agencyName: string,
  agencyNumber: option<string>,
  createdAt: string,
  discount: option<int>,
  discountWithCurrency: option<priceAPIEntity>,
  estimatedFare: int,
  estimatedFareWithCurrency: priceAPIEntity,
  estimatedPickupDuration: option<int>,
  estimatedTotalFare: int,
  estimatedTotalFareWithCurrency: priceAPIEntity,
  id: string,
  isAirConditioned: option<bool>,
  isValueAddNP: bool,
  quoteDetails: quoteAPIDetails,
  quoteFareBreakup: array<quoteBreakupAPIEntity>,
  serviceTierName: option<string>,
  serviceTierShortDesc: option<string>,
  specialLocationTag: option<string>,
  tripTerms: array<string>,
  validTill: string,
  vehicleIconUrl: option<string>,
  vehicleServiceTierAirConditioned: option<float>,
  vehicleServiceTierSeatingCapacity: option<int>,
  vehicleVariant: ServiceTierType.serviceTierType,
  tripCategory: option<tripCategory>,
}

let decodeQuoteAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          agencyCompletedRidesCount: getOptionInt(dict, "agencyCompletedRidesCount"),
          agencyName: getOptionString(dict, "agencyName")->Option.getExn(
            ~message="agencyName not found",
          ),
          agencyNumber: getOptionString(dict, "agencyNumber"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          discount: getOptionInt(dict, "discount"),
          discountWithCurrency: dict
          ->Dict.get("discountWithCurrency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
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
          isAirConditioned: getOptionBool(dict, "isAirConditioned"),
          isValueAddNP: getOptionBool(dict, "isValueAddNP")->Option.getExn(
            ~message="isValueAddNP not found",
          ),
          quoteDetails: dict
          ->Dict.get("quoteDetails")
          ->Option.getExn(~message="quoteDetails is not found")
          ->decodeQuoteAPIDetails
          ->Utils.getResultExn(~message="quoteDetails is coming as undefined"),
          quoteFareBreakup: dict
          ->Dict.get("quoteFareBreakup")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="quoteFareBreakup is not of array")
          ->Array.map(x =>
            decodeQuoteBreakupAPIEntity(x)->Utils.getResultExn(
              ~message="quoteFareBreakup is coming as undefined",
            )
          ),
          serviceTierName: getOptionString(dict, "serviceTierName"),
          serviceTierShortDesc: getOptionString(dict, "serviceTierShortDesc"),
          specialLocationTag: getOptionString(dict, "specialLocationTag"),
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
          vehicleVariant: ServiceTierType.decodeServiceTierTypeResult(
            dict,
            "vehicleVariant",
          )->Utils.getResultExn(~message="vehicleVariant is coming as undefined"),
          tripCategory: dict
          ->Dict.get("tripCategory")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeTripCategory(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("QuoteAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: quoteAPIEntity) => {
  req->asJson
}
