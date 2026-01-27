open Enums
open Distance
open JourneyBookingStatus
open LegExtraInfo
open MultiModalLegGate
open PriceAPIEntity
open Utils

@genType
type legInfo = {
  actualDistance: option<distance>,
  bookingAllowed: bool,
  bookingStatus: journeyBookingStatus,
  entrance: option<multiModalLegGate>,
  estimatedChildFare: option<priceAPIEntity>,
  estimatedDistance: option<distance>,
  estimatedDuration: option<int>,
  estimatedMaxFare: option<priceAPIEntity>,
  estimatedMinFare: option<priceAPIEntity>,
  estimatedTotalFare: option<priceAPIEntity>,
  exit: option<multiModalLegGate>,
  hasApplicablePasses: option<bool>,
  journeyLegId: string,
  legExtraInfo: legExtraInfo,
  merchantId: string,
  merchantOperatingCityId: string,
  order: int,
  personId: string,
  pricingId: option<string>,
  searchId: string,
  startTime: string,
  totalFare: option<priceAPIEntity>,
  travelMode: MultimodalTravelMode.multimodalTravelMode,
  validTill: option<string>,
}

let decodeLegInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          actualDistance: dict
          ->Dict.get("actualDistance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          bookingAllowed: getOptionBool(dict, "bookingAllowed")->Option.getExn(
            ~message="bookingAllowed not found",
          ),
          bookingStatus: dict
          ->Dict.get("bookingStatus")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeJourneyBookingStatus(x)->Result.mapOr(None, x => Some(x)))
          ->Option.getExn(~message="bookingStatus not found"),
          entrance: dict
          ->Dict.get("entrance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeMultiModalLegGate(x)->Result.mapOr(None, x => Some(x))),
          estimatedChildFare: dict
          ->Dict.get("estimatedChildFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          estimatedDistance: dict
          ->Dict.get("estimatedDistance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          estimatedDuration: getOptionInt(dict, "estimatedDuration"),
          estimatedMaxFare: dict
          ->Dict.get("estimatedMaxFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          estimatedMinFare: dict
          ->Dict.get("estimatedMinFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          estimatedTotalFare: dict
          ->Dict.get("estimatedTotalFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          exit: dict
          ->Dict.get("exit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeMultiModalLegGate(x)->Result.mapOr(None, x => Some(x))),
          hasApplicablePasses: getOptionBool(dict, "hasApplicablePasses"),
          journeyLegId: getOptionString(dict, "journeyLegId")->Option.getExn(
            ~message="journeyLegId not found",
          ),
          legExtraInfo: dict
          ->Dict.get("legExtraInfo")
          ->Option.getExn(~message="legExtraInfo is not found")
          ->decodeLegExtraInfo
          ->Utils.getResultExn(~message="legExtraInfo is coming as undefined"),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId")->Option.getExn(
            ~message="merchantOperatingCityId not found",
          ),
          order: getOptionInt(dict, "order")->Option.getExn(~message="order not found"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          pricingId: getOptionString(dict, "pricingId"),
          searchId: getOptionString(dict, "searchId")->Option.getExn(~message="searchId not found"),
          startTime: getOptionString(dict, "startTime")->Option.getExn(
            ~message="startTime not found",
          ),
          totalFare: dict
          ->Dict.get("totalFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          travelMode: MultimodalTravelMode.decodeMultimodalTravelModeResult(
            dict,
            "travelMode",
          )->Utils.getResultExn(~message="travelMode is coming as undefined"),
          validTill: getOptionString(dict, "validTill"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legInfo) => {
  req->asJson
}
