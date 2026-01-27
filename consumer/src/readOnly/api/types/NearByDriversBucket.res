open Enums
open DriverInfo
open Utils

@genType
type nearByDriversBucket = {
  driverInfo: array<driverInfo>,
  radius: int,
  variant: VehicleVariant.vehicleVariant,
}

let decodeNearByDriversBucket = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          driverInfo: dict
          ->Dict.get("driverInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="driverInfo is not of array")
          ->Array.map(x =>
            decodeDriverInfo(x)->Utils.getResultExn(~message="driverInfo is coming as undefined")
          ),
          radius: getOptionInt(dict, "radius")->Option.getExn(~message="radius not found"),
          variant: VehicleVariant.decodeVehicleVariantResult(dict, "variant")->Utils.getResultExn(
            ~message="variant is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NearByDriversBucket ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nearByDriversBucket) => {
  req->asJson
}
