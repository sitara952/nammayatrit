open Enums
open Utils

@genType
type nearbyBusesRequest = {
  platformType: PlatformType.platformType,
  requireNearbyBuses: bool,
  requireRecentRide: bool,
  userLat: float,
  userLon: float,
  vehicleType: VehicleCategory.vehicleCategory,
}

let decodeNearbyBusesRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          platformType: PlatformType.decodePlatformTypeResult(
            dict,
            "platformType",
          )->Utils.getResultExn(~message="platformType is coming as undefined"),
          requireNearbyBuses: getOptionBool(dict, "requireNearbyBuses")->Option.getExn(
            ~message="requireNearbyBuses not found",
          ),
          requireRecentRide: getOptionBool(dict, "requireRecentRide")->Option.getExn(
            ~message="requireRecentRide not found",
          ),
          userLat: getOptionFloat(dict, "userLat")->Option.getExn(~message="userLat not found"),
          userLon: getOptionFloat(dict, "userLon")->Option.getExn(~message="userLon not found"),
          vehicleType: VehicleCategory.decodeVehicleCategoryResult(
            dict,
            "vehicleType",
          )->Utils.getResultExn(~message="vehicleType is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NearbyBusesRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nearbyBusesRequest) => {
  req->asJson
}
