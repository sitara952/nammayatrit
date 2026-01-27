open Enums
open NearbyVehicleInfo
open Utils

@genType
type vehicleDataBucket = {
  radius: int,
  travelMode: MultimodalTravelMode.multimodalTravelMode,
  vehicleInfo: nearbyVehicleInfo,
}

let decodeVehicleDataBucket = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          radius: getOptionInt(dict, "radius")->Option.getExn(~message="radius not found"),
          travelMode: MultimodalTravelMode.decodeMultimodalTravelModeResult(
            dict,
            "travelMode",
          )->Utils.getResultExn(~message="travelMode is coming as undefined"),
          vehicleInfo: dict
          ->Dict.get("vehicleInfo")
          ->Option.getExn(~message="vehicleInfo is not found")
          ->decodeNearbyVehicleInfo
          ->Utils.getResultExn(~message="vehicleInfo is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("VehicleDataBucket ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: vehicleDataBucket) => {
  req->asJson
}
