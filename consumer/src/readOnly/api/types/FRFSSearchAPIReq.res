open Enums
open BusLocation
open JourneySearchData
open Utils

@genType
type fRFSSearchAPIReq = {
  busLocationData: option<array<busLocation>>,
  fromStationCode: string,
  journeySearchData: option<journeySearchData>,
  quantity: int,
  recentLocationId: option<string>,
  routeCode: option<string>,
  searchAsParentStops: option<bool>,
  serviceTier: option<FRFSServiceTierType.fRFSServiceTierType>,
  toStationCode: string,
  vehicleNumber: option<string>,
  platformType: option<PlatformType.platformType>,
}

let decodeFRFSSearchAPIReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          busLocationData: dict
          ->Dict.get("busLocationData")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeBusLocation(x)->Utils.getResultExn(
                ~message="busLocationData is coming as undefined",
              )
            )
          ),
          fromStationCode: getOptionString(dict, "fromStationCode")->Option.getExn(
            ~message="fromStationCode not found",
          ),
          journeySearchData: dict
          ->Dict.get("journeySearchData")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeJourneySearchData(x)->Result.mapOr(None, x => Some(x))),
          quantity: getOptionInt(dict, "quantity")->Option.getExn(~message="quantity not found"),
          recentLocationId: getOptionString(dict, "recentLocationId"),
          routeCode: getOptionString(dict, "routeCode"),
          searchAsParentStops: getOptionBool(dict, "searchAsParentStops"),
          serviceTier: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "serviceTier",
          )->Result.mapOr(None, x => Some(x)),
          toStationCode: getOptionString(dict, "toStationCode")->Option.getExn(
            ~message="toStationCode not found",
          ),
          vehicleNumber: getOptionString(dict, "vehicleNumber"),
          platformType: PlatformType.decodePlatformTypeResult(
            dict,
            "platformType",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSSearchAPIReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSSearchAPIReq) => {
  req->asJson
}
