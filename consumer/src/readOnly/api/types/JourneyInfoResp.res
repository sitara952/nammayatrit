open Enums
open CumulativeOfferResp
open Distance
open LegInfo
open PriceAPIEntity
open Utils

@genType
type journeyInfoResp = {
  createdAt: string,
  endTime: option<string>,
  estimatedDistance: distance,
  estimatedDuration: option<int>,
  estimatedMaxFare: priceAPIEntity,
  estimatedMinFare: priceAPIEntity,
  isSingleMode: option<bool>,
  journeyId: string,
  journeyStatus: JourneyStatus.journeyStatus,
  legs: array<legInfo>,
  merchantOperatingCityName: option<string>,
  offer: option<cumulativeOfferResp>,
  paymentOrderShortId: option<string>,
  result: option<string>,
  startTime: option<string>,
  unifiedQRV2: option<string>,
}

let decodeJourneyInfoResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
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
          estimatedMaxFare: dict
          ->Dict.get("estimatedMaxFare")
          ->Option.getExn(~message="estimatedMaxFare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="estimatedMaxFare is coming as undefined"),
          estimatedMinFare: dict
          ->Dict.get("estimatedMinFare")
          ->Option.getExn(~message="estimatedMinFare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="estimatedMinFare is coming as undefined"),
          isSingleMode: getOptionBool(dict, "isSingleMode"),
          journeyId: getOptionString(dict, "journeyId")->Option.getExn(
            ~message="journeyId not found",
          ),
          journeyStatus: JourneyStatus.decodeJourneyStatusResult(
            dict,
            "journeyStatus",
          )->Utils.getResultExn(~message="journeyStatus is coming as undefined"),
          legs: dict
          ->Dict.get("legs")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="legs is not of array")
          ->Array.map(x =>
            decodeLegInfo(x)->Utils.getResultExn(~message="legs is coming as undefined")
          ),
          merchantOperatingCityName: getOptionString(dict, "merchantOperatingCityName"),
          offer: dict
          ->Dict.get("offer")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeCumulativeOfferResp(x)->Result.mapOr(None, x => Some(x))),
          paymentOrderShortId: getOptionString(dict, "paymentOrderShortId"),
          result: getOptionString(dict, "result"),
          startTime: getOptionString(dict, "startTime"),
          unifiedQRV2: getOptionalJsonAsString(dict, "unifiedQRV2"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyInfoResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyInfoResp) => {
  req->asJson
}
