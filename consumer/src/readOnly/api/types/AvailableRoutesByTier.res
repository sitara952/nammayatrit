open Enums
open AvailableRoutesInfo
open PriceAPIEntity
open Utils

@genType
type availableRoutesByTier = {
  availableRoutes: array<string>,
  availableRoutesInfo: array<availableRoutesInfo>,
  fare: priceAPIEntity,
  nextAvailableBuses: array<int>,
  nextAvailableTimings: array<array<string>>,
  quoteId: option<string>,
  serviceTier: FRFSServiceTierType.fRFSServiceTierType,
  serviceTierDescription: option<string>,
  serviceTierName: option<string>,
  source: SourceType.sourceType,
  trainTypeCode: option<string>,
  via: option<string>,
}

let decodeAvailableRoutesByTier = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          availableRoutes: getOptionStrArrayFromDict(dict, "availableRoutes")->Option.getExn(
            ~message="availableRoutes not found",
          ),
          availableRoutesInfo: dict
          ->Dict.get("availableRoutesInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="availableRoutesInfo is not of array")
          ->Array.map(x =>
            decodeAvailableRoutesInfo(x)->Utils.getResultExn(
              ~message="availableRoutesInfo is coming as undefined",
            )
          ),
          fare: dict
          ->Dict.get("fare")
          ->Option.getExn(~message="fare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="fare is coming as undefined"),
          nextAvailableBuses: getOptionIntArrayFromDict(dict, "nextAvailableBuses")->Option.getExn(
            ~message="nextAvailableBuses not found",
          ),
          nextAvailableTimings: dict
          ->Dict.get("nextAvailableTimings")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="nextAvailableTimings not found")
          ->Array.map(innerArray =>
            innerArray
            ->Js.Json.decodeArray
            ->Option.getExn(~message="inner array decode failed")
            ->Array.filterMap(x => Js.Json.decodeString(x))
          ),
          quoteId: getOptionString(dict, "quoteId"),
          serviceTier: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceTier",
          )->Utils.getResultExn(~message="serviceTier is coming as undefined"),
          serviceTierDescription: getOptionString(dict, "serviceTierDescription"),
          serviceTierName: getOptionString(dict, "serviceTierName"),
          source: SourceType.decodeSourceTypeResult(dict, "source")->Utils.getResultExn(
            ~message="source is coming as undefined",
          ),
          trainTypeCode: getOptionString(dict, "trainTypeCode"),
          via: getOptionString(dict, "via"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AvailableRoutesByTier ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: availableRoutesByTier) => {
  req->asJson
}
