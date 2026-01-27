open Enums
open LatLong
open SearchReqLocation
open Utils
open BusLocation

@genType
type publicTransportSearchReq = {
  busLocationData: array<busLocation>,
  currentLocation: option<latLong>,
  destination: option<searchReqLocation>,
  destinationStopCode: string,
  firstMileRemoved: option<bool>,
  origin: searchReqLocation,
  originStopCode: string,
  platformType: option<PlatformType.platformType>,
  recentLocationId: option<string>,
  routeCode: option<string>,
  startTime: option<string>,
  vehicleCategory: option<VehicleCategory.vehicleCategory>,
  vehicleNumber: option<string>,
  routeCodeEditedManually: option<bool>,
}

let decodePublicTransportSearchReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          busLocationData: dict
          ->Dict.get("busLocationData")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="buses is not of array")
          ->Array.map(x =>
            decodeBusLocation(x)->Utils.getResultExn(~message="buses is coming as undefined")
          ),
          currentLocation: dict
          ->Dict.get("currentLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          destination: dict
          ->Dict.get("destination")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeSearchReqLocation(x)->Result.mapOr(None, x => Some(x))),
          destinationStopCode: getOptionString(dict, "destinationStopCode")->Option.getExn(
            ~message="destinationStopCode not found",
          ),
          firstMileRemoved: getOptionBool(dict, "firstMileRemoved"),
          origin: dict
          ->Dict.get("origin")
          ->Option.getExn(~message="origin is not found")
          ->decodeSearchReqLocation
          ->Utils.getResultExn(~message="origin is coming as undefined"),
          originStopCode: getOptionString(dict, "originStopCode")->Option.getExn(
            ~message="originStopCode not found",
          ),
          platformType: PlatformType.decodePlatformTypeResult(
            dict,
            "platformType",
          )->Result.mapOr(None, x => Some(x)),
          recentLocationId: getOptionString(dict, "recentLocationId"),
          routeCode: getOptionString(dict, "routeCode"),
          startTime: getOptionString(dict, "startTime"),
          vehicleCategory: VehicleCategory.decodeVehicleCategoryResult(
            dict,
            "vehicleCategory",
          )->Result.mapOr(None, x => Some(x)),
          vehicleNumber: getOptionString(dict, "vehicleNumber"),
          routeCodeEditedManually: getOptionBool(dict, "routeCodeEditedManually"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PublicTransportSearchReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: publicTransportSearchReq) => {
  req->asJson
}
