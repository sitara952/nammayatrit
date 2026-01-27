open Enums
open Distance
open LocationV2
open MultiModalAgency
open MultiModalLegGate
open MultiModalRouteDetails
open MultiModalStopDetails
open Polyline
open Utils

@genType
type multiModalLeg = {
  agency: option<multiModalAgency>,
  distance: distance,
  duration: int,
  endLocation: locationV2,
  entrance: option<multiModalLegGate>,
  exit: option<multiModalLegGate>,
  fromArrivalTime: option<string>,
  fromDepartureTime: option<string>,
  fromStopDetails: option<multiModalStopDetails>,
  mode: GeneralVehicleType.generalVehicleType,
  polyline: polyline,
  routeDetails: array<multiModalRouteDetails>,
  serviceTypes: array<string>,
  startLocation: locationV2,
  toArrivalTime: option<string>,
  toDepartureTime: option<string>,
  toStopDetails: option<multiModalStopDetails>,
}

let decodeMultiModalLeg = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          agency: dict
          ->Dict.get("agency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeMultiModalAgency(x)->Result.mapOr(None, x => Some(x))),
          distance: dict
          ->Dict.get("distance")
          ->Option.getExn(~message="distance is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="distance is coming as undefined"),
          duration: getOptionInt(dict, "duration")->Option.getExn(~message="duration not found"),
          endLocation: dict
          ->Dict.get("endLocation")
          ->Option.getExn(~message="endLocation is not found")
          ->decodeLocationV2
          ->Utils.getResultExn(~message="endLocation is coming as undefined"),
          entrance: dict
          ->Dict.get("entrance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeMultiModalLegGate(x)->Result.mapOr(None, x => Some(x))),
          exit: dict
          ->Dict.get("exit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeMultiModalLegGate(x)->Result.mapOr(None, x => Some(x))),
          fromArrivalTime: getOptionString(dict, "fromArrivalTime"),
          fromDepartureTime: getOptionString(dict, "fromDepartureTime"),
          fromStopDetails: dict
          ->Dict.get("fromStopDetails")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeMultiModalStopDetails(x)->Result.mapOr(None, x => Some(x))
          ),
          mode: GeneralVehicleType.decodeGeneralVehicleTypeResult(dict, "mode")->Utils.getResultExn(
            ~message="mode is coming as undefined",
          ),
          polyline: dict
          ->Dict.get("polyline")
          ->Option.getExn(~message="polyline is not found")
          ->decodePolyline
          ->Utils.getResultExn(~message="polyline is coming as undefined"),
          routeDetails: dict
          ->Dict.get("routeDetails")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="routeDetails is not of array")
          ->Array.map(x =>
            decodeMultiModalRouteDetails(x)->Utils.getResultExn(
              ~message="routeDetails is coming as undefined",
            )
          ),
          serviceTypes: getOptionStrArrayFromDict(dict, "serviceTypes")->Option.getExn(
            ~message="serviceTypes not found",
          ),
          startLocation: dict
          ->Dict.get("startLocation")
          ->Option.getExn(~message="startLocation is not found")
          ->decodeLocationV2
          ->Utils.getResultExn(~message="startLocation is coming as undefined"),
          toArrivalTime: getOptionString(dict, "toArrivalTime"),
          toDepartureTime: getOptionString(dict, "toDepartureTime"),
          toStopDetails: dict
          ->Dict.get("toStopDetails")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeMultiModalStopDetails(x)->Result.mapOr(None, x => Some(x))
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultiModalLeg ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multiModalLeg) => {
  req->asJson
}
