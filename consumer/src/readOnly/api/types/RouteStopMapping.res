open Enums
open LatLong
open Utils

@genType
type routeStopMapping = {
  createdAt: string,
  estimatedTravelTimeFromPreviousStop: option<int>,
  merchantId: string,
  merchantOperatingCityId: string,
  providerCode: string,
  routeCode: string,
  sequenceNum: int,
  stopCode: string,
  stopName: string,
  stopPoint: latLong,
  updatedAt: string,
  vehicleType: VehicleCategory.vehicleCategory,
}

let decodeRouteStopMapping = data => {
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
          estimatedTravelTimeFromPreviousStop: getOptionInt(
            dict,
            "estimatedTravelTimeFromPreviousStop",
          ),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId")->Option.getExn(
            ~message="merchantOperatingCityId not found",
          ),
          providerCode: getOptionString(dict, "providerCode")->Option.getExn(
            ~message="providerCode not found",
          ),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          sequenceNum: getOptionInt(dict, "sequenceNum")->Option.getExn(
            ~message="sequenceNum not found",
          ),
          stopCode: getOptionString(dict, "stopCode")->Option.getExn(~message="stopCode not found"),
          stopName: getOptionString(dict, "stopName")->Option.getExn(~message="stopName not found"),
          stopPoint: dict
          ->Dict.get("stopPoint")
          ->Option.getExn(~message="stopPoint is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="stopPoint is coming as undefined"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
          vehicleType: VehicleCategory.decodeVehicleCategoryResult(
            dict,
            "vehicleType",
          )->Utils.getResultExn(~message="vehicleType is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RouteStopMapping ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: routeStopMapping) => {
  req->asJson
}
