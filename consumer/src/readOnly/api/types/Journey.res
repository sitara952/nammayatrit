open Enums
open Distance
open Location
open Utils

@genType
type journey = {
  convenienceCost: int,
  createdAt: string,
  endTime: option<string>,
  estimatedDistance: distance,
  estimatedDuration: option<int>,
  fromLocation: location,
  hasPreferredServiceTier: option<bool>,
  hasPreferredTransitModes: option<bool>,
  id: string,
  isPaymentSuccess: option<bool>,
  isPublicTransportIncluded: option<bool>,
  isSingleMode: option<bool>,
  journeyExpiryTime: option<string>,
  merchantId: string,
  merchantOperatingCityId: string,
  modes: array<MultimodalTravelMode.multimodalTravelMode>,
  paymentOrderShortId: option<string>,
  recentLocationId: option<string>,
  relevanceScore: option<float>,
  riderId: string,
  searchRequestId: string,
  startTime: option<string>,
  status: JourneyStatus.journeyStatus,
  toLocation: option<location>,
  totalLegs: int,
  updatedAt: string,
}

let decodeJourney = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          convenienceCost: getOptionInt(dict, "convenienceCost")->Option.getExn(
            ~message="convenienceCost not found",
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          endTime: getOptionString(dict, "endTime"),
          estimatedDistance: dict
          ->Dict.get("estimatedDistance")
          ->Option.getExn(~message="estimatedDistance is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="estimatedDistance is coming as undefined"),
          estimatedDuration: getOptionInt(dict, "estimatedDuration"),
          fromLocation: dict
          ->Dict.get("fromLocation")
          ->Option.getExn(~message="fromLocation is not found")
          ->decodeLocation
          ->Utils.getResultExn(~message="fromLocation is coming as undefined"),
          hasPreferredServiceTier: getOptionBool(dict, "hasPreferredServiceTier"),
          hasPreferredTransitModes: getOptionBool(dict, "hasPreferredTransitModes"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          isPaymentSuccess: getOptionBool(dict, "isPaymentSuccess"),
          isPublicTransportIncluded: getOptionBool(dict, "isPublicTransportIncluded"),
          isSingleMode: getOptionBool(dict, "isSingleMode"),
          journeyExpiryTime: getOptionString(dict, "journeyExpiryTime"),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId")->Option.getExn(
            ~message="merchantOperatingCityId not found",
          ),
          modes: dict
          ->Dict.get("modes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="modes not found")
          ->Array.map(x =>
            MultimodalTravelMode.decodeMultimodalTravelMode(x)->Utils.getResultExn(
              ~message="modes is coming as undefined",
            )
          ),
          paymentOrderShortId: getOptionString(dict, "paymentOrderShortId"),
          recentLocationId: getOptionString(dict, "recentLocationId"),
          relevanceScore: getOptionFloat(dict, "relevanceScore"),
          riderId: getOptionString(dict, "riderId")->Option.getExn(~message="riderId not found"),
          searchRequestId: getOptionString(dict, "searchRequestId")->Option.getExn(
            ~message="searchRequestId not found",
          ),
          startTime: getOptionString(dict, "startTime"),
          status: JourneyStatus.decodeJourneyStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          toLocation: dict
          ->Dict.get("toLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocation(x)->Result.mapOr(None, x => Some(x))),
          totalLegs: getOptionInt(dict, "totalLegs")->Option.getExn(~message="totalLegs not found"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Journey ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journey) => {
  req->asJson
}
