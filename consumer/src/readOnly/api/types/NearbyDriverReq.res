open Enums
open LatLong
open Utils

@genType
type nearbyDriverReq = {
  location: latLong,
  radius: int,
  travelMode: option<MultimodalTravelMode.multimodalTravelMode>,
  vehicleVariants: option<array<VehicleVariant.vehicleVariant>>,
}

let decodeNearbyDriverReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          location: dict
          ->Dict.get("location")
          ->Option.getExn(~message="location is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="location is coming as undefined"),
          radius: getOptionInt(dict, "radius")->Option.getExn(~message="radius not found"),
          travelMode: MultimodalTravelMode.decodeMultimodalTravelModeResult(
            dict,
            "travelMode",
          )->Result.mapOr(None, x => Some(x)),
          vehicleVariants: dict
          ->Dict.get("vehicleVariants")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              VehicleVariant.decodeVehicleVariant(x)->Utils.getResultExn(
                ~message="vehicleVariants is coming as undefined",
              )
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NearbyDriverReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nearbyDriverReq) => {
  req->asJson
}
