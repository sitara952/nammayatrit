open Enums
open Distance
open LatLong
open RouteDetail
open Utils

@genType
type journeyLeg = {
  color: option<string>,
  colorCode: option<string>,
  distance: option<distance>,
  duration: option<int>,
  estimatedMaxFare: option<float>,
  estimatedMinFare: option<float>,
  fromLatLong: latLong,
  fromStationCode: option<string>,
  journeyLegId: string,
  journeyLegOrder: int,
  journeyMode: MultimodalTravelMode.multimodalTravelMode,
  routeDetails: array<routeDetail>,
  serviceTypes: option<array<FRFSServiceTierType.fRFSServiceTierType>>,
  toLatLong: latLong,
  toStationCode: option<string>,
  validTill: option<string>,
}

let decodeJourneyLeg = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          color: getOptionString(dict, "color"),
          colorCode: getOptionString(dict, "colorCode"),
          distance: dict
          ->Dict.get("distance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          duration: getOptionInt(dict, "duration"),
          estimatedMaxFare: getOptionFloat(dict, "estimatedMaxFare"),
          estimatedMinFare: getOptionFloat(dict, "estimatedMinFare"),
          fromLatLong: dict
          ->Dict.get("fromLatLong")
          ->Option.getExn(~message="fromLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="fromLatLong is coming as undefined"),
          fromStationCode: getOptionString(dict, "fromStationCode"),
          journeyLegId: getOptionString(dict, "journeyLegId")->Option.getExn(
            ~message="journeyLegId not found",
          ),
          journeyLegOrder: getOptionInt(dict, "journeyLegOrder")->Option.getExn(
            ~message="journeyLegOrder not found",
          ),
          journeyMode: MultimodalTravelMode.decodeMultimodalTravelModeResult(
            dict,
            "journeyMode",
          )->Utils.getResultExn(~message="journeyMode is coming as undefined"),
          routeDetails: dict
          ->Dict.get("routeDetails")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="routeDetails is not of array")
          ->Array.map(x =>
            decodeRouteDetail(x)->Utils.getResultExn(~message="routeDetails is coming as undefined")
          ),
          serviceTypes: dict
          ->Dict.get("serviceTypes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              FRFSServiceTierType.decodeFRFSServiceTierType(x)->Utils.getResultExn(
                ~message="serviceTypes is coming as undefined",
              )
            )
          ),
          toLatLong: dict
          ->Dict.get("toLatLong")
          ->Option.getExn(~message="toLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="toLatLong is coming as undefined"),
          toStationCode: getOptionString(dict, "toStationCode"),
          validTill: getOptionString(dict, "validTill"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyLeg ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyLeg) => {
  req->asJson
}
